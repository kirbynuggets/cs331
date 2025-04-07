"""Main FastAPI application with ML model and database integration using SQLite and SQLAlchemy."""

import os
from random import sample, shuffle
from typing import List, Dict, Any, Optional
from contextlib import asynccontextmanager
from io import BytesIO
import time

from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, text, Column, Integer, String, Float, select, MetaData, Table, inspect
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Session
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import OneHotEncoder
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.cluster import KMeans
from scipy.sparse import hstack, vstack, csr_matrix
import numpy as np
from PIL import Image
from transformers import CLIPProcessor, CLIPModel
import chromadb
from chromadb.utils.embedding_functions import OpenCLIPEmbeddingFunction
from annoy import AnnoyIndex
from constants import ARTICLE_TYPE_GROUPS, ACCESSORY_COMBINATIONS, SEASONAL_ACCESSORIES, COMPATIBLE_TYPES, COLOR_COMPATIBILITY
import logging
from sklearn.metrics import ndcg_score

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- Configuration ---
DATABASE_URL = "sqlite:///./database/fashion.db" # SQLite database file path
STATIC_DIR = "static"
CHROMA_DB_PATH = "../../database/production_fashion.db" # ChromaDB path - might not be directly used in this version but kept for consistency
CORS_ORIGINS = ["http://localhost:5173", "http://localhost:5174"]
ANNOY_INDEX_PATH = "fashion_annoy_index.ann"
ANNOY_N_TREES = 50
ANNOY_SEARCH_K_FACTOR = 100

# --- SQLAlchemy Setup ---
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class ClothingItemDB(Base):
    """SQLAlchemy model for clothing_items table."""
    __tablename__ = "clothing_items"

    id = Column(Integer, primary_key=True, index=True)
    gender = Column(String)
    masterCategory = Column(String)
    subCategory = Column(String)
    articleType = Column(String)
    baseColour = Column(String)
    season = Column(String)
    usage = Column(String)
    productDisplayName = Column(String)
    price = Column(Float) # New price attribute

def init_db():
    """Initialize the SQLite database and create tables if they don't exist."""
    if not inspect(engine).has_table("clothing_items"):
        Base.metadata.create_all(bind=engine)
        logger.info("Created database tables.")
    else:
        logger.info("Database tables already exist.")


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
    price: Optional[float] = None # Price attribute in the model
    image_url: Optional[str] = None

class OutfitRecommendation(BaseModel):
    recommendations: Dict[str, List[Item]]
    metrics: Optional[Dict[str, float]] = None

class ProductPageResponse(BaseModel):
    product: Item
    recommendations: OutfitRecommendation

class ProductsResponse(BaseModel):
    products: List[Item]

class SearchResult(BaseModel):
    images: List[Dict[str, Any]]

# --- Database Module ---
def load_data() -> pd.DataFrame:
    """Load data from the database using SQLAlchemy."""
    logger.info("Loading data from database...")
    start_time = time.time()
    db: Session = SessionLocal()
    try:
        items = db.query(ClothingItemDB).all()
        df = pd.DataFrame([item.__dict__ for item in items])
        df["id"] = df["id"].astype(str) # Keep IDs as strings internally
    finally:
        db.close()
    logger.info(f"Data loaded in {time.time() - start_time:.2f} seconds. Shape: {df.shape}")
    return df

def get_item(item_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve an item from the database by string ID using SQLAlchemy."""
    try:
        if ml_model.df is None:
            logger.error("DataFrame not loaded.")
            raise HTTPException(status_code=500, detail="Server data not initialized")

        item_series = ml_model.df[ml_model.df["id"] == item_id]
        if item_series.empty:
             logger.warning(f"Item with ID {item_id} not found in dataframe.")
             return None

        item = item_series.iloc[0].to_dict()
        item_id_int = int(item['id'])
        item["id"] = item_id_int
        item["image_url"] = f"/static/images/{item_id_int}.jpg"
        return item
    except Exception as e:
        logger.error(f"Error retrieving item {item_id}: {e}")
        raise HTTPException(status_code=404, detail=f"Item {item_id} retrieval error: {e}")


# --- ML Module ---
class MLModel:
    """Class to store ML model and data for the application."""
    def __init__(self):
        self.df: Optional[pd.DataFrame] = None
        self.combined_features: Optional[csr_matrix] = None
        self.feature_dim: Optional[int] = None
        self.id_to_index: Dict[str, int] = {}
        self.index_to_id: Dict[int, str] = {}
        self.onehot_encoder: Optional[OneHotEncoder] = None
        self.tfidf_vectorizer: Optional[TfidfVectorizer] = None
        self.clip_model: Optional[CLIPModel] = None
        self.clip_processor: Optional[CLIPProcessor] = None
        self.chroma_client: Optional[chromadb.Client] = None
        self.annoy_index: Optional[AnnoyIndex] = None

ml_model = MLModel()

def init_ml_model() -> tuple:
    """Initialize the CLIP model and processor."""
    logger.info("Initializing CLIP model...")
    start_time = time.time()
    clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
    clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
    logger.info(f"CLIP model initialized in {time.time() - start_time:.2f} seconds.")
    return clip_model, clip_processor

def preprocess_data(df: pd.DataFrame) -> tuple:
    """Preprocess the dataframe with enhanced features for ML model."""
    logger.info("Preprocessing data...")
    start_time = time.time()
    columns_to_fill = ["baseColour", "productDisplayName", "articleType", "gender",
                       "masterCategory", "subCategory", "season", "usage"]
    for col in columns_to_fill:
        if col in df.columns:
            mode_val = df[col].mode()
            fill_value = mode_val[0] if not mode_val.empty else "Unknown"
            df[col] = df[col].fillna(fill_value)
            logger.info(f"Filled NaNs in '{col}' with '{fill_value}'")
        else:
            logger.warning(f"Column '{col}' not found in DataFrame during preprocessing.")
            df[col] = "Unknown"

    categorical_cols = ["gender", "masterCategory", "subCategory", "articleType",
                        "baseColour", "season", "usage"]
    categorical_cols = [col for col in categorical_cols if col in df.columns]

    onehot_encoder = OneHotEncoder(handle_unknown="ignore", sparse_output=True)
    if categorical_cols:
        onehot_features = onehot_encoder.fit_transform(df[categorical_cols])
        logger.info(f"OneHotEncoder fitted on columns: {categorical_cols}. Shape: {onehot_features.shape}")
    else:
        logger.warning("No categorical columns found for OneHotEncoding.")
        onehot_features = None

    tfidf_vectorizer = TfidfVectorizer(stop_words="english", max_features=5000, ngram_range=(1, 2))
    if "productDisplayName" in df.columns:
        tfidf_features = tfidf_vectorizer.fit_transform(df["productDisplayName"])
        logger.info(f"TfidfVectorizer fitted. Shape: {tfidf_features.shape}")
    else:
        logger.warning("Column 'productDisplayName' not found for TfidfVectorizer.")
        tfidf_features = None

    feature_list = [f for f in [onehot_features, tfidf_features] if f is not None]
    if not feature_list:
        logger.error("No features generated from OneHot or TF-IDF. Cannot proceed.")
        raise ValueError("Feature generation failed.")
    elif len(feature_list) == 1:
        combined_features = feature_list[0]
    else:
        combined_features = hstack(feature_list).tocsr()

    logger.info(f"Combined features created. Shape: {combined_features.shape}")

    id_to_index = {str(row["id"]): idx for idx, row in df.iterrows()}
    index_to_id = {idx: str(row["id"]) for idx, row in df.iterrows()}

    logger.info(f"Preprocessing completed in {time.time() - start_time:.2f} seconds.")
    return onehot_encoder, tfidf_vectorizer, combined_features, id_to_index, index_to_id


def build_annoy_index(features: csr_matrix, index_path: str):
    """Builds and saves an Annoy index."""
    logger.info("Building Annoy index...")
    start_time = time.time()
    feature_dim = features.shape[1]
    annoy_index = AnnoyIndex(feature_dim, 'angular')

    for i in range(features.shape[0]):
        vector = features[i].toarray().flatten()
        annoy_index.add_item(i, vector)
        if (i + 1) % 5000 == 0:
            logger.info(f"Added {i+1}/{features.shape[0]} items to Annoy index.")

    logger.info(f"Building {ANNOY_N_TREES} trees...")
    annoy_index.build(ANNOY_N_TREES)
    logger.info(f"Annoy index built with {annoy_index.get_n_items()} items in {time.time() - start_time:.2f} seconds.")

    logger.info(f"Saving Annoy index to {index_path}...")
    annoy_index.save(index_path)
    logger.info("Annoy index saved.")
    return annoy_index, feature_dim

def load_annoy_index(feature_dim: int, index_path: str) -> Optional[AnnoyIndex]:
    """Loads an Annoy index from disk."""
    if os.path.exists(index_path):
        logger.info(f"Loading Annoy index from {index_path}...")
        start_time = time.time()
        annoy_index = AnnoyIndex(feature_dim, 'angular')
        annoy_index.load(index_path)
        logger.info(f"Annoy index loaded in {time.time() - start_time:.2f} seconds.")
        return annoy_index
    else:
        logger.warning(f"Annoy index file not found at {index_path}. Index needs to be built.")
        return None

def optimized_mmr(
    target_vector: np.ndarray,
    candidate_indices: List[int],
    candidate_features: csr_matrix,
    top_n: int,
    lambda_param: float = 0.5
) -> List[int]:
    """Optimized MMR selection on a pre-filtered candidate set."""
    if not candidate_indices or candidate_features.shape[0] == 0:
        return []

    num_candidates = candidate_features.shape[0]
    top_n = min(top_n, num_candidates)

    target_vector_2d = target_vector.reshape(1, -1)
    relevance_scores = cosine_similarity(target_vector_2d, candidate_features).flatten()

    diversity_matrix = cosine_similarity(candidate_features)
    np.fill_diagonal(diversity_matrix, -np.inf)

    selected_candidate_idxs = []
    remaining_candidate_idxs = list(range(num_candidates))

    if num_candidates > 0:
        first_selection_idx_in_candidates = np.argmax(relevance_scores)
        selected_candidate_idxs.append(first_selection_idx_in_candidates)
        remaining_candidate_idxs.remove(first_selection_idx_in_candidates)

    while len(selected_candidate_idxs) < top_n and remaining_candidate_idxs:
        mmr_scores = {}
        for idx_in_candidates in remaining_candidate_idxs:
            relevance = relevance_scores[idx_in_candidates]
            if selected_candidate_idxs:
                 max_similarity_to_selected = np.max(diversity_matrix[idx_in_candidates, selected_candidate_idxs])
            else:
                 max_similarity_to_selected = -np.inf

            mmr_score = lambda_param * relevance - (1 - lambda_param) * max_similarity_to_selected
            mmr_scores[idx_in_candidates] = mmr_score

        if not mmr_scores:
            break

        best_next_idx_in_candidates = max(mmr_scores, key=mmr_scores.get)
        selected_candidate_idxs.append(best_next_idx_in_candidates)
        remaining_candidate_idxs.remove(best_next_idx_in_candidates)

    final_selected_original_indices = [candidate_indices[i] for i in selected_candidate_idxs]
    return final_selected_original_indices

def get_ml_recommendations(
    target_features: csr_matrix,
    target_article_type: str,
    product_gender: str,
    target_color: Optional[str],
    target_id: Optional[str] = None,
    top_n: int = 3,
    lambda_mmr: float = 0.5
) -> tuple[List[Dict], float]:
    """Generate recommendations using Annoy and optimized MMR."""
    start_time = time.time()
    df = ml_model.df
    annoy_index = ml_model.annoy_index
    all_features = ml_model.combined_features

    if annoy_index is None or all_features is None or df is None:
        logger.error("ML model components not initialized (Annoy, features, df).")
        return [], 0.0

    target_vector_dense = target_features.toarray().flatten()
    num_neighbors_to_fetch = min(ANNOY_SEARCH_K_FACTOR * top_n * 2, annoy_index.get_n_items())
    annoy_start = time.time()
    initial_indices, _ = annoy_index.get_nns_by_vector(
        target_vector_dense, num_neighbors_to_fetch, search_k=-1, include_distances=True
    )
    logger.info(f"[get_ml_recommendations] Annoy search ({len(initial_indices)} neighbors for {target_id or 'image'}) took {time.time() - annoy_start:.4f}s")

    if not initial_indices:
        logger.warning(f"[get_ml_recommendations] Annoy returned no neighbors for {target_article_type}.")
        return [], 0.0

    filter_start = time.time()

    target_group = next((group for group, types in ARTICLE_TYPE_GROUPS.items() if target_article_type in types), None)

    if target_group:
        candidate_types = ARTICLE_TYPE_GROUPS.get(target_group, [target_article_type])
    else:
        candidate_types = [target_article_type]

    logger.info(f"[get_ml_recommendations] Filtering for request type '{target_article_type}'. Using candidate article types: {candidate_types}")

    candidate_df = df.iloc[initial_indices].copy()

    initial_candidate_count = len(candidate_df)
    logger.debug(f"[get_ml_recommendations] Initial Annoy candidates for {target_article_type}: {initial_candidate_count}")

    type_mask = candidate_df["articleType"].isin(candidate_types)
    candidate_df = candidate_df[type_mask]
    logger.debug(f"[get_ml_recommendations] After type filter {candidate_types}: {len(candidate_df)}")

    gender_mask = candidate_df["gender"].isin([product_gender, "Unisex"])
    candidate_df = candidate_df[gender_mask]
    logger.debug(f"[get_ml_recommendations] After gender filter {[product_gender, 'Unisex']}: {len(candidate_df)}")

    if target_id:
        self_mask = (candidate_df["id"] != target_id)
        candidate_df = candidate_df[self_mask]
        logger.debug(f"[get_ml_recommendations] After self-exclusion filter ({target_id}): {len(candidate_df)}")

    if target_color and not candidate_df.empty:
         color_scores = candidate_df["baseColour"].apply(
             lambda x: color_compatibility(target_color, x if pd.notna(x) else "Unknown")
         )
         min_color_threshold = 0.2 if len(candidate_df[color_scores >= 0.2]) >= top_n else 0.0
         color_mask = color_scores >= min_color_threshold
         candidate_df = candidate_df[color_mask]
         logger.debug(f"[get_ml_recommendations] After color filter (threshold {min_color_threshold}): {len(candidate_df)}")

    filtered_candidate_df = candidate_df

    logger.info(f"[get_ml_recommendations] Filtering took {time.time() - filter_start:.4f}s. Candidates reduced from {initial_candidate_count} to {len(filtered_candidate_df)} for {target_article_type}")

    if filtered_candidate_df.empty:
        logger.warning(f"[get_ml_recommendations] No suitable candidates found after filtering for {target_article_type} (Gender: {product_gender}, Color: {target_color})")
        return [], 0.0

    filtered_original_indices = filtered_candidate_df.index.tolist()
    candidate_features_sparse = all_features[filtered_original_indices]

    mmr_start = time.time()
    selected_original_indices = optimized_mmr(
        target_vector_dense,
        filtered_original_indices,
        candidate_features_sparse,
        top_n,
        lambda_param=lambda_mmr
    )
    logger.info(f"[get_ml_recommendations] MMR selection took {time.time() - mmr_start:.4f}s")

    if not selected_original_indices:
        logger.warning(f"[get_ml_recommendations] MMR did not select any items for {target_article_type}.")
        return [], 0.0

    results_df = df.loc[selected_original_indices]
    results = []
    for _, item_row in results_df.iterrows():
         item_dict = item_row.to_dict()
         if item_dict.get('articleType') not in candidate_types:
             logger.warning(f"MMR selected item {item_dict.get('id')} with unexpected type '{item_dict.get('articleType')}' when filtering for {candidate_types}. Skipping.")
             continue

         item_id_int = int(item_dict['id'])
         item_dict['id'] = item_id_int
         item_dict['image_url'] = f"/static/images/{item_id_int}.jpg"
         results.append(item_dict)


    novelty_score = inverse_popularity_score(results) if results else 0.0

    total_time = time.time() - start_time
    logger.info(f"[get_ml_recommendations] Recommendation generation for {target_article_type} took {total_time:.4f}s. Found {len(results)} items.")

    return results, novelty_score

# --- Utilities ---
def color_compatibility(color1: Optional[str], color2: Optional[str]) -> float:
    """Calculate color compatibility score using COLOR_COMPATIBILITY dictionary."""
    if not color1 or not color2 or color1 == "Unknown" or color2 == "Unknown":
        return 0.1
    if color1 == color2:
        return 1.0
    if color2 in COLOR_COMPATIBILITY.get(color1, []) or color1 in COLOR_COMPATIBILITY.get(color2, []):
        return 0.8
    neutrals = {"Black", "White", "Grey", "Beige", "Navy Blue", "Off White", "Grey Melange"}
    if color1 in neutrals or color2 in neutrals:
        return 0.5
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
        return True

    self_incompatible_groups = {"Tops", "Bottomwear", "Dresses", "Outerwear"}
    accessory_groups = {"Accessories", "Jewellery", "Bags", "Makeup", "Skincare", "Bath and Body", "Haircare", "Fragrance", "Tech Accessories", "Home Decor", "Footwear", "Personal Care"}

    if target_group == candidate_group and target_group in self_incompatible_groups:
        return False

    if target_group in accessory_groups or candidate_group in accessory_groups:
         return True

    if target_item.get("usage") == "Formal" and candidate_item.get("articleType") in ["Flip Flops", "Sports Sandals"]:
         return False
    if candidate_item.get("usage") == "Formal" and target_item.get("articleType") in ["Flip Flops", "Sports Sandals"]:
         return False

    return True


def get_compatible_types(article_type: str) -> List[str]:
    """Get compatible article types from COMPATIBLE_TYPES."""
    return COMPATIBLE_TYPES.get(article_type, [])

def get_accessory_types(usage: str, season: str) -> List[str]:
    """Get accessory types based on usage and season."""
    accessory_list = ACCESSORY_COMBINATIONS.get(usage, []) + SEASONAL_ACCESSORIES.get(season, [])
    return list(set(accessory_list))

# --- Image Processing Utilities ---
def get_dominant_color(image: Image.Image) -> np.ndarray:
    """Get the dominant color from an image."""
    try:
        image = image.resize((100, 100))
        img_array = np.array(image).reshape(-1, 3)
        n_clusters = min(3, len(np.unique(img_array, axis=0)))
        if n_clusters == 0: return np.array([0,0,0])

        kmeans = KMeans(n_clusters=n_clusters, random_state=0, n_init=1).fit(img_array)
        counts = np.bincount(kmeans.labels_)
        return kmeans.cluster_centers_[np.argmax(counts)]
    except Exception as e:
        logger.error(f"Error in get_dominant_color: {e}")
        return np.array([0, 0, 0])

def find_closest_color(target_color: np.ndarray, color_names: List[str]) -> str:
    """Find the closest color name to the target RGB."""
    color_map = {
        "Navy Blue": (0, 0, 128), "Blue": (0, 0, 255), "Black": (0, 0, 0),
        "Silver": (192, 192, 192), "Grey": (128, 128, 128), "Green": (0, 128, 0),
        "Purple": (128, 0, 128), "White": (255, 255, 255), "Beige": (245, 245, 220),
        "Brown": (165, 42, 42), "Bronze": (205, 127, 50), "Teal": (0, 128, 128),
        "Copper": (184, 115, 51), "Pink": (255, 192, 203), "Off White": (253, 253, 247),
        "Maroon": (128, 0, 0), "Red": (255, 0, 0), "Khaki": (240, 230, 140),
        "Orange": (255, 165, 0), "Coffee Brown": (139, 69, 19), "Yellow": (255, 255, 0),
        "Charcoal": (54, 69, 79), "Gold": (255, 215, 0), "Steel": (176, 196, 222),
        "Tan": (210, 180, 140), "Magenta": (255, 0, 255), "Lavender": (230, 230, 250),
        "Sea Green": (46, 139, 87), "Cream": (255, 253, 208), "Peach": (255, 218, 185),
        "Olive": (128, 128, 0), "Skin": (255, 224, 189), "Burgundy": (128, 0, 32),
        "Grey Melange": (190, 190, 190), "Rust": (183, 65, 14), "Rose": (255, 0, 127),
        "Lime Green": (50, 205, 50), "Mauve": (224, 176, 255), "Turquoise Blue": (0, 199, 140),
        "Metallic": (170, 170, 170), "Mustard": (255, 219, 88), "Taupe": (128, 128, 105),
        "Nude": (238, 213, 183), "Mushroom Brown": (189, 183, 107), "Fluorescent Green": (127, 255, 0),
    }
    available_colors = {name: rgb for name, rgb in color_map.items() if name in color_names}
    if not available_colors:
        logger.warning("No matching colors found between color map and dataset unique colors.")
        return "Black"

    target_rgb = target_color.astype(int)
    min_dist = float("inf")
    closest_color_name = list(available_colors.keys())[0]

    for name, rgb in available_colors.items():
        dist = np.linalg.norm(np.array(rgb) - target_rgb)
        if dist < min_dist:
            min_dist = dist
            closest_color_name = name
    return closest_color_name

def predict_attributes(image: Image.Image) -> dict:
    """Predict attributes from an image using CLIP."""
    if not ml_model.clip_model or not ml_model.clip_processor or ml_model.df is None:
        logger.error("CLIP model/processor or DataFrame not initialized for prediction.")
        return {}

    attributes = {}
    start_time = time.time()
    try:
        attribute_labels = {
            "gender": ml_model.df["gender"].unique().tolist(),
            "articleType": ml_model.df["articleType"].unique().tolist(),
            "season": ml_model.df["season"].unique().tolist(),
            "usage": ml_model.df["usage"].unique().tolist(),
            "masterCategory": ml_model.df["masterCategory"].unique().tolist(),
            "subCategory": ml_model.df["subCategory"].unique().tolist(),
        }
        fallback_labels = {
             "gender": ["Men", "Women", "Unisex"],
             "season": ["Summer", "Winter", "Spring", "Fall"],
             "usage": ["Casual", "Formal", "Sports"],
        }

        for label_type, labels in attribute_labels.items():
            if not labels or len(labels) < 2:
                labels = fallback_labels.get(label_type, ["Unknown"])
                logger.warning(f"Using fallback labels for CLIP prediction: {label_type}")

            inputs = ml_model.clip_processor(text=labels, images=image, return_tensors="pt", padding=True, truncation=True)
            outputs = ml_model.clip_model(**inputs)
            logits_per_image = outputs.logits_per_image
            probs = logits_per_image.softmax(dim=1)
            predicted_index = probs.argmax().item()
            attributes[label_type] = labels[predicted_index]

        dominant_color_rgb = get_dominant_color(image)
        unique_base_colors = ml_model.df["baseColour"].unique().tolist()
        attributes["baseColour"] = find_closest_color(dominant_color_rgb, unique_base_colors)

        logger.info(f"CLIP attribute prediction took {time.time() - start_time:.2f}s")
        return attributes

    except Exception as e:
        logger.error(f"Error during CLIP prediction: {e}", exc_info=True)
        return {}


# --- Application Setup ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle startup and shutdown events."""
    logger.info("Application startup...")
    await startup_event()
    yield
    logger.info("Application shutdown.")
    if ml_model.annoy_index:
        ml_model.annoy_index.unload()
        logger.info("Annoy index unloaded.")

app = FastAPI(lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=CORS_ORIGINS, allow_credentials=True,
                   allow_methods=["*"], allow_headers=["*"])
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

async def startup_event():
    """Initialize application resources on startup."""
    logger.info("Running startup event...")
    try:
        start_total = time.time()
        init_db() # Initialize database on startup
        ml_model.df = load_data()
        if ml_model.df.empty:
             raise RuntimeError("Failed to load data, DataFrame is empty.")

        (ml_model.onehot_encoder, ml_model.tfidf_vectorizer,
         ml_model.combined_features, ml_model.id_to_index,
         ml_model.index_to_id) = preprocess_data(ml_model.df)

        if ml_model.combined_features is None:
            raise RuntimeError("Feature preprocessing failed, combined_features is None.")

        ml_model.feature_dim = ml_model.combined_features.shape[1]

        ml_model.annoy_index = load_annoy_index(ml_model.feature_dim, ANNOY_INDEX_PATH)
        if ml_model.annoy_index is None:
            logger.info("Building Annoy index from scratch...")
            ml_model.annoy_index, _ = build_annoy_index(ml_model.combined_features, ANNOY_INDEX_PATH)
        elif ml_model.annoy_index.get_n_items() != ml_model.combined_features.shape[0]:
             logger.warning(f"Annoy index item count ({ml_model.annoy_index.get_n_items()}) "
                            f"mismatches feature count ({ml_model.combined_features.shape[0]}). Rebuilding.")
             ml_model.annoy_index.unload()
             ml_model.annoy_index, _ = build_annoy_index(ml_model.combined_features, ANNOY_INDEX_PATH)


        ml_model.clip_model, ml_model.clip_processor = init_ml_model()

        try:
            ml_model.chroma_client = chromadb.PersistentClient(path=CHROMA_DB_PATH)
            try:
                 ml_model.chroma_client.get_collection("fashion")
                 logger.info("ChromaDB client initialized and 'fashion' collection found.")
            except Exception:
                 logger.warning("ChromaDB 'fashion' collection not found. Search endpoint might fail.")
        except Exception as e:
            logger.error(f"Failed to initialize ChromaDB client at {CHROMA_DB_PATH}: {e}", exc_info=True)


        logger.info(f"Total startup time: {time.time() - start_total:.2f} seconds.")

    except Exception as e:
        logger.error(f"Error during application startup: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Critical error during startup: {e}") from e


# --- Endpoints ---
@app.get("/api/product/{item_id}", response_model=ProductPageResponse)
async def product_page(item_id: str):
    """Get product details and outfit recommendations."""
    logger.info(f"Received request for product page: {item_id}")
    start_time = time.time()

    try:
        item_id_int = int(item_id)
        if item_id_int <= 0:
            raise ValueError("Item ID must be a positive integer.")
    except ValueError:
        logger.error(f"Invalid item_id format: {item_id}")
        raise HTTPException(status_code=400, detail="Invalid item ID format.")

    product = get_item(item_id)
    if product is None:
        logger.error(f"Product {item_id} not found.")
        raise HTTPException(status_code=404, detail="Item not found")

    target_idx = ml_model.id_to_index.get(item_id)
    if target_idx is None or ml_model.combined_features is None:
        logger.error(f"Could not find index or features for item {item_id}")
        raise HTTPException(status_code=404, detail="Item data or features not found.")

    target_features = ml_model.combined_features[target_idx]
    target_gender, target_usage, target_season = product["gender"], product["usage"], product["season"]
    target_color, target_article_type = product.get("baseColour"), product["articleType"]

    compatible_types_list = get_compatible_types(target_article_type)
    accessory_types = get_accessory_types(target_usage, target_season)

    recommendations_dict = {}
    metrics_agg = {'novelty': []}

    all_target_types = list(set(compatible_types_list + accessory_types))

    logger.info(f"Generating recommendations for types: {all_target_types}")

    for rec_type in all_target_types:
        recs, novelty = get_ml_recommendations(
            target_features,
            rec_type,
            target_gender,
            target_color,
            target_id=item_id,
            top_n=5
        )

        filtered_recs = [item for item in recs if check_negative_constraints(product, item)][:3]

        if filtered_recs:
            recommendations_dict[rec_type] = [Item(**item) for item in filtered_recs]
            metrics_agg['novelty'].append(novelty)

    avg_metrics = {k: np.mean(v) if v else 0.0 for k, v in metrics_agg.items()}

    logger.info(f"Product page request for {item_id} completed in {time.time() - start_time:.2f}s")
    return ProductPageResponse(
        product=Item(**product),
        recommendations=OutfitRecommendation(recommendations=recommendations_dict, metrics=avg_metrics)
    )


@app.get("/api/products", response_model=ProductsResponse)
async def get_random_products(limit: int = 10):
    """Return a random selection of products."""
    if ml_model.df is None or ml_model.df.empty:
        raise HTTPException(status_code=500, detail="Product data not available.")

    try:
        limit = min(limit, len(ml_model.df))
        limit = max(1, limit)

        random_ids = sample(ml_model.df["id"].tolist(), limit)
        products = [Item(**get_item(pid)) for pid in random_ids if get_item(pid) is not None]

        if not products:
             logger.warning("Failed to retrieve details for randomly sampled products.")
             return ProductsResponse(products=[])

        return ProductsResponse(products=products)
    except Exception as e:
        logger.error(f"Error fetching random products: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Error fetching random products")

@app.post("/api/recommend-from-image", response_model=OutfitRecommendation)
async def recommend_from_image(file: UploadFile = File(...)):
    """Recommend outfits based on an uploaded image."""
    start_time = time.time()
    if not ml_model.onehot_encoder or not ml_model.tfidf_vectorizer or not ml_model.clip_model:
         raise HTTPException(status_code=500, detail="ML models not initialized for image recommendation.")

    try:
        contents = await file.read()
        image = Image.open(BytesIO(contents)).convert("RGB")

        attributes = predict_attributes(image)
        if not attributes:
            raise HTTPException(status_code=400, detail="Could not extract attributes from image.")

        logger.info(f"Predicted attributes: {attributes}")

        synthetic_name = f"{attributes.get('gender', 'Unisex')}'s {attributes.get('baseColour', '')} {attributes.get('articleType', 'Fashion Item')}"
        categorical_data = [attributes.get(col, "Unknown") for col in ["gender", "masterCategory", "subCategory", "articleType", "baseColour", "season", "usage"]]

        try:
            onehot = ml_model.onehot_encoder.transform([categorical_data])
            tfidf = ml_model.tfidf_vectorizer.transform([synthetic_name])
            target_features = hstack([onehot, tfidf]).tocsr()
        except Exception as e:
            logger.error(f"Error transforming predicted attributes: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail="Error processing predicted attributes")


        target_article_type = attributes.get("articleType", "Shirts")
        target_gender = attributes.get("gender", "Unisex")
        target_usage = attributes.get("usage", "Casual")
        target_season = attributes.get("season", "Summer")
        target_color = attributes.get("baseColour", None)


        compatible_types_list = get_compatible_types(target_article_type)
        accessory_types = get_accessory_types(target_usage, target_season)
        all_target_types = list(set(compatible_types_list + accessory_types))

        recommendations_dict = {}
        metrics_agg = {'novelty': []}

        logger.info(f"Generating recommendations from image for types: {all_target_types}")

        for rec_type in all_target_types:
             recs, novelty = get_ml_recommendations(
                 target_features, rec_type, target_gender, target_color, target_id=None, top_n=3
             )
             if recs:
                 recommendations_dict[rec_type] = [Item(**item) for item in recs]
                 metrics_agg['novelty'].append(novelty)

        avg_metrics = {k: np.mean(v) if v else 0.0 for k, v in metrics_agg.items()}

        logger.info(f"Image recommendation request completed in {time.time() - start_time:.2f}s")
        return OutfitRecommendation(recommendations=recommendations_dict, metrics=avg_metrics)

    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error processing image recommendation: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")


@app.post("/api/search", response_model=SearchResult)
async def search(query: str = Form(...)):
    """Search for images based on a text query using ChromaDB."""
    if ml_model.chroma_client is None:
        raise HTTPException(status_code=503, detail="Search service not available (ChromaDB not initialized).")
    if not query or query.isspace():
         raise HTTPException(status_code=400, detail="Search query cannot be empty.")

    start_time = time.time()
    try:
        try:
            fashion_collection = ml_model.chroma_client.get_collection(
                "fashion",
                embedding_function=OpenCLIPEmbeddingFunction(),
            )
        except Exception as e:
            logger.error(f"Could not get ChromaDB collection 'fashion': {e}")
            raise HTTPException(status_code=500, detail="Search collection unavailable.")

        results = fashion_collection.query(
            query_texts=[query],
            n_results=10,
            include=["metadatas", "distances", "uris"]
        )
        logger.info(f"ChromaDB query took {time.time() - start_time:.2f}s")

        image_data = []
        if results and results.get("ids") and results["ids"][0]:
            ids = results["ids"][0]
            distances = results["distances"][0]
            metadatas = results["metadatas"][0] if results.get("metadatas") else [{}] * len(ids)
            uris = results.get("uris", [[]])[0]

            for i, item_id in enumerate(ids):
                try:
                    img_filename = f"{int(item_id)}.jpg"
                    image_path = os.path.join(STATIC_DIR, "images", img_filename)
                    if os.path.exists(image_path):
                        image_url = f"/static/images/{img_filename}"
                        image_data.append({
                            "id": item_id,
                            "distance": distances[i],
                            "image_url": image_url,
                            "metadata": metadatas[i]
                        })
                    else:
                        logger.warning(f"Image file not found for Chroma result ID {item_id}: {image_path}")
                except ValueError:
                     logger.warning(f"Chroma result ID {item_id} is not numeric, cannot construct image URL.")
                except Exception as e:
                    logger.error(f"Error processing Chroma result {item_id}: {e}")

        image_data = image_data[:5]

        return SearchResult(images=image_data)

    except Exception as e:
        logger.error(f"Error during search query '{query}': {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"An error occurred during search: {str(e)}")


# --- Evaluation Metrics & Endpoints ---

def popularity_based_recommender(top_n=5):
    """Generates recommendations based on most popular article types."""
    if ml_model.df is None or 'articleType' not in ml_model.df.columns:
        return []
    popularity = ml_model.df['articleType'].value_counts()
    num_popular_types = min(top_n, len(popularity))
    if num_popular_types == 0:
        return []
    popular_types = popularity.index[:num_popular_types]

    recs = []
    available_items = ml_model.df[ml_model.df['articleType'].isin(popular_types)].copy()
    if available_items.empty:
        return []

    sampled_items = available_items.groupby('articleType').apply(lambda x: x.sample(frac=1).head(1)).reset_index(drop=True)

    remaining_needed = top_n - len(sampled_items)
    if remaining_needed > 0 and len(ml_model.df) > len(sampled_items):
        exclude_ids = sampled_items['id'].tolist() if not sampled_items.empty else []
        additional_samples = ml_model.df[~ml_model.df['id'].isin(exclude_ids)].sample(min(remaining_needed, len(ml_model.df) - len(exclude_ids)))
        sampled_items = pd.concat([sampled_items, additional_samples], ignore_index=True)

    return sampled_items.head(top_n).to_dict('records')


def random_recommender(top_n=5):
    """Generates random recommendations."""
    if ml_model.df is None or ml_model.df.empty:
        return []
    actual_n = min(top_n, len(ml_model.df))
    if actual_n == 0:
        return []
    return ml_model.df.sample(actual_n).to_dict('records')

def inverse_popularity_score(recommendations: List[Dict]):
    """Calculates novelty based on inverse popularity of article types."""
    if not recommendations or ml_model.df is None or 'articleType' not in ml_model.df.columns:
        return 0.0
    try:
        type_counts = ml_model.df['articleType'].value_counts()
        total_items = len(ml_model.df)
        if total_items == 0: return 0.0

        scores = []
        for item in recommendations:
            item_type = item.get('articleType')
            if item_type:
                count = type_counts.get(item_type, 0)
                popularity = count / total_items
                scores.append(1 - popularity)
            else:
                scores.append(0.5)

        return np.mean(scores) if scores else 0.0
    except Exception as e:
        logger.error(f"Error calculating inverse popularity score: {e}")
        return 0.0


def get_true_relevances(target_features_sparse, recommended_items, id_to_index_map, all_features_sparse):
    """Calculates true relevance (cosine similarity) for recommended items."""
    indices = [id_to_index_map.get(str(item.get('id'))) for item in recommended_items
               if str(item.get('id')) in id_to_index_map]

    if not indices:
        return np.array([])

    valid_indices = [idx for idx in indices if idx is not None]
    if not valid_indices:
        return np.array([])

    try:
        if hasattr(target_features_sparse, "toarray"):
             target_features_dense_2d = target_features_sparse.toarray().reshape(1, -1)
        else:
             target_features_dense_2d = np.asarray(target_features_sparse).reshape(1, -1)

        recommended_features = all_features_sparse[valid_indices]

        relevances = cosine_similarity(
            target_features_dense_2d,
            recommended_features
        )[0]
        return np.asarray(relevances)
    except Exception as e:
        logger.error(f"Error calculating relevances: {e}", exc_info=True)
        return np.array([])

@app.get("/api/evaluate")
async def evaluate_recommendations():
    """Evaluates ML recommender against baselines with NDCG metrics."""
    if ml_model.df is None or ml_model.combined_features is None:
        raise HTTPException(status_code=500, detail="Evaluation cannot run: Data or features not loaded.")

    try:
        target_product = ml_model.df.sample(1).iloc[0].to_dict()
        target_id = str(target_product['id'])
        target_idx = ml_model.id_to_index[target_id]
        target_features = ml_model.combined_features[target_idx]

        ml_recs, ml_novelty = get_ml_recommendations(
            target_features,
            target_product['articleType'],
            target_product['gender'],
            target_product.get('baseColour'),
            target_id,
            top_n=5
        )

        popularity_recs_list = popularity_based_recommender(top_n=5)
        random_recs_list = random_recommender(top_n=5)

        def get_scores(recommendations):
            indices = [ml_model.id_to_index[str(item['id'])] for item in recommendations]
            return cosine_similarity(
                target_features.toarray(),
                ml_model.combined_features[indices].toarray()
            )[0] if indices else []

        try:
            ml_relevances = get_scores(ml_recs)
            ml_scores = ml_relevances
        except Exception as e:
            logger.error(f"Error calculating ML relevances: {e}")
            ml_relevances = []

        if len(ml_relevances) >= 5:
            ml_ndcg = ndcg_score(
                np.asarray([ml_relevances]),
                np.asarray([ml_scores]),
                k=5
            )
        else:
            ml_ndcg = 0.0

        pop_relevances = get_scores(popularity_recs_list)
        pop_scores = [ml_model.df['articleType'].value_counts()[item['articleType']]
                     for item in popularity_recs_list]
        pop_ndcg = ndcg_score([pop_relevances], [pop_scores], k=5) if pop_relevances is not None else 0.0

        rand_relevances = get_scores(random_recs_list)
        rand_scores = np.random.rand(len(rand_relevances))
        rand_ndcg = ndcg_score([rand_relevances], [rand_scores], k=5) if rand_relevances is not None else 0.0

        return {
            "target_item_id": int(target_id),
            "ML Model": {
                "Novelty": ml_novelty,
                "NDCG@5": ml_ndcg,
                "recommendations": [item['id'] for item in ml_recs]
            },
            "Popularity Baseline": {
                "Novelty": inverse_popularity_score(popularity_recs_list),
                "NDCG@5": pop_ndcg,
                "recommendations": [item['id'] for item in popularity_recs_list]
            },
            "Random Baseline": {
                "Novelty": inverse_popularity_score(random_recs_list),
                "NDCG@5": rand_ndcg,
                "recommendations": [item['id'] for item in random_recs_list]
            }
        }

    except Exception as e:
        logger.error(f"Evaluation error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/evaluate-all")
async def evaluate_all_products(sample_size: int = 1000, k: int = 5):
    """Evaluates ML recommender against baselines across many products with corrected NDCG."""
    if ml_model.df is None or ml_model.combined_features is None:
        raise HTTPException(status_code=500, detail="Evaluation cannot run: Data or features not loaded.")

    try:
        if sample_size <= 0 or sample_size > len(ml_model.df):
             eval_sample = ml_model.df
             actual_sample_size = len(ml_model.df)
        else:
            actual_sample_size = sample_size
            eval_sample = ml_model.df.sample(n=actual_sample_size, random_state=42)

        logger.info(f"Starting corrected evaluation on {len(eval_sample)} products (k={k})...")
        start_time = time.time()

        metrics = {
            'ml_model': {'ndcg': [], 'novelty': []},
            'popularity': {'ndcg': [], 'novelty': []},
            'random': {'ndcg': [], 'novelty': []},
        }

        processed_count = 0
        for _, target_product_series in eval_sample.iterrows():
            target_product = target_product_series.to_dict()
            try:
                target_id = str(target_product['id'])
                if target_id not in ml_model.id_to_index:
                     logger.warning(f"Skipping product {target_id}: Not found in id_to_index map.")
                     continue

                target_idx = ml_model.id_to_index[target_id]
                target_features = ml_model.combined_features[target_idx]

                ml_recs, ml_novelty = get_ml_recommendations(
                    target_features,
                    target_product['articleType'],
                    target_product['gender'],
                    target_product.get('baseColour'),
                    target_id,
                    top_n=k
                )

                ml_true_relevances = get_true_relevances(
                    target_features, ml_recs, ml_model.id_to_index, ml_model.combined_features
                )

                num_ml_recs = len(ml_recs)
                ml_scores_by_rank = np.arange(num_ml_recs, 0, -1)

                if ml_true_relevances.size > 0 and ml_scores_by_rank.size > 0:
                     ml_ndcg = ndcg_score([ml_true_relevances], [ml_scores_by_rank], k=k)
                else:
                     ml_ndcg = 0.0

                metrics['ml_model']['ndcg'].append(ml_ndcg)
                metrics['ml_model']['novelty'].append(ml_novelty)

                popularity_recs = popularity_based_recommender(top_n=k)
                pop_true_relevances = get_true_relevances(
                    target_features, popularity_recs, ml_model.id_to_index, ml_model.combined_features
                )
                num_pop_recs = len(popularity_recs)
                pop_scores_by_rank = np.arange(num_pop_recs, 0, -1)

                if pop_true_relevances.size > 0 and pop_scores_by_rank.size > 0:
                     pop_ndcg = ndcg_score([pop_true_relevances], [pop_scores_by_rank], k=k)
                else:
                     pop_ndcg = 0.0

                metrics['popularity']['ndcg'].append(pop_ndcg)
                metrics['popularity']['novelty'].append(inverse_popularity_score(popularity_recs))

                random_recs = random_recommender(top_n=k)
                rand_true_relevances = get_true_relevances(
                    target_features, random_recs, ml_model.id_to_index, ml_model.combined_features
                )
                num_rand_recs = len(random_recs)
                rand_scores_by_rank = np.arange(num_rand_recs, 0, -1)

                if rand_true_relevances.size > 0 and rand_scores_by_rank.size > 0:
                     rand_ndcg = ndcg_score([rand_true_relevances], [rand_scores_by_rank], k=k)
                else:
                     rand_ndcg = 0.0

                metrics['random']['ndcg'].append(rand_ndcg)
                metrics['random']['novelty'].append(inverse_popularity_score(random_recs))

                processed_count += 1
                if processed_count % 100 == 0:
                    logger.info(f"Processed {processed_count}/{actual_sample_size} products...")

            except Exception as e:
                logger.warning(f"Error evaluating product {target_product.get('id', 'Unknown')}: {str(e)}", exc_info=False)
                continue

        results = {
            "num_products_evaluated": processed_count,
            "evaluation_time_seconds": time.time() - start_time,
            "metrics": {},
            "improvement_over_popularity": {}
        }

        for model_name in ['ml_model', 'popularity', 'random']:
            results["metrics"][model_name] = {
                f"ndcg@{k}_mean": np.mean(metrics[model_name]['ndcg']) if metrics[model_name]['ndcg'] else 0.0,
                f"ndcg@{k}_std": np.std(metrics[model_name]['ndcg']) if metrics[model_name]['ndcg'] else 0.0,
                "novelty_mean": np.mean(metrics[model_name]['novelty']) if metrics[model_name]['novelty'] else 0.0,
            }
            if model_name == 'popularity': results["metrics"]["popularity_baseline"] = results["metrics"].pop("popularity")
            if model_name == 'random': results["metrics"]["random_baseline"] = results["metrics"].pop("random")


        pop_ndcg_mean = results["metrics"]["popularity_baseline"][f"ndcg@{k}_mean"]
        pop_novelty_mean = results["metrics"]["popularity_baseline"]["novelty_mean"]
        ml_ndcg_mean = results["metrics"]["ml_model"][f"ndcg@{k}_mean"]
        ml_novelty_mean = results["metrics"]["ml_model"]["novelty_mean"]


        results["improvement_over_popularity"] = {
            f"ndcg@{k}": (ml_ndcg_mean - pop_ndcg_mean) / pop_ndcg_mean if pop_ndcg_mean > 1e-9 else float('inf'),
            "novelty": (ml_novelty_mean - pop_novelty_mean) / pop_novelty_mean if pop_novelty_mean > 1e-9 else float('inf'),
        }

        logger.info(f"Corrected evaluation completed in {results['evaluation_time_seconds']:.2f} seconds")
        return results

    except Exception as e:
        logger.error(f"Full evaluation error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Evaluation failed: {str(e)}")


# --- Optional: Add root endpoint or health check ---
@app.get("/")
async def read_root():
    return {"message": "Fashion Recommendation API is running."}

@app.get("/health")
async def health_check():
    if ml_model.df is not None and not ml_model.df.empty:
        return {"status": "ok", "message": f"Data loaded ({len(ml_model.df)} items)"}
    else:
        return {"status": "error", "message": "Data not loaded"}
