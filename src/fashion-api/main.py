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
origins = ["http://localhost:3000"]  # Add your frontend URL here
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database configuration
DATABASE_URL = "mysql+pymysql://fashion_user:securepass@localhost/fashion_db"  # Replace with your actual credentials
engine = create_engine(DATABASE_URL)

# Serve static files (ensure your static files are in a 'static' directory)
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

        # Preprocess data (Handle missing values)
        ml_model.df["baseColour"] = ml_model.df["baseColour"].fillna("Unknown")
        ml_model.df["productDisplayName"] = ml_model.df["productDisplayName"].fillna(
            "Unknown"
        )
        ml_model.df["articleType"] = ml_model.df["articleType"].fillna("Unknown")
        ml_model.df["gender"] = ml_model.df["gender"].fillna("Unknown")
        ml_model.df["masterCategory"] = ml_model.df["masterCategory"].fillna("Unknown")
        ml_model.df["subCategory"] = ml_model.df["subCategory"].fillna("Unknown")
        ml_model.df["season"] = ml_model.df["season"].fillna("Unknown")
        ml_model.df["usage"] = ml_model.df["usage"].fillna("Unknown")

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
        onehot_encoder = OneHotEncoder(handle_unknown="ignore")
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
    recommendations: Dict[str, List[Item]]  # Recommendations grouped by article type


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

    # 1. Enhanced Compatibility Rules
    compatible_types = {
        # Tops
        "Shirts": ["Trousers", "Jeans", "Shorts", "Blazers", "Waistcoat", "Formal Shoes", "Belts"],
        "Tshirts": ["Jeans", "Shorts", "Track Pants", "Jackets", "Casual Shoes", "Caps"],
        "Tops": ["Jeans", "Skirts", "Shorts", "Jackets"],
        "Sweatshirts": ["Jeans", "Track Pants", "Caps", "Sports Shoes"],
        "Kurtas": ["Churidar", "Trousers", "Dupatta", "Sandals"],
        
        # Bottoms
        "Jeans": ["Shirts", "Tshirts", "Tops", "Casual Shoes", "Belts"],
        "Trousers": ["Shirts", "Tshirts", "Blazers", "Formal Shoes", "Belts"],
        "Shorts": ["Tshirts", "Casual Shoes", "Sandals"],
        "Leggings": ["Tunics", "Kurtis", "Long Tshirts"],
        "Skirts": ["Tops", "Shirts", "Flats", "Heels"],
        
        # Dresses & Suits
        "Dresses": ["Heels", "Flats", "Jackets", "Clutches", "Jewellery Set"],
        "Jumpsuit": ["Jackets", "Heels", "Sandals"],
        "Lehenga Choli": ["Dupatta", "Sandals", "Jewellery Set"],
        "Suits": ["Formal Shoes", "Shirts", "Ties"],
        
        # Outerwear
        "Blazers": ["Shirts", "Trousers", "Formal Shoes", "Ties"],
        "Jackets": ["Tshirts", "Jeans", "Casual Shoes", "Sweatshirts"],
        
        # Footwear
        "Formal Shoes": ["Trousers", "Shirts", "Belts"],
        "Casual Shoes": ["Jeans", "Tshirts", "Shorts"],
        "Heels": ["Dresses", "Skirts", "Trousers"],
        "Flats": ["Dresses", "Jeans", "Skirts"],
        
        # Ethnic
        "Sarees": ["Sandals", "Jewellery Set", "Clutches"],
        "Salwar": ["Kurtis", "Dupatta", "Sandals"],
    }

    # 2. Gender-Specific Additions
    if target_gender in ["Women", "Girls"]:
        compatible_types.update({
            "Dresses": ["Heels", "Flats", "Jackets", "Clutches", "Sunglasses"],
            "Tops": ["Skirts", "Shorts", "Jackets"],
            "Kurtis": ["Leggings", "Dupatta", "Sandals"],
        })
    elif target_gender in ["Men", "Boys"]:
        compatible_types.update({
            "Shirts": ["Trousers", "Blazers", "Formal Shoes", "Ties"],
            "Tshirts": ["Shorts", "Track Pants", "Sports Shoes"],
        })

    # 3. Get Core Recommendations
    recommendations_dict = {}
    if target_article_type in compatible_types:
        for compatible_type in compatible_types[target_article_type]:
            recommended_items = get_ml_recommendations(
                target_idx, compatible_type, target_id, 
                target_gender, target_color
            )
            if recommended_items:
                recommendations_dict[compatible_type] = [Item(**item) for item in recommended_items]

    # 4. Enhanced Accessory Recommendations
    # Base accessories by usage
    accessory_list = []
    if target_usage == "Formal":
        accessory_list = ["Belts", "Ties", "Watches", "Cufflinks", "Clutches"]
    elif target_usage == "Sports":
        accessory_list = ["Caps", "Sports Shoes", "Socks", "Wristbands"]
    elif target_usage == "Party":
        accessory_list = ["Jewellery Set", "Clutches", "Heels", "Sunglasses"]
    else:  # Casual/Ethnic/etc
        accessory_list = ["Sunglasses", "Caps", "Backpacks", "Scarves"]

    # Seasonal additions
    seasonal_acc = {
        "Winter": ["Scarves", "Gloves", "Mufflers"],
        "Summer": ["Sunglasses", "Flip Flops", "Hats"],
        "Spring": ["Scarves", "Flats"],
        "Fall": ["Jackets", "Mufflers"]
    }.get(target_season, [])
    accessory_list += seasonal_acc

    # Color coordination boost implemented in get_ml_recommendations
    for accessory_type in set(accessory_list):
        accessory_recs = get_ml_recommendations(
            target_idx, accessory_type, target_id,
            target_gender, target_color
        )
        if accessory_recs:
            recommendations_dict[accessory_type] = [Item(**item) for item in accessory_recs]

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
    top_n=3
) -> List[Dict]:
    """Enhanced recommendations with gender and color filters"""
    df = ml_model.df
    
    # Filter by article type, gender, and exclude self
    mask = (
        (df["articleType"] == target_article_type) &
        (df["id"] != target_id) &
        (df["gender"].isin([product_gender, "Unisex"]))
    )
    category_df = df[mask]
    
    if category_df.empty:
        return []

    # Feature processing
    category_indices = category_df.index.tolist()
    category_features = ml_model.combined_features[category_indices]
    target_features = ml_model.combined_features[target_idx]

    # Calculate similarity
    similarities = cosine_similarity(target_features, category_features).flatten()
    
    # Color boost: +20% similarity for matching colors
    color_matches = (category_df["baseColour"] == target_color).astype(float)
    similarities += similarities.max() * 0.2 * color_matches

    # Get top items
    top_indices = np.argsort(similarities)[-top_n:][::-1]
    results = category_df.iloc[top_indices].to_dict("records")
    
    # Format results
    for item in results:
        item["image_url"] = f"/static/images/{item['id']}.jpg"
        item["id"] = int(item["id"])
    return results
