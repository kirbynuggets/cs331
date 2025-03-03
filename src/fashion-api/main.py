from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException
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

app = FastAPI()

# CORS configuration
origins = ["http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database configuration
DATABASE_URL = "mysql+pymysql://fashion_user:securepass@localhost/fashion_db"
engine = create_engine(DATABASE_URL)

# Serve static files
app.mount("/static", StaticFiles(directory="static"), name="static")


# ML Model and Data Storage
class MLModel:
    def __init__(self):
        self.df = None
        self.combined_features = None
        self.id_to_index = {}
        self.vectorizers = {}


# Initialize ML model container
ml_model = MLModel()


@app.on_event("startup")
async def startup_event():
    """Load and preprocess data on startup"""
    with engine.connect() as conn:
        result = conn.execute(text("SELECT * FROM clothing_items"))
        items = result.mappings().all()
        ml_model.df = pd.DataFrame(items)
        ml_model.df["id"] = ml_model.df["id"].astype(str)

        # Preprocess data
        ml_model.df["baseColour"] = ml_model.df["baseColour"].fillna("Unknown")

        # Handle missing productDisplayName values
        ml_model.df["productDisplayName"] = ml_model.df["productDisplayName"].fillna(
            "Unknown"
        )

        # One-hot encoding
        categorical_cols = [
            "gender",
            "masterCategory",
            "subCategory",
            "articleType",
            "baseColour",
            "season",
            "usage",
        ]
        onehot_encoder = OneHotEncoder(
            handle_unknown="ignore"
        )  # Removed `sparse` parameter
        onehot_features = onehot_encoder.fit_transform(ml_model.df[categorical_cols])

        # TF-IDF Vectorization
        tfidf = TfidfVectorizer(stop_words="english", max_features=1000)
        tfidf_features = tfidf.fit_transform(ml_model.df["productDisplayName"])

        # Combine features
        ml_model.combined_features = hstack([onehot_features, tfidf_features])

        # Create ID to index mapping
        ml_model.id_to_index = {
            str(row["id"]): idx for idx, row in ml_model.df.iterrows()
        }


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
    topwear: List[Item]
    bottomwear: List[Item]
    footwear: List[Item]
    accessories: List[Item]


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
        item["image_url"] = f"/static/images/{item['id']}.jpg"
        return item


def get_ml_recommendations(
    target_idx: int, category: str, target_id: str, top_n=5
) -> List[Dict]:
    """Get ML-based recommendations for specific category"""
    df = ml_model.df
    # Filter by category and exclude current item
    mask = (df["subCategory"] == category) & (df["id"] != target_id)
    category_df = df[mask]

    if category_df.empty:
        return []

    # Get feature vectors
    category_indices = category_df.index.tolist()
    category_features = ml_model.combined_features[category_indices]
    target_features = ml_model.combined_features[target_idx]

    # Calculate similarities
    similarities = cosine_similarity(target_features, category_features).flatten()
    top_indices = np.argsort(similarities)[-top_n:][::-1]

    # Prepare results
    results = category_df.iloc[top_indices].to_dict("records")
    for item in results:
        item["image_url"] = f"/static/images/{item['id']}.jpg"
        item["id"] = int(item["id"])
    return results


@app.get("/api/product/{item_id}", response_model=ProductPageResponse)
async def product_page(item_id: str):
    # Get product details
    product = get_item(item_id)
    target_id = str(product["id"])

    if target_id not in ml_model.id_to_index:
        raise HTTPException(status_code=404, detail="Item not found in ML model")
    target_idx = ml_model.id_to_index[target_id]

    # Category mapping rules
    category_mapping = {
        "Topwear": ["Bottomwear", "Footwear", "Belts", "Watches"],
        "Bottomwear": ["Topwear", "Footwear", "Belts"],
        "Footwear": ["Topwear", "Bottomwear", "Socks"],
        "Watches": ["Topwear", "Bottomwear"],
        "Belts": ["Topwear", "Bottomwear"],
        # Add more mappings as needed
    }

    # Get recommendations
    recommendations = OutfitRecommendation(
        topwear=[], bottomwear=[], footwear=[], accessories=[]
    )

    current_category = product["subCategory"]
    compatible_categories = category_mapping.get(current_category, [])

    for category in compatible_categories:
        items = get_ml_recommendations(target_idx, category, target_id)
        for item in items:
            item_obj = Item(**item)
            if category == "Topwear":
                recommendations.topwear.append(item_obj)
            elif category == "Bottomwear":
                recommendations.bottomwear.append(item_obj)
            elif category in ["Footwear", "Shoes"]:
                recommendations.footwear.append(item_obj)
            elif category in ["Belts", "Watches", "Bags"]:
                recommendations.accessories.append(item_obj)

    return ProductPageResponse(product=Item(**product), recommendations=recommendations)
