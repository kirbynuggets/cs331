"""Main FastAPI application with ML model and database integration."""

import os
from random import sample
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

# --- Configuration ---
DATABASE_URL = "mysql+pymysql://fashion_user:securepass@localhost/fashion_db"
STATIC_DIR = "static"
CHROMA_DB_PATH = "../../database/production_fashion.db"
CORS_ORIGINS = ["http://localhost:5173", "http://localhost:5174"]

ARTICLE_TYPE_GROUPS = {
    "Shirts": ["Shirts", "Formal Shirts", "Casual Shirts"],
    "Tshirts": ["Tshirts", "Round Neck Tshirts", "Polo Tshirts", "V-Neck Tshirts"],
    "Tops": ["Tops", "Crop Tops", "Tank Tops", "Tube Tops"],
    "Sweatshirts": ["Sweatshirts", "Hoodies"],
    "Kurtas": ["Kurtas", "Kurtis"],  # Consider gender for Kurtis
    "Jeans": ["Jeans", "Skinny Jeans", "Ripped Jeans", "Bootcut Jeans"],
    "Trousers": ["Trousers", "Formal Trousers", "Chinos"],
    "Shorts": ["Shorts", "Denim Shorts", "Cargo Shorts"],
    "Leggings": ["Leggings", "Jeggings"],
    "Skirts": [
        "Skirts",
        "A-Line Skirts",
        "Pencil Skirts",
        "Maxi Skirts",
    ],  # Add more skirt types.
    "Dresses": [
        "Dresses",
        "Maxi Dresses",
        "Bodycon Dresses",
        "A-Line Dresses",
        "Shift Dresses",
    ],  # Add more dress types
    "Suits": ["Suits", "Pant Suits", "Skirt Suits"],  # Consider gender
    "Blazers": ["Blazers", "Formal Blazers", "Casual Blazers"],
    "Jackets": [
        "Jackets",
        "Denim Jackets",
        "Leather Jackets",
        "Bomber Jackets",
        "Puffer Jackets",
    ],  # Add more jacket types
    "Formal Shoes": [
        "Formal Shoes",
        "Oxfords",
        "Derbys",
        "Loafers",
        "Monk Straps",
    ],  # Add more shoe types
    "Casual Shoes": [
        "Casual Shoes",
        "Sneakers",
        "Canvas Shoes",
        "Slip-ons",
    ],  # Add more
    "Heels": ["Heels", "Stilettos", "Pumps", "Wedges", "Kitten Heels"],  # Add more
    "Flats": ["Flats", "Ballerinas", "Loafers"],  # Add more
    "Sarees": ["Sarees"],  # Add more saree types if your data supports it.
    "Salwar": ["Salwar", "Churidar", "Patiala"],
    # Add more accessory groupings
    "Belts": ["Belts", "Leather Belts", "Fabric Belts"],
    "Ties": ["Ties", "Bow Ties"],
    "Watches": ["Watches"],
    "Sunglasses": ["Sunglasses"],
    "Bags": [
        "Handbags",
        "Clutches",
        "Backpacks",
        "Tote Bags",
        "Sling Bags",
        "Wallets",
        "Laptop Bag",
        "Duffel Bag",
        "Messenger Bag",
    ],
    "Jewellery": [
        "Jewellery Set",
        "Necklace and Chains",
        "Pendant",
        "Earrings",
        "Ring",
        "Bracelet",
        "Bangle",
    ],
    "Scarves": ["Scarves", "Stoles"],
    "Hats": ["Caps", "Hats"],
    "Socks": ["Socks"],
    "Gloves": ["Gloves"],
    "Mufflers": ["Mufflers"],
}

COMPATIBLE_TYPES_BASE = {
    "Shirts": [
        "Trousers",
        "Jeans",
        "Shorts",
        "Blazers",
        "Waistcoat",
        "Formal Shoes",
        "Belts",
        "Ties",
        "Watches",
    ],
    "Tshirts": [
        "Jeans",
        "Shorts",
        "Track Pants",
        "Jackets",
        "Casual Shoes",
        "Caps",
        "Sunglasses",
        "Backpacks",
    ],
    "Tops": [
        "Jeans",
        "Skirts",
        "Shorts",
        "Jackets",
        "Leggings",
        "Heels",
        "Flats",
        "Sandals",
        "Bags",
    ],
    "Sweatshirts": ["Jeans", "Track Pants", "Caps", "Sports Shoes", "Casual Shoes"],
    "Kurtas": [
        "Churidar",
        "Trousers",
        "Leggings",
        "Dupatta",
        "Sandals",
        "Flats",
        "Jewellery",
    ],  # Gender specific
    "Jeans": [
        "Shirts",
        "Tshirts",
        "Tops",
        "Casual Shoes",
        "Belts",
        "Jackets",
        "Sweatshirts",
    ],
    "Trousers": [
        "Shirts",
        "Tshirts",
        "Blazers",
        "Formal Shoes",
        "Belts",
        "Ties",
        "Watches",
    ],
    "Shorts": [
        "Tshirts",
        "Shirts",
        "Casual Shoes",
        "Sandals",
        "Sunglasses",
        "Caps",
    ],
    "Leggings": ["Tunics", "Kurtis", "Long Tshirts", "Flats", "Casual Shoes"],
    "Skirts": ["Tops", "Shirts", "Flats", "Heels", "Sandals", "Belts", "Bags"],
    "Dresses": [
        "Heels",
        "Flats",
        "Sandals",
        "Jackets",
        "Clutches",
        "Jewellery",
        "Belts",
        "Sunglasses",
    ],
    "Jumpsuit": ["Jackets", "Heels", "Sandals", "Belts", "Bags"],
    "Lehenga Choli": ["Dupatta", "Sandals", "Heels", "Jewellery"],  # Very specific
    "Suits": ["Formal Shoes", "Shirts", "Ties", "Belts", "Watches"],
    "Blazers": [
        "Shirts",
        "Trousers",
        "Jeans",
        "Formal Shoes",
        "Casual Shoes",
        "Ties",
        "Belts",
    ],  # Versatile
    "Jackets": [
        "Tshirts",
        "Shirts",
        "Jeans",
        "Trousers",
        "Casual Shoes",
        "Sweatshirts",
    ],  # Very versatile
    "Formal Shoes": ["Trousers", "Shirts", "Suits", "Belts", "Socks"],
    "Casual Shoes": ["Jeans", "Tshirts", "Shorts", "Track Pants", "Socks"],
    "Heels": ["Dresses", "Skirts", "Trousers", "Jeans", "Jumpsuits"],
    "Flats": ["Dresses", "Jeans", "Skirts", "Leggings", "Shorts"],
    "Sarees": [
        "Sandals",
        "Heels",
        "Jewellery",
        "Clutches",
        "Blouse",
    ],  # Blouse is crucial, add to your data if possible
    "Salwar": ["Kurtis", "Dupatta", "Sandals", "Flats", "Jewellery"],
    "Flip Flops": ["Shorts", "Casual Wear", "Loungewear"],  # Very casual
    "Sandals": [
        "Dresses",
        "Skirts",
        "Jeans",
        "Shorts",
        "Kurtas",
        "Salwar",
    ],  # Versatile in warm weather
    "Sports Shoes": [
        "Track Pants",
        "Shorts",
        "Tshirts",
        "Sports Wear",
        "Socks",
    ],  # Activity-specific
    "Track Pants": ["Tshirts", "Sweatshirts", "Sports Shoes"],
    "Tunics": ["Leggings", "Jeans", "Flats", "Sandals"],
    "Waistcoat": ["Shirts", "Trousers", "Formal Shoes"],  # Formal
    "Long Tshirts": ["Leggings", "Jeans", "Casual Shoes"],
    "Dupatta": ["Kurtas", "Salwar", "Lehenga Choli"],
    "Churidar": ["Kurtas"],
    "Blouse": ["Sarees"],
    "Jewellery Set": ["Sarees", "Lehenga Choli", "Dresses", "Evening Gowns"],
    "Clutches": ["Dresses", "Sarees", "Evening Gowns", "Formal Wear"],
}

ACCESSORY_COMBINATIONS = {
    "Formal": ["Belts", "Ties", "Watches", "Cufflinks", "Formal Shoes", "Pocket Squares", "Tie Clips"],
    "Casual": ["Sunglasses", "Caps", "Backpacks", "Casual Shoes", "Sneakers", "Belts", "Watches"],
    "Sports": [
        "Caps",
        "Sports Shoes",
        "Socks",
        "Wristbands",
        "Headbands",
        "Sports Bags",
    ],
    "Party":[
        "Jewellery",
        "Clutches",
        "Heels",
        "High Heels",
        "Evening Bags",
        "Scarves",
        "Stoles",
    ],
    "Ethnic": [
        "Jewellery",
        "Bangles",
        "Bindis",
        "Jhumkas",
        "Maang Tikka",
        "Anklets",
        "Sandals",
        "Mojaris",
    ],
}

SEASONAL_ACCESSORIES = {
    "Winter": ["Scarves", "Gloves", "Mufflers", "Beanies", "Woolen Caps", "Boots"],
    "Summer": ["Sunglasses", "Flip Flops", "Hats", "Straw Hats", "Sandals"],
    "Spring": ["Light Scarves", "Flats", "Ballerinas", "Cardigans"],
    "Fall": ["Jackets", "Boots", "Ankle Boots", "Scarves", "Light Sweaters"],
}

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

def preprocess_data(df: pd.DataFrame) -> tuple:
    """Preprocess the dataframe for ML model."""
    columns_to_fill = ["baseColour", "productDisplayName", "articleType", "gender",
                       "masterCategory", "subCategory", "season", "usage"]
    for col in columns_to_fill:
        df[col] = df[col].fillna("Unknown")

    categorical_cols = ["gender", "masterCategory", "subCategory", "articleType",
                        "baseColour", "season", "usage"]

    onehot_encoder = OneHotEncoder(handle_unknown="ignore", sparse_output=True)
    onehot_features = onehot_encoder.fit_transform(df[categorical_cols])

    tfidf_vectorizer = TfidfVectorizer(stop_words="english", max_features=1000)
    tfidf_features = tfidf_vectorizer.fit_transform(df["productDisplayName"])

    combined_features = hstack([onehot_features, tfidf_features])
    id_to_index = {str(row["id"]): idx for idx, row in df.iterrows()}

    return onehot_encoder, tfidf_vectorizer, combined_features, id_to_index

def init_ml_model() -> tuple:
    """Initialize the CLIP model and processor."""
    clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
    clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
    return clip_model, clip_processor

def get_ml_recommendations(
    target_features,
    target_article_type: str,
    product_gender: str,
    target_color: str,
    target_id: Optional[str] = None,
    top_n: int = 3
) -> List[Dict]:
    """Generate recommendations based on target features."""
    df = ml_model.df
    mask = (df["articleType"] == target_article_type) & (df["gender"].isin([product_gender, "Unisex"]))
    if target_id:
        mask &= (df["id"] != target_id)

    category_df = df[mask]
    if category_df.empty:
        return []

    color_scores = category_df["baseColour"].apply(lambda x: color_compatibility(target_color, x))
    category_df = category_df[color_scores >= 0.3]
    if category_df.empty:
        return []

    for index, row in category_df.iterrows():
        if not check_negative_constraints(ml_model.df.iloc[ml_model.id_to_index[target_id] if target_id else 0].to_dict(), row.to_dict()):
            category_df.drop(index, inplace=True)

    if category_df.empty:
        return []

    category_indices = category_df.index.tolist()
    category_features = ml_model.combined_features[category_indices]
    color_matches = (category_df["baseColour"] == target_color).astype(float)

    similarities = cosine_similarity(target_features, category_features).flatten()
    similarities += similarities.max() * 0.2 * color_matches

    top_indices = np.argsort(similarities)[-top_n:][::-1]
    results = category_df.iloc[top_indices].to_dict("records")

    for item in results:
        item["image_url"] = f"/static/images/{item['id']}.jpg"
        item["id"] = int(item["id"])
    return results

# --- Utilities ---
def color_compatibility(color1: str, color2: str) -> float:
    """Calculate color compatibility score."""
    color_wheel = {  # Simplified color wheel mapping (RGB tuples)
        "Red": (255, 0, 0),
        "Orange": (255, 165, 0),
        "Yellow": (255, 255, 0),
        "Green": (0, 255, 0),
        "Blue": (0, 0, 255),
        "Purple": (128, 0, 128),
        "Pink": (255, 192, 203),
        "Brown": (150, 75, 0),
        "Black": (0, 0, 0),
        "White": (255, 255, 255),
        "Gray": (128, 128, 128),
        "Navy Blue": (0, 0, 128),
        "Silver": (192, 192, 192),
        "Teal": (0, 128, 128),
        "Maroon": (128, 0, 0),
        "Olive": (128, 128, 0),
        "Magenta": (255, 0, 255),
        "Lime Green": (50, 205, 50),
        "Cyan": (0, 255, 255),
        "Beige": (245, 245, 220),
        "Gold": (255, 215, 0),
        "Turquiose Blue": (0, 199, 140),
        "Peach": (255, 218, 185),
    }

    if color1 not in color_wheel or color2 not in color_wheel:
        return 0.5
    rgb1, rgb2 = np.array(color_wheel[color1]), np.array(color_wheel[color2])
    distance = np.linalg.norm(rgb1 - rgb2)
    return 1.0 - (distance / 441.67)

def check_negative_constraints(target_item: dict, candidate_item: dict) -> bool:
    """Check for incompatible combinations."""
    def get_group(article_type: str) -> Optional[str]:
        for group_name, types in ARTICLE_TYPE_GROUPS.items():
            if article_type in types:
                return group_name
        return None

    target_group = get_group(target_item["articleType"])
    candidate_group = get_group(candidate_item["articleType"])

    if target_group is None or candidate_group is None:
        return True

    if target_group == "Trousers" and candidate_group in ["Casual Shoes", "Formal Shoes"]:
        if candidate_item["articleType"] in ["Sandals", "Flip Flops"]:
            return False
    if target_group in ["Shirts", "Tshirts"] and candidate_group in ["Tshirts", "Shirts"]:
        return False
    if candidate_group == "Casual Shoes" and target_item["usage"] == "Formal":
        if candidate_item["articleType"] == "Flip Flops":
            return False
    return True

def get_compatible_types(article_type: str, gender: str) -> List[str]:
    """Get compatible article types based on gender."""
    compatible_types = COMPATIBLE_TYPES_BASE.copy()
    if gender in ["Women", "Girls"]:
        compatible_types.update({
            "Dresses": ["Heels", "Flats", "Jackets", "Clutches", "Sunglasses"],
            "Tops": ["Skirts", "Shorts", "Jackets"],
            "Kurtis": ["Leggings", "Dupatta", "Sandals"],
        })
    elif gender in ["Men", "Boys"]:
        compatible_types.update({
            "Shirts": ["Trousers", "Blazers", "Formal Shoes", "Ties"],
            "Tshirts": ["Shorts", "Track Pants", "Sports Shoes"],
        })
    return compatible_types.get(article_type, [])

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
        # "Multi": (0, 0, 0),  # Placeholder, as multi is not a single color
        "Magenta": (255, 0, 255),
        "Lavender": (230, 230, 250),
        "Sea Green": (46, 139, 87),
        "Cream": (255, 253, 208),
        "Peach": (255, 218, 185),
        "Olive": (128, 128, 0),
        "Skin": (255, 224, 189),
        "Burgundy": (128, 0, 32),
        "Grey Melange": (190, 190, 190),  # close approximation.
        "Rust": (183, 65, 14),
        "Rose": (255, 0, 127),
        "Lime Green": (50, 205, 50),
        "Mauve": (224, 176, 255),
        "Turquoise Blue": (0, 199, 140),
        "Metallic": (170, 170, 170),  # close approximation.
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

async def lifespan(app: FastAPI):
    await startup_event()
    yield

# --- Endpoints ---
@app.get("/api/product/{item_id}", response_model=ProductPageResponse)
async def product_page(item_id: str):
    """Get product details and outfit recommendations."""
    product = get_item(item_id)
    target_id = str(product["id"])
    target_gender, target_usage, target_season = product["gender"], product["usage"], product["season"]
    target_color, target_article_type = product["baseColour"], product["articleType"]

    target_features = ml_model.combined_features[ml_model.id_to_index[target_id]]
    compatible_types_list = get_compatible_types(target_article_type, target_gender)
    accessory_types = get_accessory_types(target_usage, target_season)

    recommendations_dict = {}
    for compatible_type in compatible_types_list:
        recs = get_ml_recommendations(target_features, compatible_type, target_gender, target_color, target_id)
        if recs:
            recommendations_dict[compatible_type] = [Item(**item) for item in recs]

    for accessory_type in accessory_types:
        recs = get_ml_recommendations(target_features, accessory_type, target_gender, target_color, target_id)
        if recs:
            recommendations_dict[accessory_type] = [Item(**item) for item in recs]

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

        compatible_types_list = get_compatible_types(target_article_type, target_gender)
        accessory_types = get_accessory_types(target_usage, target_season)

        recommendations_dict = {}
        for compatible_type in compatible_types_list:
            recs = get_ml_recommendations(target_features, compatible_type, target_gender, target_color)
            if recs:
                recommendations_dict[compatible_type] = [Item(**item) for item in recs]

        for accessory_type in accessory_types:
            recs = get_ml_recommendations(target_features, accessory_type, target_gender, target_color)
            if recs:
                recommendations_dict[accessory_type] = [Item(**item) for item in recs]

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
