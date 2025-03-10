"""Main FastAPI application with ML model and database integration."""

import base64
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
import uvicorn
import chromadb
from chromadb.utils.embedding_functions import OpenCLIPEmbeddingFunction
from chromadb.utils.data_loaders import ImageLoader


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
    """Class to store ML model and data for the application"""

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


article_type_groups = {
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
    min_dist = float("inf")
    closest = "Black"
    for name, rgb in color_map.items():
        dist = np.linalg.norm(np.array(rgb) - target_rgb)
        if dist < min_dist:
            min_dist, closest = dist, name
    return closest


def predict_attributes(image: Image.Image) -> dict:
    """Predict attributes from image using CLIP model"""
    attributes = {}

    gender_labels = ["Men", "Women", "Boys", "Girls", "Unisex"]
    inputs = ml_model.clip_processor(
        text=gender_labels, images=image, return_tensors="pt", padding=True
    )
    outputs = ml_model.clip_model(**inputs)
    attributes["gender"] = gender_labels[
        outputs.logits_per_image.softmax(dim=1).argmax().item()
    ]

    article_labels = ml_model.df["articleType"].unique().tolist()
    inputs = ml_model.clip_processor(
        text=article_labels, images=image, return_tensors="pt", padding=True
    )
    outputs = ml_model.clip_model(**inputs)
    attributes["articleType"] = article_labels[
        outputs.logits_per_image.softmax(dim=1).argmax().item()
    ]

    season_labels = ["Summer", "Winter", "Spring", "Fall"]
    inputs = ml_model.clip_processor(
        text=season_labels, images=image, return_tensors="pt", padding=True
    )
    outputs = ml_model.clip_model(**inputs)
    attributes["season"] = season_labels[
        outputs.logits_per_image.softmax(dim=1).argmax().item()
    ]

    usage_labels = [
        "Casual",
        "Ethnic",
        "Formal",
        "Sports",
        "Smart Casual",
        "Travel",
        "Party",
        "Home",
    ]
    inputs = ml_model.clip_processor(
        text=usage_labels, images=image, return_tensors="pt", padding=True
    )
    outputs = ml_model.clip_model(**inputs)
    attributes["usage"] = usage_labels[
        outputs.logits_per_image.softmax(dim=1).argmax().item()
    ]

    dominant_color = get_dominant_color(image)
    attributes["baseColour"] = find_closest_color(
        dominant_color, ml_model.df["baseColour"].unique().tolist()
    )

    master_category_labels = [
        "Apparel",
        "Accessories",
        "Footwear",
        "Personal Care",
        "Free Items",
        "Sporting Goods",
        "Home",
    ]
    inputs = ml_model.clip_processor(
        text=master_category_labels, images=image, return_tensors="pt", padding=True
    )
    outputs = ml_model.clip_model(**inputs)
    attributes["masterCategory"] = master_category_labels[
        outputs.logits_per_image.softmax(dim=1).argmax().item()
    ]

    subcategory_labels = [
        "Topwear",
        "Bottomwear",
        "Watches",
        "Socks",
        "Shoes",
        "Belts",
        "Flip Flops",
        "Bags",
        "Innerwear",
        "Sandal",
        "Shoe Accessories",
        "Fragrance",
        "Jewellery",
        "Lips",
        "Saree",
        "Eyewear",
        "Nails",
        "Scarves",
        "Dress",
        "Loungewear and Nightwear",
        "Wallets",
        "Apparel Set",
        "Headwear",
        "Mufflers",
        "Skin Care",
        "Makeup",
        "Free Gifts",
        "Ties",
        "Accessories",
        "Skin",
        "Beauty Accessories",
        "Water Bottle",
        "Eyes",
        "Bath and Body",
        "Gloves",
        "Sports Accessories",
        "Cufflinks",
        "Sports Equipment",
        "Stoles",
        "Hair",
        "Perfumes",
        "Home Furnishing",
        "Umbrellas",
        "Wristbands",
        "Vouchers",
    ]
    inputs = ml_model.clip_processor(
        text=subcategory_labels, images=image, return_tensors="pt", padding=True
    )
    outputs = ml_model.clip_model(**inputs)
    attributes["subCategory"] = subcategory_labels[
        outputs.logits_per_image.softmax(dim=1).argmax().item()
    ]

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

    # Gender-Specific Refinements (within compatible_types)
    for item in [
        "Dresses",
        "Skirts",
        "Heels",
        "Flats",
        "Sarees",
        "Salwar",
        "Kurtis",
        "Lehenga Choli",
        "Tops",
        "Tunics",
        "Jewellery Set",
        "Clutches",
        "Handbags",
    ]:
        compatible_types.setdefault(f"{item} (Women)", compatible_types.get(item, []))
        if item in compatible_types:
            del compatible_types[item]

    for item in [
        "Shirts",
        "Tshirts",
        "Jeans",
        "Trousers",
        "Shorts",
        "Suits",
        "Blazers",
        "Jackets",
        "Formal Shoes",
        "Casual Shoes",
        "Track Pants",
        "Waistcoat",
        "Ties",
        "Belts",
        "Watches",
        "Caps",
        "Sunglasses",
        "Sports Shoes",
        "Flip Flops",
        "Sandals",
    ]:
        compatible_types.setdefault(f"{item} (Men)", compatible_types.get(item, []))
        if item in compatible_types:
            del compatible_types[item]

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

    # Expanded Accessory Lists (more granular)
    formal_accessories = [
        "Belts",
        "Ties",
        "Watches",
        "Cufflinks",
        "Formal Shoes",
        "Pocket Squares",
        "Tie Clips",
    ]  # Add more
    casual_accessories = [
        "Sunglasses",
        "Caps",
        "Backpacks",
        "Casual Shoes",
        "Sneakers",
        "Belts",
        "Watches",
    ]
    sports_accessories = [
        "Caps",
        "Sports Shoes",
        "Socks",
        "Wristbands",
        "Headbands",
        "Sports Bags",
    ]
    party_accessories = [
        "Jewellery",
        "Clutches",
        "Heels",
        "High Heels",
        "Evening Bags",
        "Scarves",
        "Stoles",
    ]  # More specific
    ethnic_accessories = [
        "Jewellery",
        "Bangles",
        "Bindis",
        "Jhumkas",
        "Maang Tikka",
        "Anklets",
        "Sandals",
        "Mojaris",
    ]  # Indian context

    # Seasonal Accessories (refined)
    seasonal_accessories = {
        "Winter": ["Scarves", "Gloves", "Mufflers", "Beanies", "Woolen Caps", "Boots"],
        "Summer": ["Sunglasses", "Flip Flops", "Hats", "Straw Hats", "Sandals"],
        "Spring": ["Light Scarves", "Flats", "Ballerinas", "Cardigans"],
        "Fall": ["Jackets", "Boots", "Ankle Boots", "Scarves", "Light Sweaters"],
    }

    # Combining Accessories (this is NEW logic)
    accessory_combinations = {
        "Formal": formal_accessories,
        "Casual": casual_accessories,
        "Sports": sports_accessories,
        "Party": party_accessories,
        "Ethnic": ethnic_accessories,
        "Travel": [
            "Backpacks",
            "Sunglasses",
            "Comfortable Shoes",
            "Crossbody Bags",
            "Hats",
        ],
        "Home": [],  # Minimal accessories at home
        "Smart Casual": [
            "Belts",
            "Watches",
            "Loafers",
            "Blazers",
            "Chinos",
        ],  # Defined combination
    }

    accessory_list = []
    accessory_list.extend(accessory_combinations.get(target_usage, []))
    accessory_list.extend(seasonal_accessories.get(target_season, []))
    accessory_list = list(set(accessory_list))  # Remove duplicates

    # Now use accessory_list in the existing loop, but consider:

    for accessory_type in accessory_list:
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


@app.get("/api/products", response_model=ProductsResponse)
async def get_random_products(limit: int = 10):
    """
    Returns a random selection of products from the database.

    Args:
        limit (int): Number of products to return (default: 10)
    """
    try:
        all_product_ids = ml_model.df["id"].tolist()

        selected_ids = sample(all_product_ids, min(limit, len(all_product_ids)))

        products = []
        for product_id in selected_ids:
            try:
                product = get_item(str(product_id))
                products.append(Item(**product))
            except HTTPException:
                continue

        return ProductsResponse(products=products)

    except Exception as e:
        print(f"Error fetching random products: {e}")
        raise HTTPException(
            status_code=500, detail="An error occurred while fetching random products"
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

    def color_compatibility(color1: str, color2: str) -> float:
        """
        Calculates a color compatibility score (0.0 to 1.0) based on the color wheel.
        Higher scores indicate better compatibility.
        """
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

        # Handle "Unknown" and missing colors
        if color1 not in color_wheel or color2 not in color_wheel:
            return 0.5  # Neutral compatibility

        # Convert color names to RGB tuples.
        rgb1 = np.array(color_wheel[color1])
        rgb2 = np.array(color_wheel[color2])

        # Calculate Euclidean distance (lower distance = higher similarity).
        distance = np.linalg.norm(rgb1 - rgb2)

        # Normalize distance to a 0-1 scale (approximate).
        # Maximum possible distance is sqrt(3 * 255^2) ≈ 441.67
        max_distance = 441.67
        normalized_distance = distance / max_distance

        # Invert to get compatibility score (higher is better).
        compatibility_score = 1.0 - normalized_distance

        return compatibility_score

    color_scores = category_df["baseColour"].apply(
        lambda x: color_compatibility(target_color, x)
    )

    category_df = category_df[color_scores >= 0.3]
    if category_df.empty:  # Check after filtering
        return []

    def check_negative_constraints(target_item: dict, candidate_item: dict) -> bool:
        """
        Checks for incompatible combinations. Returns True if the combination is ALLOWED,
        False if it should be REJECTED.  Uses helper function for clarity.
        """

        def get_group(article_type: str) -> Optional[str]:
            """Helper function to find the group an article type belongs to."""
            for group_name, types in article_type_groups.items():
                if article_type in types:
                    return group_name
            return None  # Return None if no group is found

        target_group = get_group(target_item["articleType"])
        candidate_group = get_group(candidate_item["articleType"])

        # Handle cases where one or both items don't belong to a defined group.
        if target_group is None or candidate_group is None:
            return True  # Default to allowing if groups are unknown

        # Example: Don't recommend sandals with formal trousers.
        if target_group == "Trousers" and candidate_group == "Casual Shoes":
            # Further refine: Only block if the *specific* type is incompatible.
            if candidate_item["articleType"] in ["Sandals", "Flip Flops"]:
                return False
        if target_group == "Trousers" and candidate_group == "Formal Shoes":
            if candidate_item["articleType"] in ["Sandals", "Flip Flops"]:
                return False

        if target_group == "Shirts" and candidate_group == "Tshirts":
            return False

        if target_group == "Tshirts" and candidate_group == "Shirts":
            return False
        # Don't recommend flip-flops with anything formal.
        if candidate_group == "Casual Shoes" and target_item["usage"] == "Formal":
            if candidate_item["articleType"] in ["Flip Flops"]:
                return False

        # Add more negative constraints here, using group checks!

        return True  # Combination is allowed

    for index, row in category_df.iterrows():
        if not check_negative_constraints(
            ml_model.df.iloc[target_idx].to_dict(), row.to_dict()
        ):
            category_df.drop(index, inplace=True)

    if category_df.empty:  # Check after filtering
        return []

    # --- CRITICAL CHANGE: Calculate color_matches AFTER filtering ---
    # --- CRITICAL CHANGE: Calculate these AFTER all filtering ---
    category_indices = category_df.index.tolist()
    category_features = ml_model.combined_features[category_indices]
    color_matches = (category_df["baseColour"] == target_color).astype(float)

    target_features = ml_model.combined_features[
        target_idx
    ]  # This should be before similarities

    similarities = cosine_similarity(target_features, category_features).flatten()

    similarities += similarities.max() * 0.2 * color_matches  # Now shapes will match

    top_indices = np.argsort(similarities)[-top_n:][::-1]
    results = category_df.iloc[top_indices].to_dict("records")

    for item in results:
        item["image_url"] = f"/static/images/{item['id']}.jpg"
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
            "gender",
            "masterCategory",
            "subCategory",
            "articleType",
            "baseColour",
            "season",
            "usage",
        ]
        categorical_data = [attributes.get(col, "Unknown") for col in categorical_cols]

        onehot = ml_model.onehot_encoder.transform([categorical_data])
        tfidf = ml_model.tfidf_vectorizer.transform([synthetic_name])
        target_features = hstack([onehot, tfidf])

        recommendations_dict = {}
        target_article_type = attributes.get("articleType", "Shirts")
        target_gender = attributes.get("gender", "Unisex")
        target_usage = attributes.get("usage", "Casual")
        target_season = attributes.get(
            "season", "Summer"
        )  # Summer being the most common season (48% in the dataset)
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
            "Sweatshirts": [
                "Jeans",
                "Track Pants",
                "Caps",
                "Sports Shoes",
                "Casual Shoes",
            ],
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
            "Lehenga Choli": [
                "Dupatta",
                "Sandals",
                "Heels",
                "Jewellery",
            ],  # Very specific
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

        # Gender-Specific Refinements (within compatible_types)
        for item in [
            "Dresses",
            "Skirts",
            "Heels",
            "Flats",
            "Sarees",
            "Salwar",
            "Kurtis",
            "Lehenga Choli",
            "Tops",
            "Tunics",
            "Jewellery Set",
            "Clutches",
            "Handbags",
        ]:
            compatible_types.setdefault(
                f"{item} (Women)", compatible_types.get(item, [])
            )
            if item in compatible_types:
                del compatible_types[item]

        for item in [
            "Shirts",
            "Tshirts",
            "Jeans",
            "Trousers",
            "Shorts",
            "Suits",
            "Blazers",
            "Jackets",
            "Formal Shoes",
            "Casual Shoes",
            "Track Pants",
            "Waistcoat",
            "Ties",
            "Belts",
            "Watches",
            "Caps",
            "Sunglasses",
            "Sports Shoes",
            "Flip Flops",
            "Sandals",
        ]:
            compatible_types.setdefault(f"{item} (Men)", compatible_types.get(item, []))
            if item in compatible_types:
                del compatible_types[item]

        if target_gender in ["Women", "Girls"]:
            compatible_types.update(
                {
                    "Dresses": ["Heels", "Flats", "Jackets", "Clutches", "Sunglasses"],
                    "Tops": ["Skirts", "Shorts", "Jackets"],
                }
            )
        elif target_gender in ["Men", "Boys"]:
            compatible_types.update(
                {
                    "Shirts": ["Trousers", "Blazers", "Formal Shoes", "Ties"],
                }
            )

        if target_article_type in compatible_types:
            for compatible_type in compatible_types[target_article_type]:
                recs = get_ml_recommendations(
                    0,  # Dummy index
                    compatible_type,
                    "dummy_id",
                    target_gender,
                    target_color,
                    top_n=2,
                )
                if recs:
                    recommendations_dict[compatible_type] = recs

        # Expanded Accessory Lists (more granular)
        formal_accessories = [
            "Belts",
            "Ties",
            "Watches",
            "Cufflinks",
            "Formal Shoes",
            "Pocket Squares",
            "Tie Clips",
        ]  # Add more
        casual_accessories = [
            "Sunglasses",
            "Caps",
            "Backpacks",
            "Casual Shoes",
            "Sneakers",
            "Belts",
            "Watches",
        ]
        sports_accessories = [
            "Caps",
            "Sports Shoes",
            "Socks",
            "Wristbands",
            "Headbands",
            "Sports Bags",
        ]
        party_accessories = [
            "Jewellery",
            "Clutches",
            "Heels",
            "High Heels",
            "Evening Bags",
            "Scarves",
            "Stoles",
        ]  # More specific
        ethnic_accessories = [
            "Jewellery",
            "Bangles",
            "Bindis",
            "Jhumkas",
            "Maang Tikka",
            "Anklets",
            "Sandals",
            "Mojaris",
        ]  # Indian context

        # Seasonal Accessories (refined)
        seasonal_accessories = {
            "Winter": [
                "Scarves",
                "Gloves",
                "Mufflers",
                "Beanies",
                "Woolen Caps",
                "Boots",
            ],
            "Summer": ["Sunglasses", "Flip Flops", "Hats", "Straw Hats", "Sandals"],
            "Spring": ["Light Scarves", "Flats", "Ballerinas", "Cardigans"],
            "Fall": ["Jackets", "Boots", "Ankle Boots", "Scarves", "Light Sweaters"],
        }

        # Combining Accessories (this is NEW logic)
        accessory_combinations = {
            "Formal": formal_accessories,
            "Casual": casual_accessories,
            "Sports": sports_accessories,
            "Party": party_accessories,
            "Ethnic": ethnic_accessories,
            "Travel": [
                "Backpacks",
                "Sunglasses",
                "Comfortable Shoes",
                "Crossbody Bags",
                "Hats",
            ],
            "Home": [],  # Minimal accessories at home
            "Smart Casual": [
                "Belts",
                "Watches",
                "Loafers",
                "Blazers",
                "Chinos",
            ],  # Defined combination
        }

        accessory_list = []
        accessory_list.extend(accessory_combinations.get(target_usage, []))
        accessory_list.extend(seasonal_accessories.get(target_season, []))
        accessory_list = list(set(accessory_list))  # Remove duplicates

        # Now use accessory_list in the existing loop, but consider:

        for accessory_type in accessory_list:
            accessory_recs = get_ml_recommendations(
                0,  # Dummy index
                accessory_type,
                "dummy_id",
                target_gender,
                target_color,
                top_n=2,
            )
            if accessory_recs:
                recommendations_dict[accessory_type] = accessory_recs

        return OutfitRecommendation(recommendations=recommendations_dict)

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error processing image: {str(e)}"
        ) from e


def get_fashion_collection():
    """Gets a connection to the Fashion collection in ChromaDB.  Handles initialization."""
    chroma_client = chromadb.PersistentClient(
        path="../../database/production_fashion.db"
    )
    image_loader = ImageLoader()
    embedding_function = OpenCLIPEmbeddingFunction()
    return chroma_client.get_collection(
        "fashion",
        embedding_function=embedding_function,
        data_loader=image_loader,
    )


def query_db(query, results=3):
    """Query the database for images that match the text query."""
    fashion_collection = get_fashion_collection()  # Get the collection
    print(f"Querying the database for: {query}")
    results = fashion_collection.query(
        query_texts=[query], n_results=results, include=["uris", "distances"]
    )
    return results


class SearchResult(BaseModel):
    images: List[Dict[str, Any]]


@app.post("/api/search", response_model=SearchResult)
async def search(query: str = Form(...)):
    """Handles search requests from the frontend."""
    try:
        results = query_db(query, results=5)
        results["uris"] = [
            [
                uri.replace(
                    "/kaggle/input/fashion-product-images-dataset/fashion-dataset/", ""
                )
                for uri in results["uris"][0]
            ]
        ]

        image_data = []
        for i in range(len(results["ids"][0])):
            image_path = os.path.join(
                "static/images", os.path.basename(results["uris"][0][i])
            )
            try:
                with open(image_path, "rb") as img_file:
                    encoded_img = base64.b64encode(img_file.read()).decode("utf-8")
                    image_data.append(
                        {
                            "id": results["ids"][0][i],
                            "distance": results["distances"][0][i],
                            "image": f"data:image/jpeg;base64,{encoded_img}",
                        }
                    )
            except FileNotFoundError:
                print(f"Image not found: {image_path}")
                continue

        return {"images": image_data}

    except Exception as e:
        print(f"Error during search: {e}")
        raise HTTPException(status_code=500, detail="An error occurred during search")


if __name__ == "__main__":
    uvicorn.run(
        app, host="localhost", port=8000
    )  # , ssl_keyfile="../../key.pem", ssl_certfile="../../cert.pem"
    # )
