"""Main FastAPI application with ML model and database integration."""

import os
from random import sample, shuffle
from typing import List, Dict, Any, Optional
from contextlib import asynccontextmanager
from io import BytesIO
from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, text
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import OneHotEncoder
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.cluster import KMeans
from scipy.sparse import hstack
import numpy as np
from PIL import Image
from transformers import CLIPProcessor, CLIPModel
import chromadb
from chromadb.utils.embedding_functions import OpenCLIPEmbeddingFunction
from chromadb.utils.data_loaders import ImageLoader
from scipy.sparse import vstack
from constants import ARTICLE_TYPE_GROUPS, ACCESSORY_COMBINATIONS, SEASONAL_ACCESSORIES, COMPATIBLE_TYPES, COLOR_COMPATIBILITY
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- Configuration ---
DATABASE_URL = "mysql+pymysql://fashion_user:securepass@localhost/fashion_db"
STATIC_DIR = "static"
CHROMA_DB_PATH = "../../database/production_fashion.db"
CORS_ORIGINS = ["http://localhost:5173", "http://localhost:5174"]

# --- Models ---
class Item(BaseModel):
    id: int
    gender: str
    masterCategory: str
    subCategory: str
    articleType: str
    baseColour: Optional[str] = None
    season: str
    usage: str
    productDisplayName: str
    image_url: Optional[str] = None

class OutfitRecommendation(BaseModel):
    recommendations: Dict[str, List[Item]]

class ProductPageResponse(BaseModel):
    product: Item
    recommendations: OutfitRecommendation

class ProductsResponse(BaseModel):
    products: List[Item]

class SearchResult(BaseModel):
    images: List[Dict[str, Any]]

# --- Database Module ---
engine = create_engine(DATABASE_URL)

def load_data() -> pd.DataFrame:
    """Load data from the database."""
    with engine.connect() as conn:
        result = conn.execute(text("SELECT * FROM clothing_items"))
        items = result.mappings().all()
        df = pd.DataFrame(items)
        df["id"] = df["id"].astype(str)
        return df

def get_item(item_id: str) -> Dict[str, Any]:
    """Retrieve an item from the preloaded dataframe."""
    try:
        item = ml_model.df[ml_model.df["id"] == item_id].iloc[0].to_dict()
        item["id"] = int(item["id"])
        item["image_url"] = f"/static/images/{item['id']}.jpg"
        return item
    except IndexError:
        raise HTTPException(status_code=404, detail="Item not found")

# --- ML Module ---
class MLModel:
    """Class to store ML model and data for the application."""
    def __init__(self):
        self.df: Optional[pd.DataFrame] = None
        self.combined_features = None
        self.id_to_index: Dict[str, int] = {}
        self.onehot_encoder: Optional[OneHotEncoder] = None
        self.tfidf_vectorizer: Optional[TfidfVectorizer] = None
        self.clip_model: Optional[CLIPModel] = None
        self.clip_processor: Optional[CLIPProcessor] = None
        self.chroma_client: Optional[chromadb.Client] = None

ml_model = MLModel()

def init_ml_model() -> tuple:
    """Initialize the CLIP model and processor."""
    clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
    clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
    return clip_model, clip_processor

def preprocess_data(df: pd.DataFrame) -> tuple:
    """Preprocess the dataframe with enhanced features for ML model."""
    columns_to_fill = ["baseColour", "productDisplayName", "articleType", "gender",
                       "masterCategory", "subCategory", "season", "usage"]
    for col in columns_to_fill:
        df[col] = df[col].fillna("Unknown")

    categorical_cols = ["gender", "masterCategory", "subCategory", "articleType",
                        "baseColour", "season", "usage"]
    onehot_encoder = OneHotEncoder(handle_unknown="ignore", sparse_output=True)
    onehot_features = onehot_encoder.fit_transform(df[categorical_cols])

    # Increase TF-IDF granularity
    tfidf_vectorizer = TfidfVectorizer(stop_words="english", max_features=5000, ngram_range=(1, 2))
    tfidf_features = tfidf_vectorizer.fit_transform(df["productDisplayName"])

    combined_features = hstack([onehot_features, tfidf_features])
    id_to_index = {str(row["id"]): idx for idx, row in df.iterrows()}

    return onehot_encoder, tfidf_vectorizer, combined_features, id_to_index

def maximal_marginal_relevance(target_features, category_features, top_n: int, lambda_param: float = 0.1) -> np.ndarray:
    """Select highly diverse items using MMR."""
    selected_indices = []
    remaining_indices = list(range(category_features.shape[0]))

    similarities = cosine_similarity(target_features, category_features).flatten()
    first_idx = np.argmax(similarities)
    selected_indices.append(first_idx)
    remaining_indices.remove(first_idx)

    # Dynamic lambda: more diversity for larger pools, min 0.05
    dynamic_lambda = max(0.05, lambda_param - (len(remaining_indices) / 2000))

    for _ in range(min(top_n - 1, len(remaining_indices))):
        mmr_scores = []
        for idx in remaining_indices:
            relevance = similarities[idx]
            diversity = min(cosine_similarity(category_features[idx], category_features[selected_indices]).flatten())
            mmr_score = dynamic_lambda * relevance - (1 - dynamic_lambda) * diversity
            mmr_scores.append(mmr_score)

        next_idx = remaining_indices[np.argmax(mmr_scores)]
        selected_indices.append(next_idx)
        remaining_indices.remove(next_idx)

    return np.array(selected_indices)

def get_ml_recommendations(
    target_features,
    target_article_type: str,
    product_gender: str,
    target_color: str,
    target_id: Optional[str] = None,
    top_n: int = 3
) -> tuple[List[Dict], float, float, float]:
    """Generate recommendations with maximum diversity."""
    df = ml_model.df
    # Broaden pool with ARTICLE_TYPE_GROUPS and COMPATIBLE_TYPES
    target_group = next((group for group, types in ARTICLE_TYPE_GROUPS.items() if target_article_type in types), None)
    compatible_types = COMPATIBLE_TYPES.get(target_article_type, [])
    if target_group:
        candidate_types = list(set(ARTICLE_TYPE_GROUPS[target_group] + compatible_types))
    else:
        candidate_types = [target_article_type] + compatible_types

    mask = (df["articleType"].isin(candidate_types)) & (df["gender"].isin([product_gender, "Unisex"]))
    if target_id:
        mask &= (df["id"] != target_id)

    category_df = df[mask]
    logger.info(f"Initial filter: {len(category_df)} items for {target_article_type}, gender: {product_gender}")

    if category_df.empty:
        logger.warning(f"No items found for {target_article_type}")
        return [], 0.0, 0.0, 0.0

    color_scores = category_df["baseColour"].apply(lambda x: color_compatibility(target_color, x))
    min_threshold = 0.2 if len(category_df[color_scores >= 0.2]) >= top_n * 2 else 0.0
    category_df = category_df[color_scores >= min_threshold]
    logger.info(f"After color filter (threshold {min_threshold}): {len(category_df)} items")

    if category_df.empty:
        return [], 0.0, 0.0, 0.0

    category_indices = category_df.index.tolist()
    category_features = ml_model.combined_features[category_indices]
    color_matches = (category_df["baseColour"] == target_color).astype(float)

    similarities = cosine_similarity(target_features, category_features).flatten()
    similarities += similarities.max() * 0.05 * color_matches

    # Use MMR with maximum diversity emphasis
    top_indices = maximal_marginal_relevance(target_features, category_features, top_n, lambda_param=0.1)

    # Ensure at least two distinct colors
    results = []
    color_set = set()
    selected_positions = []
    for idx in top_indices:
        item = category_df.iloc[idx].to_dict()
        if len(color_set) < 2 or item["baseColour"] in color_set:
            results.append(item)
            color_set.add(item["baseColour"])
            selected_positions.append(idx)
        if len(results) == top_n:
            break

    # Fill with randomized remaining indices for variety
    if len(results) < top_n:
        remaining_indices = [i for i in top_indices if i not in selected_positions]
        shuffle(remaining_indices)  # Randomize for diversity
        for idx in remaining_indices:
            item = category_df.iloc[idx].to_dict()
            results.append(item)
            if len(results) == top_n:
                break

    for item in results:
        item["image_url"] = f"/static/images/{item['id']}.jpg"
        item["id"] = int(item["id"])

    logger.info(f"Recommended items: {[item['id'] for item in results]}")
    # logger.info(f"Item details: {[f'{item['articleType']} - {item['baseColour']}' for item in results]}")
    logger.info(f"Item details: [{item['articleType']} - {item['baseColour']} for item in results]")


    novelty_score = inverse_popularity_score(results)
    diversity_score = intra_list_diversity(results)
    serendipity_score = serendipity_measure(results, ml_model.df.iloc[ml_model.id_to_index[target_id]].to_dict()) if target_id else 0.0

    logger.info(f"Recommended {len(results)} items with novelty: {novelty_score}, diversity: {diversity_score}, serendipity: {serendipity_score}")
    return results, novelty_score, diversity_score, serendipity_score

# --- Utilities ---
def color_compatibility(color1: str, color2: str) -> float:
    """Calculate color compatibility score using COLOR_COMPATIBILITY dictionary."""
    if color1 == color2:
        return 1.0
    if color2 in COLOR_COMPATIBILITY.get(color1, []):
        return 0.8
    return 0.0

def check_negative_constraints(target_item: dict, candidate_item: dict) -> bool:
    """Check for incompatible combinations based on updated ARTICLE_TYPE_GROUPS."""
    def get_group(article_type: str) -> Optional[str]:
        for group_name, types in ARTICLE_TYPE_GROUPS.items():
            if article_type in types:
                return group_name
        return None

    target_group = get_group(target_item["articleType"])
    candidate_group = get_group(candidate_item["articleType"])

    if target_group is None or candidate_group is None:
        return True  # Assume compatible if not in any group

    # General rule: items from the same group are incompatible, except for accessories
    if target_group == candidate_group and target_group not in ["Accessories", "Jewellery", "Bags", "Makeup", "Skincare", "Bath and Body", "Haircare", "Fragrance", "Tech Accessories", "Home Decor"]:
        return False

    # Specific rules
    if target_group == "Trousers":
        if candidate_group in ["Casual Shoes", "Formal Shoes"]:
            if candidate_item["articleType"] in ["Sandals", "Flip Flops"] and target_item["usage"] != "Casual":
                return False
    if target_group in ["Shirts", "Tshirts", "Tops", "Dresses", "Suits"]:
        if candidate_group in ["Shirts", "Tshirts", "Tops", "Dresses", "Suits"]:
            return False
    if candidate_group == "Casual Shoes" and target_item["usage"] == "Formal":
        if candidate_item["articleType"] in ["Flip Flops", "Sports Sandals"]:
            return False
    # Add more specific rules as needed

    return True

def get_compatible_types(article_type: str) -> List[str]:
    """Get compatible article types from COMPATIBLE_TYPES."""
    return COMPATIBLE_TYPES.get(article_type, [])

def get_accessory_types(usage: str, season: str) -> List[str]:
    """Get accessory types based on usage and season."""
    accessory_list = ACCESSORY_COMBINATIONS.get(usage, []) + SEASONAL_ACCESSORIES.get(season, [])
    return list(set(accessory_list))

def get_dominant_color(image: Image.Image) -> np.ndarray:
    """Get the dominant color from an image."""
    image = image.resize((100, 100))
    img_array = np.array(image).reshape(-1, 3)
    kmeans = KMeans(n_clusters=3, random_state=0).fit(img_array)
    counts = np.bincount(kmeans.labels_)
    return kmeans.cluster_centers_[np.argmax(counts)]

def find_closest_color(target_color: np.ndarray, color_names: List[str]) -> str:
    """Find the closest color name to the target RGB."""
    color_map = {
        "Navy Blue": (0, 0, 128),
        "Blue": (0, 0, 255),
        "Black": (0, 0, 0),
        "Silver": (192, 192, 192),
        "Grey": (128, 128, 128),
        "Green": (0, 128, 0),
        "Purple": (128, 0, 128),
        "White": (255, 255, 255),
        "Beige": (245, 245, 220),
        "Brown": (165, 42, 42),
        "Bronze": (205, 127, 50),
        "Teal": (0, 128, 128),
        "Copper": (184, 115, 51),
        "Pink": (255, 192, 203),
        "Off White": (253, 253, 247),
        "Maroon": (128, 0, 0),
        "Red": (255, 0, 0),
        "Khaki": (240, 230, 140),
        "Orange": (255, 165, 0),
        "Coffee Brown": (139, 69, 19),
        "Yellow": (255, 255, 0),
        "Charcoal": (54, 69, 79),
        "Gold": (255, 215, 0),
        "Steel": (176, 196, 222),
        "Tan": (210, 180, 140),
        "Magenta": (255, 0, 255),
        "Lavender": (230, 230, 250),
        "Sea Green": (46, 139, 87),
        "Cream": (255, 253, 208),
        "Peach": (255, 218, 185),
        "Olive": (128, 128, 0),
        "Skin": (255, 224, 189),
        "Burgundy": (128, 0, 32),
        "Grey Melange": (190, 190, 190),
        "Rust": (183, 65, 14),
        "Rose": (255, 0, 127),
        "Lime Green": (50, 205, 50),
        "Mauve": (224, 176, 255),
        "Turquoise Blue": (0, 199, 140),
        "Metallic": (170, 170, 170),
        "Mustard": (255, 219, 88),
        "Taupe": (128, 128, 105),
        "Nude": (238, 213, 183),
        "Mushroom Brown": (189, 183, 107),
        "Fluorescent Green": (127, 255, 0),
    }

    target_rgb = target_color.astype(int)
    min_dist, closest = float("inf"), "Black"
    for name, rgb in color_map.items():
        dist = np.linalg.norm(np.array(rgb) - target_rgb)
        if dist < min_dist:
            min_dist, closest = dist, name
    return closest

def predict_attributes(image: Image.Image) -> dict:
    """Predict attributes from an image using CLIP."""
    attributes = {}
    for label_type, labels in [
        ("gender", ["Men", "Women", "Boys", "Girls", "Unisex"]),
        ("articleType", ml_model.df["articleType"].unique().tolist()),
        ("season", ["Summer", "Winter", "Spring", "Fall"]),
        ("usage", ["Casual", "Ethnic", "Formal", "Sports", "Smart Casual", "Travel", "Party", "Home"]),
        ("masterCategory", ["Apparel", "Accessories", "Footwear", "Personal Care", "Free Items", "Sporting Goods", "Home"]),
        ("subCategory", ["Topwear", "Bottomwear", "Watches", "Socks", "Shoes", "Belts", "Flip Flops", "Bags", "Innerwear", "Sandal", "Shoe Accessories", "Fragrance", "Jewellery", "Lips", "Saree", "Eyewear", "Nails", "Scarves", "Dress", "Loungewear and Nightwear", "Wallets", "Apparel Set", "Headwear", "Mufflers", "Skin Care", "Makeup", "Free Gifts", "Ties", "Accessories", "Skin", "Beauty Accessories", "Water Bottle", "Eyes", "Bath and Body", "Gloves", "Sports Accessories", "Cufflinks", "Sports Equipment", "Stoles", "Hair", "Perfumes", "Home Furnishing", "Umbrellas", "Wristbands", "Vouchers"])
    ]:
        inputs = ml_model.clip_processor(text=labels, images=image, return_tensors="pt", padding=True)
        outputs = ml_model.clip_model(**inputs)
        attributes[label_type] = labels[outputs.logits_per_image.softmax(dim=1).argmax().item()]

    dominant_color = get_dominant_color(image)
    attributes["baseColour"] = find_closest_color(dominant_color, ml_model.df["baseColour"].unique().tolist())
    return attributes

# --- Application Setup ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle startup and shutdown events."""
    await startup_event()
    yield

app = FastAPI(lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=CORS_ORIGINS, allow_credentials=True,
                   allow_methods=["*"], allow_headers=["*"])
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

async def startup_event():
    """Initialize application resources on startup."""
    try:
        ml_model.df = load_data()
        ml_model.onehot_encoder, ml_model.tfidf_vectorizer, ml_model.combined_features, ml_model.id_to_index = preprocess_data(ml_model.df)
        ml_model.clip_model, ml_model.clip_processor = init_ml_model()
        ml_model.chroma_client = chromadb.PersistentClient(path=CHROMA_DB_PATH)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during startup: {str(e)}")

# --- Endpoints ---
@app.get("/api/product/{item_id}", response_model=ProductPageResponse)
async def product_page(item_id: str):
    """Get product details and outfit recommendations."""
    product = get_item(item_id)
    target_id = str(product["id"])
    target_gender, target_usage, target_season = product["gender"], product["usage"], product["season"]
    target_color, target_article_type = product["baseColour"], product["articleType"]

    target_features = ml_model.combined_features[ml_model.id_to_index[target_id]]
    compatible_types_list = get_compatible_types(target_article_type)
    accessory_types = get_accessory_types(target_usage, target_season)

    recommendations_dict = {}
    for compatible_type in compatible_types_list:
        recs, _, _, _ = get_ml_recommendations(target_features, compatible_type, target_gender, target_color, target_id)
        filtered_recs = [item for item in recs if check_negative_constraints(product, item)]
        if filtered_recs:
            recommendations_dict[compatible_type] = [Item(**item) for item in filtered_recs[:3]]

    for accessory_type in accessory_types:
        recs, _, _, _ = get_ml_recommendations(target_features, accessory_type, target_gender, target_color, target_id)
        filtered_recs = [item for item in recs if check_negative_constraints(product, item)]
        if filtered_recs:
            recommendations_dict[accessory_type] = [Item(**item) for item in filtered_recs[:3]]

    return ProductPageResponse(product=Item(**product), recommendations=OutfitRecommendation(recommendations=recommendations_dict))

@app.get("/api/products", response_model=ProductsResponse)
async def get_random_products(limit: int = 10):
    """Return a random selection of products."""
    try:
        all_product_ids = ml_model.df["id"].tolist()
        selected_ids = sample(all_product_ids, min(limit, len(all_product_ids)))
        products = [Item(**get_item(product_id)) for product_id in selected_ids]
        return ProductsResponse(products=products)
    except Exception as e:
        print(f"Error fetching random products: {e}")
        raise HTTPException(status_code=500, detail="An error occurred while fetching random products")

@app.post("/api/recommend-from-image", response_model=OutfitRecommendation)
async def recommend_from_image(file: UploadFile = File(...)):
    """Recommend outfits based on an uploaded image."""
    try:
        contents = await file.read()
        image = Image.open(BytesIO(contents)).convert("RGB")
        attributes = predict_attributes(image)

        synthetic_name = f"{attributes.get('gender', 'Unisex')}'s {attributes.get('baseColour', '')} {attributes.get('articleType', 'Fashion Item')}"
        categorical_data = [attributes.get(col, "Unknown") for col in ["gender", "masterCategory", "subCategory", "articleType", "baseColour", "season", "usage"]]
        onehot = ml_model.onehot_encoder.transform([categorical_data])
        tfidf = ml_model.tfidf_vectorizer.transform([synthetic_name])
        target_features = hstack([onehot, tfidf])

        target_article_type = attributes.get("articleType", "Shirts")
        target_gender, target_usage = attributes.get("gender", "Unisex"), attributes.get("usage", "Casual")
        target_season, target_color = attributes.get("season", "Summer"), attributes.get("baseColour", "Black")

        compatible_types_list = get_compatible_types(target_article_type)
        accessory_types = get_accessory_types(target_usage, target_season)

        recommendations_dict = {}
        for compatible_type in compatible_types_list:
            recs = get_ml_recommendations(target_features, compatible_type, target_gender, target_color)
            if recs:
                recommendations_dict[compatible_type] = [Item(**item) for item in recs[0]]

        for accessory_type in accessory_types:
            recs = get_ml_recommendations(target_features, accessory_type, target_gender, target_color)
            if recs:
                recommendations_dict[accessory_type] = [Item(**item) for item in recs[0]]

        return OutfitRecommendation(recommendations=recommendations_dict)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

@app.post("/api/search", response_model=SearchResult)
async def search(query: str = Form(...)):
    """Search for images based on a text query."""
    try:
        fashion_collection = ml_model.chroma_client.get_collection("fashion", embedding_function=OpenCLIPEmbeddingFunction(), data_loader=ImageLoader())
        results = fashion_collection.query(query_texts=[query], n_results=5, include=["uris", "distances"])

        results["uris"] = [[uri.replace("/kaggle/input/fashion-product-images-dataset/fashion-dataset/", "") for uri in results["uris"][0]]]
        image_data = [
            {"id": results["ids"][0][i], "distance": results["distances"][0][i], "image_url": f"/static/images/{os.path.basename(results['uris'][0][i])}"}
            for i in range(len(results["ids"][0]))
            if os.path.exists(os.path.join(STATIC_DIR, "images", os.path.basename(results["uris"][0][i])))
        ]
        return SearchResult(images=image_data)
    except Exception as e:
        print(f"Error during search: {e}")
        raise HTTPException(status_code=500, detail="An error occurred during search")

def popularity_based_recommender(top_n=5):
    popularity = ml_model.df['articleType'].value_counts().index[:top_n]
    return ml_model.df[ml_model.df['articleType'].isin(popularity)].sample(top_n).to_dict('records')

def random_recommender(top_n=5):
    return ml_model.df.sample(top_n).to_dict('records')

def inverse_popularity_score(recommendations):
    total_purchases = len(ml_model.df)
    scores = [1 - (ml_model.df['articleType'].value_counts()[item['articleType']] / total_purchases) for item in recommendations]
    return np.mean(scores)

def intra_list_diversity(recommendations):
    features = [ml_model.combined_features[ml_model.id_to_index[str(item['id'])]] for item in recommendations]
    stacked_features = vstack(features).toarray()
    similarities = cosine_similarity(stacked_features)
    return 1 - np.mean(similarities)

def serendipity_measure(recommendations, user_history):
    user_features = ml_model.combined_features[ml_model.id_to_index[str(user_history['id'])]]
    rec_features = [ml_model.combined_features[ml_model.id_to_index[str(item['id'])]] for item in recommendations]
    distances = [cosine_similarity(user_features, rec.reshape(1, -1))[0][0] for rec in rec_features]
    return np.mean(distances)

@app.get("/api/evaluate")
async def evaluate_recommendations():
    # Select a random product as the target
    target_product = ml_model.df.sample(1).iloc[0]
    target_id = str(target_product['id'])
    target_features = ml_model.combined_features[ml_model.id_to_index[target_id]]

    # Get recommendations from different methods
    ml_recs, ml_novelty, ml_diversity, ml_serendipity = get_ml_recommendations(
        target_features, target_product['articleType'], target_product['gender'],
        target_product['baseColour'], target_id
    )

    popularity_recs = popularity_based_recommender()
    random_recs = random_recommender()

    # Calculate metrics for baseline methods
    pop_novelty = inverse_popularity_score(popularity_recs)
    pop_diversity = intra_list_diversity(popularity_recs)
    pop_serendipity = serendipity_measure(popularity_recs, target_product)

    rand_novelty = inverse_popularity_score(random_recs)
    rand_diversity = intra_list_diversity(random_recs)
    rand_serendipity = serendipity_measure(random_recs, target_product)

    return {
        "ML Model": {
            "Novelty": ml_novelty,
            "Diversity": ml_diversity,
            "Serendipity": ml_serendipity
        },
        "Popularity Baseline": {
            "Novelty": pop_novelty,
            "Diversity": pop_diversity,
            "Serendipity": pop_serendipity
        },
        "Random Baseline": {
            "Novelty": rand_novelty,
            "Diversity": rand_diversity,
            "Serendipity": rand_serendipity
        }
    }
