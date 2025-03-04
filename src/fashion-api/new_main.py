from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from sqlalchemy import create_engine, text
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import OneHotEncoder
from scipy.sparse import hstack
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from PIL import Image
import numpy as np
import torch
from io import BytesIO
from sklearn.cluster import KMeans
from transformers import CLIPProcessor, CLIPModel
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle startup and shutdown events."""
    await startup_event()
    yield

app = FastAPI(lifespan=lifespan)

origins = ["http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATABASE_URL = "mysql+pymysql://fashion_user:securepass@localhost/fashion_db"
engine = create_engine(DATABASE_URL)

app.mount("/static", StaticFiles(directory="static"), name="static")


class MLModel:
    def __init__(self):
        self.df = None
        self.combined_features = None
        self.id_to_index = {}
        self.onehot_encoder = None
        self.tfidf_vectorizer = None
        self.clip_model = None
        self.clip_processor = None


ml_model = MLModel()


async def startup_event():
    """Load and preprocess data on startup"""
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT * FROM clothing_items"))
            items = result.mappings().all()
            ml_model.df = pd.DataFrame(items)
            ml_model.df["id"] = ml_model.df["id"].astype(str)

            columns_to_fill = [
                "baseColour",
                "productDisplayName",
                "articleType",
                "gender",
                "masterCategory",
                "subCategory",
                "season",
                "usage",
            ]
            for col in columns_to_fill:
                ml_model.df[col] = ml_model.df[col].fillna("Unknown")

            categorical_cols = [
                "gender",
                "masterCategory",
                "subCategory",
                "articleType",
                "baseColour",
                "season",
                "usage",
            ]

            ml_model.onehot_encoder = OneHotEncoder(
                handle_unknown="ignore", sparse_output=True
            )
            onehot_features = ml_model.onehot_encoder.fit_transform(
                ml_model.df[categorical_cols]
            )

            ml_model.tfidf_vectorizer = TfidfVectorizer(
                stop_words="english", max_features=1000
            )
            tfidf_features = ml_model.tfidf_vectorizer.fit_transform(
                ml_model.df["productDisplayName"]
            )

            ml_model.combined_features = hstack([onehot_features, tfidf_features])

            ml_model.id_to_index = {
                str(row["id"]): idx for idx, row in ml_model.df.iterrows()
            }

            ml_model.clip_model = CLIPModel.from_pretrained(
                "openai/clip-vit-base-patch32"
            )
            ml_model.clip_processor = CLIPProcessor.from_pretrained(
                "openai/clip-vit-base-patch32"
            )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during startup: {str(e)}")


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


def get_item(item_id: str) -> Dict[str, Any]:
    """Retrieve item from database"""
    with engine.connect() as conn:
        result = conn.execute(
            text("SELECT * FROM clothing_items WHERE id = :id"), {"id": item_id}
        )
        item = result.mappings().first()
        if not item:
            raise HTTPException(status_code=404, detail="Item not found")
        item = dict(item)
        item["id"] = int(item["id"])
        item["image_url"] = f"/static/high_res_images/{item['id']}.jpg"
        return item


def get_dominant_color(image: Image.Image) -> np.ndarray:
    image = image.resize((100, 100))
    img_array = np.array(image)
    pixels = img_array.reshape(-1, 3)
    kmeans = KMeans(n_clusters=3, random_state=0).fit(pixels)
    counts = np.bincount(kmeans.labels_)
    return kmeans.cluster_centers_[np.argmax(counts)]


def find_closest_color(target_color: np.ndarray, color_names: List[str]) -> str:
    color_map = {
        "Navy Blue": (0, 0, 128),
        "Blue": (0, 0, 255),
        "Black": (0, 0, 0),
    }
    target_rgb = target_color.astype(int)
    min_dist = float("inf")
    closest = "Black"
    for name, rgb in color_map.items():
        dist = np.linalg.norm(np.array(rgb) - target_rgb)
        if dist < min_dist:
            min_dist, closest = dist, name
    return closest


def predict_attributes(image: Image.Image) -> dict:
    attributes = {}
    
    gender_labels = ["Men", "Women", "Boys", "Girls", "Unisex"]
    inputs = ml_model.clip_processor(
        text=gender_labels, images=image, return_tensors="pt", padding=True
    )
    outputs = ml_model.clip_model(**inputs)
    attributes["gender"] = gender_labels[outputs.logits_per_image.softmax(dim=1).argmax().item()]

    article_labels = ml_model.df['articleType'].unique().tolist()
    inputs = ml_model.clip_processor(
        text=article_labels, images=image, return_tensors="pt", padding=True
    )
    outputs = ml_model.clip_model(**inputs)
    attributes["articleType"] = article_labels[outputs.logits_per_image.softmax(dim=1).argmax().item()]

    season_labels = ["Summer", "Winter", "Spring", "Fall", "All-Season"]
    inputs = ml_model.clip_processor(
        text=season_labels, images=image, return_tensors="pt", padding=True
    )
    outputs = ml_model.clip_model(**inputs)
    attributes["season"] = season_labels[outputs.logits_per_image.softmax(dim=1).argmax().item()]

    usage_labels = ["Casual", "Formal", "Sports", "Party", "Ethnic"]
    inputs = ml_model.clip_processor(
        text=usage_labels, images=image, return_tensors="pt", padding=True
    )
    outputs = ml_model.clip_model(**inputs)
    attributes["usage"] = usage_labels[outputs.logits_per_image.softmax(dim=1).argmax().item()]

    dominant_color = get_dominant_color(image)
    attributes["baseColour"] = find_closest_color(
        dominant_color, ml_model.df["baseColour"].unique().tolist()
    )

    attributes.setdefault("masterCategory", "Apparel")
    attributes.setdefault("subCategory", "General")

    return attributes

@app.get("/api/product/{item_id}", response_model=ProductPageResponse)
async def product_page(item_id: str):
    """Get product details and outfit recommendations."""
    product = get_item(item_id)
    target_id = str(product["id"])
    target_gender = product["gender"]
    target_usage = product["usage"]
    target_season = product["season"]
    target_color = product["baseColour"]

    if target_id not in ml_model.id_to_index:
        raise HTTPException(status_code=404, detail="Item not found in ML model")
    target_idx = ml_model.id_to_index[target_id]
    target_article_type = product["articleType"]

    compatible_types = {
        "Shirts": [
            "Trousers",
            "Jeans",
            "Shorts",
            "Blazers",
            "Waistcoat",
            "Formal Shoes",
            "Belts",
        ],
        "Tshirts": [
            "Jeans",
            "Shorts",
            "Track Pants",
            "Jackets",
            "Casual Shoes",
            "Caps",
        ],
        "Tops": ["Jeans", "Skirts", "Shorts", "Jackets"],
        "Sweatshirts": ["Jeans", "Track Pants", "Caps", "Sports Shoes"],
        "Kurtas": ["Churidar", "Trousers", "Dupatta", "Sandals"],
        "Jeans": ["Shirts", "Tshirts", "Tops", "Casual Shoes", "Belts"],
        "Trousers": ["Shirts", "Tshirts", "Blazers", "Formal Shoes", "Belts"],
        "Shorts": ["Tshirts", "Casual Shoes", "Sandals"],
        "Leggings": ["Tunics", "Kurtis", "Long Tshirts"],
        "Skirts": ["Tops", "Shirts", "Flats", "Heels"],
        "Dresses": ["Heels", "Flats", "Jackets", "Clutches", "Jewellery Set"],
        "Jumpsuit": ["Jackets", "Heels", "Sandals"],
        "Lehenga Choli": ["Dupatta", "Sandals", "Jewellery Set"],
        "Suits": ["Formal Shoes", "Shirts", "Ties"],
        "Blazers": ["Shirts", "Trousers", "Formal Shoes", "Ties"],
        "Jackets": ["Tshirts", "Jeans", "Casual Shoes", "Sweatshirts"],
        "Formal Shoes": ["Trousers", "Shirts", "Belts"],
        "Casual Shoes": ["Jeans", "Tshirts", "Shorts"],
        "Heels": ["Dresses", "Skirts", "Trousers"],
        "Flats": ["Dresses", "Jeans", "Skirts"],
        "Sarees": ["Sandals", "Jewellery Set", "Clutches"],
        "Salwar": ["Kurtis", "Dupatta", "Sandals"],
    }

    if target_gender in ["Women", "Girls"]:
        compatible_types.update(
            {
                "Dresses": ["Heels", "Flats", "Jackets", "Clutches", "Sunglasses"],
                "Tops": ["Skirts", "Shorts", "Jackets"],
                "Kurtis": ["Leggings", "Dupatta", "Sandals"],
            }
        )
    elif target_gender in ["Men", "Boys"]:
        compatible_types.update(
            {
                "Shirts": ["Trousers", "Blazers", "Formal Shoes", "Ties"],
                "Tshirts": ["Shorts", "Track Pants", "Sports Shoes"],
            }
        )

    recommendations_dict = {}
    if target_article_type in compatible_types:
        for compatible_type in compatible_types[target_article_type]:
            recommended_items = get_ml_recommendations(
                target_idx, compatible_type, target_id, target_gender, target_color
            )
            if recommended_items:
                recommendations_dict[compatible_type] = [
                    Item(**item) for item in recommended_items
                ]

    accessory_list = []
    if target_usage == "Formal":
        accessory_list = ["Belts", "Ties", "Watches", "Cufflinks", "Clutches"]
    elif target_usage == "Sports":
        accessory_list = ["Caps", "Sports Shoes", "Socks", "Wristbands"]
    elif target_usage == "Party":
        accessory_list = ["Jewellery Set", "Clutches", "Heels", "Sunglasses"]
    else:
        accessory_list = ["Sunglasses", "Caps", "Backpacks", "Scarves"]

    seasonal_acc = {
        "Winter": ["Scarves", "Gloves", "Mufflers"],
        "Summer": ["Sunglasses", "Flip Flops", "Hats"],
        "Spring": ["Scarves", "Flats"],
        "Fall": ["Jackets", "Mufflers"],
    }.get(target_season, [])
    accessory_list += seasonal_acc

    for accessory_type in set(accessory_list):
        accessory_recs = get_ml_recommendations(
            target_idx, accessory_type, target_id, target_gender, target_color
        )
        if accessory_recs:
            recommendations_dict[accessory_type] = [
                Item(**item) for item in accessory_recs
            ]

    return ProductPageResponse(
        product=Item(**product),
        recommendations=OutfitRecommendation(recommendations=recommendations_dict),
    )


def get_ml_recommendations(
    target_idx: int,
    target_article_type: str,
    target_id: str,
    product_gender: str,
    target_color: str,
    top_n=3,
) -> List[Dict]:
    """Enhanced recommendations with gender and color filters"""
    df = ml_model.df

    mask = (
        (df["articleType"] == target_article_type)
        & (df["id"] != target_id)
        & (df["gender"].isin([product_gender, "Unisex"]))
    )
    category_df = df[mask]

    if category_df.empty:
        return []

    category_indices = category_df.index.tolist()
    category_features = ml_model.combined_features[category_indices]
    target_features = ml_model.combined_features[target_idx]

    similarities = cosine_similarity(target_features, category_features).flatten()

    color_matches = (category_df["baseColour"] == target_color).astype(float)
    similarities += similarities.max() * 0.2 * color_matches

    top_indices = np.argsort(similarities)[-top_n:][::-1]
    results = category_df.iloc[top_indices].to_dict("records")

    for item in results:
        item["image_url"] = f"/static/high_res_images/{item['id']}.jpg"
        item["id"] = int(item["id"])
    return results


@app.post("/api/recommend-from-image", response_model=OutfitRecommendation)
async def recommend_from_image(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        image = Image.open(BytesIO(contents)).convert("RGB")
        attributes = predict_attributes(image)

        synthetic_name = (
            f"{attributes.get('gender', 'Unisex')}'s "
            f"{attributes.get('baseColour', '')} "
            f"{attributes.get('articleType', 'Fashion Item')}"
        )

        categorical_cols = [
            "gender", "masterCategory", "subCategory",
            "articleType", "baseColour", "season", "usage"
        ]
        categorical_data = [attributes.get(col, "Unknown") for col in categorical_cols]
        
        onehot = ml_model.onehot_encoder.transform([categorical_data])
        tfidf = ml_model.tfidf_vectorizer.transform([synthetic_name])
        target_features = hstack([onehot, tfidf])

        recommendations_dict = {}
        target_article_type = attributes.get("articleType", "Shirts")
        target_gender = attributes.get("gender", "Unisex")
        target_usage = attributes.get("usage", "Casual")
        target_season = attributes.get("season", "All-Season")
        target_color = attributes.get("baseColour", "Black")

        compatible_types = {
        "Shirts": [
            "Trousers",
            "Jeans",
            "Shorts",
            "Blazers",
            "Waistcoat",
            "Formal Shoes",
            "Belts",
        ],
        "Tshirts": [
            "Jeans",
            "Shorts",
            "Track Pants",
            "Jackets",
            "Casual Shoes",
            "Caps",
        ],
        "Tops": ["Jeans", "Skirts", "Shorts", "Jackets"],
        "Sweatshirts": ["Jeans", "Track Pants", "Caps", "Sports Shoes"],
        "Kurtas": ["Churidar", "Trousers", "Dupatta", "Sandals"],
        "Jeans": ["Shirts", "Tshirts", "Tops", "Casual Shoes", "Belts"],
        "Trousers": ["Shirts", "Tshirts", "Blazers", "Formal Shoes", "Belts"],
        "Shorts": ["Tshirts", "Casual Shoes", "Sandals"],
        "Leggings": ["Tunics", "Kurtis", "Long Tshirts"],
        "Skirts": ["Tops", "Shirts", "Flats", "Heels"],
        "Dresses": ["Heels", "Flats", "Jackets", "Clutches", "Jewellery Set"],
        "Jumpsuit": ["Jackets", "Heels", "Sandals"],
        "Lehenga Choli": ["Dupatta", "Sandals", "Jewellery Set"],
        "Suits": ["Formal Shoes", "Shirts", "Ties"],
        "Blazers": ["Shirts", "Trousers", "Formal Shoes", "Ties"],
        "Jackets": ["Tshirts", "Jeans", "Casual Shoes", "Sweatshirts"],
        "Formal Shoes": ["Trousers", "Shirts", "Belts"],
        "Casual Shoes": ["Jeans", "Tshirts", "Shorts"],
        "Heels": ["Dresses", "Skirts", "Trousers"],
        "Flats": ["Dresses", "Jeans", "Skirts"],
        "Sarees": ["Sandals", "Jewellery Set", "Clutches"],
        "Salwar": ["Kurtis", "Dupatta", "Sandals"],
    }

        if target_gender in ["Women", "Girls"]:
            compatible_types.update({
                "Dresses": ["Heels", "Flats", "Jackets", "Clutches", "Sunglasses"],
                "Tops": ["Skirts", "Shorts", "Jackets"],
            })
        elif target_gender in ["Men", "Boys"]:
            compatible_types.update({
                "Shirts": ["Trousers", "Blazers", "Formal Shoes", "Ties"],
            })

        if target_article_type in compatible_types:
            for compatible_type in compatible_types[target_article_type]:
                recs = get_ml_recommendations(
                    0,  # Dummy index
                    compatible_type,
                    "dummy_id",
                    target_gender,
                    target_color,
                    top_n=2
                )
                if recs:
                    recommendations_dict[compatible_type] = recs

        accessory_list = []
        if target_usage == "Formal":
            accessory_list = ["Belts", "Ties", "Watches", "Cufflinks", "Clutches"]
        elif target_usage == "Sports":
            accessory_list = ["Caps", "Sports Shoes", "Socks", "Wristbands"]
        elif target_usage == "Party":
            accessory_list = ["Jewellery Set", "Clutches", "Heels", "Sunglasses"]
        else:
            accessory_list = ["Sunglasses", "Caps", "Backpacks", "Scarves"]

        for accessory_type in set(accessory_list):
            accessory_recs = get_ml_recommendations(
                0,  # Dummy index
                accessory_type,
                "dummy_id",
                target_gender,
                target_color,
                top_n=2
            )
            if accessory_recs:
                recommendations_dict[accessory_type] = accessory_recs

        return OutfitRecommendation(recommendations=recommendations_dict)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")
