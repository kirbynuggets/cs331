"""Main FastAPI application with ML model and database integration."""

import os
from random import sample, shuffle
from typing import List, Dict, Any, Optional
from contextlib import asynccontextmanager
from io import BytesIO
import time  # For timing

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
from scipy.sparse import hstack, vstack, csr_matrix
import numpy as np
from PIL import Image
from transformers import CLIPProcessor, CLIPModel
import chromadb
from chromadb.utils.embedding_functions import OpenCLIPEmbeddingFunction
from chromadb.utils.data_loaders import ImageLoader
from annoy import AnnoyIndex  # Import Annoy
from constants import ARTICLE_TYPE_GROUPS, ACCESSORY_COMBINATIONS, SEASONAL_ACCESSORIES, COMPATIBLE_TYPES, COLOR_COMPATIBILITY
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- Configuration ---
DATABASE_URL = "mysql+pymysql://fashion_user:securepass@localhost/fashion_db"
STATIC_DIR = "static"
CHROMA_DB_PATH = "../../database/production_fashion.db"
CORS_ORIGINS = ["http://localhost:5173", "http://localhost:5174"]
ANNOY_INDEX_PATH = "fashion_annoy_index.ann"
ANNOY_N_TREES = 50 # More trees = higher precision, slower build
ANNOY_SEARCH_K_FACTOR = 100 # How many neighbors to retrieve initially (top_n * factor)

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
    metrics: Optional[Dict[str, float]] = None # To optionally return metrics

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
    logger.info("Loading data from database...")
    start_time = time.time()
    with engine.connect() as conn:
        result = conn.execute(text("SELECT * FROM clothing_items"))
        items = result.mappings().all()
        df = pd.DataFrame(items)
        df["id"] = df["id"].astype(str) # Keep IDs as strings internally for consistency
    logger.info(f"Data loaded in {time.time() - start_time:.2f} seconds. Shape: {df.shape}")
    return df

def get_item(item_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve an item from the preloaded dataframe by string ID."""
    try:
        # Ensure ml_model.df is loaded
        if ml_model.df is None:
            logger.error("DataFrame not loaded.")
            raise HTTPException(status_code=500, detail="Server data not initialized")

        item_series = ml_model.df[ml_model.df["id"] == item_id]
        if item_series.empty:
             logger.warning(f"Item with ID {item_id} not found in dataframe.")
             return None # Return None instead of raising exception immediately

        item = item_series.iloc[0].to_dict()
        # Convert id back to int for the Pydantic model and add image URL
        item_id_int = int(item['id'])
        item["id"] = item_id_int
        item["image_url"] = f"/static/images/{item_id_int}.jpg"
        # Verify image file exists
        # if not os.path.exists(os.path.join(STATIC_DIR, "images", f"{item_id_int}.jpg")):
        #     item["image_url"] = None # Or a placeholder image URL
        return item
    except Exception as e:
        logger.error(f"Error retrieving item {item_id}: {e}")
        # Raise HTTPException here if item is absolutely required and not found
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
        self.annoy_index: Optional[AnnoyIndex] = None # Add Annoy index

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
    # Fill missing values robustly
    columns_to_fill = ["baseColour", "productDisplayName", "articleType", "gender",
                       "masterCategory", "subCategory", "season", "usage"]
    for col in columns_to_fill:
        if col in df.columns:
            # Determine the most frequent value or use "Unknown"
            mode_val = df[col].mode()
            fill_value = mode_val[0] if not mode_val.empty else "Unknown"
            df[col] = df[col].fillna(fill_value)
            logger.info(f"Filled NaNs in '{col}' with '{fill_value}'")
        else:
            logger.warning(f"Column '{col}' not found in DataFrame during preprocessing.")
            df[col] = "Unknown" # Add the column if missing

    categorical_cols = ["gender", "masterCategory", "subCategory", "articleType",
                        "baseColour", "season", "usage"]
    # Ensure all categorical columns exist
    categorical_cols = [col for col in categorical_cols if col in df.columns]

    onehot_encoder = OneHotEncoder(handle_unknown="ignore", sparse_output=True)
    # Check if categorical columns exist before fitting
    if categorical_cols:
        onehot_features = onehot_encoder.fit_transform(df[categorical_cols])
        logger.info(f"OneHotEncoder fitted on columns: {categorical_cols}. Shape: {onehot_features.shape}")
    else:
        logger.warning("No categorical columns found for OneHotEncoding.")
        onehot_features = None # Or a zero matrix of appropriate size if needed later

    # TF-IDF Vectorization
    tfidf_vectorizer = TfidfVectorizer(stop_words="english", max_features=5000, ngram_range=(1, 2))
    if "productDisplayName" in df.columns:
        tfidf_features = tfidf_vectorizer.fit_transform(df["productDisplayName"])
        logger.info(f"TfidfVectorizer fitted. Shape: {tfidf_features.shape}")
    else:
        logger.warning("Column 'productDisplayName' not found for TfidfVectorizer.")
        tfidf_features = None # Or a zero matrix

    # Combine features
    feature_list = [f for f in [onehot_features, tfidf_features] if f is not None]
    if not feature_list:
        logger.error("No features generated from OneHot or TF-IDF. Cannot proceed.")
        raise ValueError("Feature generation failed.")
    elif len(feature_list) == 1:
        combined_features = feature_list[0]
    else:
        combined_features = hstack(feature_list).tocsr() # Ensure CSR format

    logger.info(f"Combined features created. Shape: {combined_features.shape}")

    # Create ID to index mapping and vice-versa
    id_to_index = {str(row["id"]): idx for idx, row in df.iterrows()}
    index_to_id = {idx: str(row["id"]) for idx, row in df.iterrows()}

    logger.info(f"Preprocessing completed in {time.time() - start_time:.2f} seconds.")
    return onehot_encoder, tfidf_vectorizer, combined_features, id_to_index, index_to_id


def build_annoy_index(features: csr_matrix, index_path: str):
    """Builds and saves an Annoy index."""
    logger.info("Building Annoy index...")
    start_time = time.time()
    feature_dim = features.shape[1]
    annoy_index = AnnoyIndex(feature_dim, 'angular') # Cosine distance

    for i in range(features.shape[0]):
        vector = features[i].toarray().flatten() # Annoy needs dense vectors
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
    lambda_param: float = 0.5 # Default lambda balance relevance/diversity
) -> List[int]:
    """
    Optimized MMR selection on a pre-filtered candidate set.

    Args:
        target_vector: Dense feature vector of the target item.
        candidate_indices: List of *original* indices (from the full dataset)
                           of the candidate items.
        candidate_features: Sparse feature matrix (CSR) containing only the rows
                            corresponding to candidate_indices.
        top_n: Number of items to select.
        lambda_param: Balance parameter (0=max diversity, 1=max relevance).

    Returns:
        List of *original* indices of the selected items.
    """
    if not candidate_indices or candidate_features.shape[0] == 0:
        return []

    num_candidates = candidate_features.shape[0]
    # Ensure top_n is not greater than the number of candidates
    top_n = min(top_n, num_candidates)

    # Calculate relevance (similarity to target)
    # Ensure target_vector is 2D for cosine_similarity
    target_vector_2d = target_vector.reshape(1, -1)
    relevance_scores = cosine_similarity(target_vector_2d, candidate_features).flatten()

    # Calculate intra-candidate similarity (for diversity)
    # This is the most expensive step, but done on a smaller set
    diversity_matrix = cosine_similarity(candidate_features)
    np.fill_diagonal(diversity_matrix, -np.inf) # Avoid selecting the same item

    selected_candidate_idxs = [] # Indices *within the candidate set*
    remaining_candidate_idxs = list(range(num_candidates))

    # Initial selection: highest relevance
    if num_candidates > 0:
        first_selection_idx_in_candidates = np.argmax(relevance_scores)
        selected_candidate_idxs.append(first_selection_idx_in_candidates)
        remaining_candidate_idxs.remove(first_selection_idx_in_candidates)

    # Iterative MMR selection
    while len(selected_candidate_idxs) < top_n and remaining_candidate_idxs:
        mmr_scores = {}
        for idx_in_candidates in remaining_candidate_idxs:
            relevance = relevance_scores[idx_in_candidates]
            # Max similarity to already selected items (min diversity)
            if selected_candidate_idxs: # Avoid error if selected_candidate_idxs is empty initially
                 max_similarity_to_selected = np.max(diversity_matrix[idx_in_candidates, selected_candidate_idxs])
            else:
                 max_similarity_to_selected = -np.inf # Handle the case for the first item if not already selected

            mmr_score = lambda_param * relevance - (1 - lambda_param) * max_similarity_to_selected
            mmr_scores[idx_in_candidates] = mmr_score

        if not mmr_scores: # Break if no more candidates to score
            break

        best_next_idx_in_candidates = max(mmr_scores, key=mmr_scores.get)
        selected_candidate_idxs.append(best_next_idx_in_candidates)
        remaining_candidate_idxs.remove(best_next_idx_in_candidates)

    # Map selected candidate indices back to original indices
    final_selected_original_indices = [candidate_indices[i] for i in selected_candidate_idxs]
    return final_selected_original_indices


def get_ml_recommendations(
    target_features: csr_matrix, # Can be sparse or dense initially
    target_article_type: str,
    product_gender: str,
    target_color: Optional[str],
    target_id: Optional[str] = None, # String ID
    top_n: int = 3,
    lambda_mmr: float = 0.5 # MMR balance parameter
) -> tuple[List[Dict], float, float, float]:
    """Generate recommendations using Annoy and optimized MMR."""
    start_time = time.time()
    df = ml_model.df
    annoy_index = ml_model.annoy_index
    all_features = ml_model.combined_features

    if annoy_index is None or all_features is None or df is None:
        logger.error("ML model components not initialized (Annoy, features, df).")
        return [], 0.0, 0.0, 0.0

    # 1. Find initial candidates using Annoy
    # Convert sparse target_features to dense for Annoy query
    target_vector_dense = target_features.toarray().flatten()
    num_neighbors_to_fetch = min(ANNOY_SEARCH_K_FACTOR * top_n, annoy_index.get_n_items()) # Request more neighbors
    annoy_start = time.time()
    initial_indices, _ = annoy_index.get_nns_by_vector(
        target_vector_dense, num_neighbors_to_fetch, search_k=-1, include_distances=True
    )
    logger.info(f"Annoy search ({len(initial_indices)} neighbors) took {time.time() - annoy_start:.4f}s")

    if not initial_indices:
        logger.warning("Annoy returned no neighbors.")
        return [], 0.0, 0.0, 0.0

    # 2. Filter candidates based on rules
    filter_start = time.time()
    # Get compatible types
    target_group = next((group for group, types in ARTICLE_TYPE_GROUPS.items() if target_article_type in types), None)
    compatible_types = COMPATIBLE_TYPES.get(target_article_type, [])
    if target_group:
        candidate_types = list(set(ARTICLE_TYPE_GROUPS.get(target_group, []) + compatible_types))
    else:
        candidate_types = [target_article_type] + compatible_types # Fallback if target not in groups
    # Fetch candidate details efficiently from DataFrame using .loc
    candidate_df = df.iloc[initial_indices].copy() # Use .copy() to avoid SettingWithCopyWarning

    # Apply filters
    mask = candidate_df["articleType"].isin(candidate_types)
    mask &= candidate_df["gender"].isin([product_gender, "Unisex"])
    if target_id:
        mask &= (candidate_df["id"] != target_id) # Exclude target item itself

    filtered_candidate_df = candidate_df[mask]

    # Color compatibility filter (applied after initial filtering)
    if target_color and not filtered_candidate_df.empty:
         color_scores = filtered_candidate_df["baseColour"].apply(
             lambda x: color_compatibility(target_color, x if pd.notna(x) else "Unknown")
         )
         # Dynamic threshold: Require min score only if enough candidates exist
         min_color_threshold = 0.2 if len(filtered_candidate_df[color_scores >= 0.2]) >= top_n else 0.0
         color_mask = color_scores >= min_color_threshold
         filtered_candidate_df = filtered_candidate_df[color_mask]

    logger.info(f"Filtering took {time.time() - filter_start:.4f}s. Candidates reduced from {len(initial_indices)} to {len(filtered_candidate_df)}")

    if filtered_candidate_df.empty:
        logger.warning(f"No suitable candidates found after filtering for {target_article_type} (Gender: {product_gender}, Color: {target_color})")
        return [], 0.0, 0.0, 0.0

    # 3. Prepare features for MMR
    # Get the original indices of the filtered candidates
    filtered_original_indices = filtered_candidate_df.index.tolist()
    # Extract the features for these candidates
    candidate_features_sparse = all_features[filtered_original_indices]

    # 4. Run Optimized MMR
    mmr_start = time.time()
    selected_original_indices = optimized_mmr(
        target_vector_dense,
        filtered_original_indices,
        candidate_features_sparse,
        top_n,
        lambda_param=lambda_mmr
    )
    logger.info(f"MMR selection took {time.time() - mmr_start:.4f}s")

    if not selected_original_indices:
        logger.warning("MMR did not select any items.")
        return [], 0.0, 0.0, 0.0

    # 5. Format results and calculate metrics
    results_df = df.loc[selected_original_indices]
    results = []
    for _, item_row in results_df.iterrows():
         item_dict = item_row.to_dict()
         item_id_int = int(item_dict['id'])
         item_dict['id'] = item_id_int # Convert ID to int for response model
         item_dict['image_url'] = f"/static/images/{item_id_int}.jpg"
         results.append(item_dict)


    # Calculate metrics on the *final* selected items
    novelty_score = inverse_popularity_score(results) if results else 0.0
    diversity_score = intra_list_diversity(results) if results else 0.0
    serendipity_score = 0.0
    if target_id and results:
        target_item_dict = get_item(target_id) # Fetch target item details
        if target_item_dict:
            serendipity_score = serendipity_measure(results, target_item_dict)

    total_time = time.time() - start_time
    logger.info(f"Recommendation generation took {total_time:.4f}s. Found {len(results)} items.")
    logger.info(f"Metrics - Novelty: {novelty_score:.3f}, Diversity: {diversity_score:.3f}, Serendipity: {serendipity_score:.3f}")

    return results, novelty_score, diversity_score, serendipity_score

# --- Utilities (Color, Constraints, Types - remain mostly unchanged) ---
def color_compatibility(color1: Optional[str], color2: Optional[str]) -> float:
    """Calculate color compatibility score using COLOR_COMPATIBILITY dictionary."""
    if not color1 or not color2 or color1 == "Unknown" or color2 == "Unknown":
        return 0.1 # Small score for unknown compatibility
    if color1 == color2:
        return 1.0
    # Check both directions for compatibility
    if color2 in COLOR_COMPATIBILITY.get(color1, []) or color1 in COLOR_COMPATIBILITY.get(color2, []):
        return 0.8
    # Check for neutral compatibility
    neutrals = {"Black", "White", "Grey", "Beige", "Navy Blue", "Off White", "Grey Melange"}
    if color1 in neutrals or color2 in neutrals:
        return 0.5 # Neutrals are generally compatible
    return 0.0

def check_negative_constraints(target_item: dict, candidate_item: dict) -> bool:
    """Check for incompatible combinations based on updated ARTICLE_TYPE_GROUPS."""
    def get_group(article_type: str) -> Optional[str]:
        for group_name, types in ARTICLE_TYPE_GROUPS.items():
            if article_type in types:
                return group_name
        return None # Item type not found in any defined group

    target_group = get_group(target_item["articleType"])
    candidate_group = get_group(candidate_item["articleType"])

    # If either type isn't in a group, assume compatible for now
    if target_group is None or candidate_group is None:
        # logger.debug(f"Assuming compatible: {target_item['articleType']} ({target_group}) and {candidate_item['articleType']} ({candidate_group}) - one or both not grouped.")
        return True

    # Define groups that generally shouldn't be combined with themselves
    self_incompatible_groups = {"Tops", "Bottomwear", "Dresses", "Outerwear"}
    accessory_groups = {"Accessories", "Jewellery", "Bags", "Makeup", "Skincare", "Bath and Body", "Haircare", "Fragrance", "Tech Accessories", "Home Decor", "Footwear", "Personal Care"} # Broadened accessory def

    # Rule 1: Items from the same self-incompatible group are generally bad
    if target_group == candidate_group and target_group in self_incompatible_groups:
        # logger.debug(f"Incompatible: Same self-incompatible group '{target_group}' for {target_item['id']} and {candidate_item['id']}")
        return False

    # Rule 2: Allow combining accessories with anything (including other accessories)
    # This simplifies logic, specific incompatible accessories could be added if needed
    if target_group in accessory_groups or candidate_group in accessory_groups:
         return True

    # Rule 3: Specific incompatible group combinations (example)
    # if target_group == "Dresses" and candidate_group == "Bottomwear": return False # Dress + Trousers? Usually no.
    # if target_group == "Outerwear" and candidate_group == "Outerwear": return False # Two coats? Usually no.

    # Rule 4: Usage mismatch (example: Formal + Flip Flops)
    if target_item.get("usage") == "Formal" and candidate_item.get("articleType") in ["Flip Flops", "Sports Sandals"]:
         # logger.debug(f"Incompatible: Formal usage ({target_item['id']}) with casual footwear ({candidate_item['id']})")
         return False
    if candidate_item.get("usage") == "Formal" and target_item.get("articleType") in ["Flip Flops", "Sports Sandals"]:
         # logger.debug(f"Incompatible: Formal usage ({candidate_item['id']}) with casual footwear ({target_item['id']})")
         return False

    # If no negative rule hit, assume compatible
    return True


def get_compatible_types(article_type: str) -> List[str]:
    """Get compatible article types from COMPATIBLE_TYPES."""
    return COMPATIBLE_TYPES.get(article_type, [])

def get_accessory_types(usage: str, season: str) -> List[str]:
    """Get accessory types based on usage and season."""
    accessory_list = ACCESSORY_COMBINATIONS.get(usage, []) + SEASONAL_ACCESSORIES.get(season, [])
    # Filter out duplicates and return
    return list(set(accessory_list))

# --- Image Processing Utilities (Dominant Color, CLIP Prediction) ---
# These remain largely the same, ensure MLModel components are accessed correctly
def get_dominant_color(image: Image.Image) -> np.ndarray:
    """Get the dominant color from an image."""
    try:
        image = image.resize((100, 100))
        img_array = np.array(image).reshape(-1, 3)
        # Handle cases with very few colors (e.g., pure white image)
        n_clusters = min(3, len(np.unique(img_array, axis=0)))
        if n_clusters == 0: return np.array([0,0,0]) # Return black if no colors found

        kmeans = KMeans(n_clusters=n_clusters, random_state=0, n_init=1).fit(img_array) # Set n_init explicitly
        counts = np.bincount(kmeans.labels_)
        return kmeans.cluster_centers_[np.argmax(counts)]
    except Exception as e:
        logger.error(f"Error in get_dominant_color: {e}")
        return np.array([0, 0, 0]) # Default to black on error

def find_closest_color(target_color: np.ndarray, color_names: List[str]) -> str:
    """Find the closest color name to the target RGB."""
    # Consolidate color map definition
    color_map = { # Add more colors or use a larger library if needed
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
    # Filter available color names based on the provided list from the dataset
    available_colors = {name: rgb for name, rgb in color_map.items() if name in color_names}
    if not available_colors: # Fallback if no known colors match dataset colors
        logger.warning("No matching colors found between color map and dataset unique colors.")
        return "Black" # Or return the most frequent color from dataset?

    target_rgb = target_color.astype(int)
    min_dist = float("inf")
    closest_color_name = list(available_colors.keys())[0] # Initialize with first available

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
        return {} # Return empty dict or raise error

    attributes = {}
    start_time = time.time()
    try:
        # Prepare candidate labels from the dataset for robustness
        attribute_labels = {
            "gender": ml_model.df["gender"].unique().tolist(),
            "articleType": ml_model.df["articleType"].unique().tolist(),
            "season": ml_model.df["season"].unique().tolist(),
            "usage": ml_model.df["usage"].unique().tolist(),
            "masterCategory": ml_model.df["masterCategory"].unique().tolist(),
            "subCategory": ml_model.df["subCategory"].unique().tolist(),
        }
        # Add fallback lists if dataset columns were missing/empty
        fallback_labels = {
             "gender": ["Men", "Women", "Unisex"],
             "season": ["Summer", "Winter", "Spring", "Fall"],
             "usage": ["Casual", "Formal", "Sports"],
             # Add others as needed
        }

        for label_type, labels in attribute_labels.items():
            # Use fallback if dataset labels are empty or insufficient
            if not labels or len(labels) < 2:
                labels = fallback_labels.get(label_type, ["Unknown"])
                logger.warning(f"Using fallback labels for CLIP prediction: {label_type}")

            # Limit number of labels to avoid CLIP input size issues if necessary
            # MAX_CLIP_LABELS = 70 # Example limit
            # if len(labels) > MAX_CLIP_LABELS:
            #     labels = sample(labels, MAX_CLIP_LABELS)

            inputs = ml_model.clip_processor(text=labels, images=image, return_tensors="pt", padding=True, truncation=True) # Add truncation
            outputs = ml_model.clip_model(**inputs)
            logits_per_image = outputs.logits_per_image
            probs = logits_per_image.softmax(dim=1)
            predicted_index = probs.argmax().item()
            attributes[label_type] = labels[predicted_index]

        # Predict color separately
        dominant_color_rgb = get_dominant_color(image)
        unique_base_colors = ml_model.df["baseColour"].unique().tolist()
        attributes["baseColour"] = find_closest_color(dominant_color_rgb, unique_base_colors)

        logger.info(f"CLIP attribute prediction took {time.time() - start_time:.2f}s")
        return attributes

    except Exception as e:
        logger.error(f"Error during CLIP prediction: {e}", exc_info=True)
        return {} # Return empty on error


# --- Application Setup ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle startup and shutdown events."""
    logger.info("Application startup...")
    await startup_event()
    yield
    logger.info("Application shutdown.")
    # Add cleanup if needed (e.g., close DB connections if not managed by context)
    if ml_model.annoy_index:
        ml_model.annoy_index.unload() # Unload Annoy index
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
        ml_model.df = load_data()
        if ml_model.df.empty:
             raise RuntimeError("Failed to load data, DataFrame is empty.")

        (ml_model.onehot_encoder, ml_model.tfidf_vectorizer,
         ml_model.combined_features, ml_model.id_to_index,
         ml_model.index_to_id) = preprocess_data(ml_model.df)

        if ml_model.combined_features is None:
            raise RuntimeError("Feature preprocessing failed, combined_features is None.")

        ml_model.feature_dim = ml_model.combined_features.shape[1]

        # Attempt to load Annoy index, build if not found or dimension mismatch
        ml_model.annoy_index = load_annoy_index(ml_model.feature_dim, ANNOY_INDEX_PATH)
        if ml_model.annoy_index is None:
            logger.info("Building Annoy index from scratch...")
            ml_model.annoy_index, _ = build_annoy_index(ml_model.combined_features, ANNOY_INDEX_PATH)
        # Simple check if loaded index has items (doesn't guarantee correct dimensions)
        elif ml_model.annoy_index.get_n_items() != ml_model.combined_features.shape[0]:
             logger.warning(f"Annoy index item count ({ml_model.annoy_index.get_n_items()}) "
                            f"mismatches feature count ({ml_model.combined_features.shape[0]}). Rebuilding.")
             ml_model.annoy_index.unload() # Unload mismatched index
             ml_model.annoy_index, _ = build_annoy_index(ml_model.combined_features, ANNOY_INDEX_PATH)


        ml_model.clip_model, ml_model.clip_processor = init_ml_model()
        # Initialize ChromaDB client (consider error handling if path is invalid)
        try:
            ml_model.chroma_client = chromadb.PersistentClient(path=CHROMA_DB_PATH)
            # Optionally check if collection exists
            try:
                 ml_model.chroma_client.get_collection("fashion") # Check if collection exists
                 logger.info("ChromaDB client initialized and 'fashion' collection found.")
            except Exception: # Catch specific ChromaDB exception if available
                 logger.warning("ChromaDB 'fashion' collection not found. Search endpoint might fail.")
        except Exception as e:
            logger.error(f"Failed to initialize ChromaDB client at {CHROMA_DB_PATH}: {e}", exc_info=True)
            # Decide if this is critical - maybe allow server to start but log error?
            # raise HTTPException(status_code=500, detail=f"ChromaDB init error: {e}") from e

        logger.info(f"Total startup time: {time.time() - start_total:.2f} seconds.")

    except Exception as e:
        logger.error(f"Error during application startup: {e}", exc_info=True)
        # Re-raise to prevent application start if critical components fail
        raise HTTPException(status_code=500, detail=f"Critical error during startup: {e}") from e


# --- Endpoints ---
@app.get("/api/product/{item_id}", response_model=ProductPageResponse)
async def product_page(item_id: str):
    """Get product details and outfit recommendations."""
    logger.info(f"Received request for product page: {item_id}")
    start_time = time.time()

    # Validate item_id format if necessary (e.g., ensure it's numeric)
    try:
        item_id_int = int(item_id)
        if item_id_int <= 0:
            raise ValueError("Item ID must be a positive integer.")
    except ValueError:
        logger.error(f"Invalid item_id format: {item_id}")
        raise HTTPException(status_code=400, detail="Invalid item ID format.")

    product = get_item(item_id) # Use string ID internally
    if product is None:
        logger.error(f"Product {item_id} not found.")
        raise HTTPException(status_code=404, detail="Item not found")

    target_idx = ml_model.id_to_index.get(item_id)
    if target_idx is None or ml_model.combined_features is None:
        logger.error(f"Could not find index or features for item {item_id}")
        raise HTTPException(status_code=404, detail="Item data or features not found.")

    target_features = ml_model.combined_features[target_idx]
    target_gender, target_usage, target_season = product["gender"], product["usage"], product["season"]
    target_color, target_article_type = product.get("baseColour"), product["articleType"] # Use .get for color

    compatible_types_list = get_compatible_types(target_article_type)
    accessory_types = get_accessory_types(target_usage, target_season)

    recommendations_dict = {}
    metrics_agg = {'novelty': [], 'diversity': [], 'serendipity': []}

    recommendation_tasks = []
    # Combine compatible types and accessories, ensuring uniqueness
    all_target_types = list(set(compatible_types_list + accessory_types))

    logger.info(f"Generating recommendations for types: {all_target_types}")

    for rec_type in all_target_types:
        recs, novelty, diversity, serendipity = get_ml_recommendations(
            target_features,
            rec_type,
            target_gender,
            target_color,
            target_id=item_id,
            top_n=5 # Fetch slightly more initially
        )

        # Apply negative constraints check
        filtered_recs = [item for item in recs if check_negative_constraints(product, item)][:3] # Limit to 3 after filtering

        if filtered_recs:
            recommendations_dict[rec_type] = [Item(**item) for item in filtered_recs]
            # Collect metrics only if recommendations were generated and kept
            metrics_agg['novelty'].append(novelty)
            metrics_agg['diversity'].append(diversity)
            metrics_agg['serendipity'].append(serendipity)

    # Calculate average metrics
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
        # Ensure limit is reasonable
        limit = min(limit, len(ml_model.df))
        limit = max(1, limit) # Ensure limit is at least 1

        random_ids = sample(ml_model.df["id"].tolist(), limit)
        # Use get_item to ensure consistent data retrieval and formatting
        products = [Item(**get_item(pid)) for pid in random_ids if get_item(pid) is not None]

        if not products: # Handle case where get_item fails for all sampled IDs
             logger.warning("Failed to retrieve details for randomly sampled products.")
             # Option: retry sampling or return empty list?
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
        # Basic validation for image size or type could be added here
        image = Image.open(BytesIO(contents)).convert("RGB")

        # Predict attributes using CLIP
        attributes = predict_attributes(image)
        if not attributes:
            raise HTTPException(status_code=400, detail="Could not extract attributes from image.")

        logger.info(f"Predicted attributes: {attributes}")

        # Synthesize features for the uploaded image
        synthetic_name = f"{attributes.get('gender', 'Unisex')}'s {attributes.get('baseColour', '')} {attributes.get('articleType', 'Fashion Item')}"
        categorical_data = [attributes.get(col, "Unknown") for col in ["gender", "masterCategory", "subCategory", "articleType", "baseColour", "season", "usage"]]

        try:
            onehot = ml_model.onehot_encoder.transform([categorical_data])
            tfidf = ml_model.tfidf_vectorizer.transform([synthetic_name])
            target_features = hstack([onehot, tfidf]).tocsr() # Ensure sparse CSR
        except Exception as e:
            logger.error(f"Error transforming predicted attributes: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail="Error processing predicted attributes")


        # Get recommendation parameters from predicted attributes
        target_article_type = attributes.get("articleType", "Shirts") # Default if missing
        target_gender = attributes.get("gender", "Unisex")
        target_usage = attributes.get("usage", "Casual")
        target_season = attributes.get("season", "Summer")
        target_color = attributes.get("baseColour", None) # Allow None for color


        compatible_types_list = get_compatible_types(target_article_type)
        accessory_types = get_accessory_types(target_usage, target_season)
        all_target_types = list(set(compatible_types_list + accessory_types))

        recommendations_dict = {}
        metrics_agg = {'novelty': [], 'diversity': [], 'serendipity': []}

        logger.info(f"Generating recommendations from image for types: {all_target_types}")

        for rec_type in all_target_types:
             # Note: No target_id for image uploads, serendipity won't be calculated relative to input
             recs, novelty, diversity, _ = get_ml_recommendations(
                 target_features, rec_type, target_gender, target_color, target_id=None, top_n=3
             )
             # Negative constraints check is trickier without a specific 'target_item' dict.
             # We could synthesize a basic dict from attributes if needed, or skip it.
             # Skipping constraint check for image uploads for simplicity here.
             if recs:
                 recommendations_dict[rec_type] = [Item(**item) for item in recs]
                 metrics_agg['novelty'].append(novelty)
                 metrics_agg['diversity'].append(diversity)
                 # Serendipity is 0 as there's no specific history item

        avg_metrics = {k: np.mean(v) if v else 0.0 for k, v in metrics_agg.items()}

        logger.info(f"Image recommendation request completed in {time.time() - start_time:.2f}s")
        return OutfitRecommendation(recommendations=recommendations_dict, metrics=avg_metrics)

    except HTTPException as he:
        # Re-raise HTTP exceptions directly
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
        # Ensure collection exists before querying
        try:
            fashion_collection = ml_model.chroma_client.get_collection(
                "fashion",
                embedding_function=OpenCLIPEmbeddingFunction(), # Use default or specify model if needed
                # data_loader=ImageLoader() # DataLoader might not be needed for query if data is loaded
            )
        except Exception as e: # Catch specific ChromaDB exception if possible
            logger.error(f"Could not get ChromaDB collection 'fashion': {e}")
            raise HTTPException(status_code=500, detail="Search collection unavailable.")

        results = fashion_collection.query(
            query_texts=[query],
            n_results=10, # Fetch more results initially
            include=["metadatas", "distances", "uris"] # Request URIs if stored
            # include=["documents", "metadatas", "distances"] # Default includes
        )
        logger.info(f"ChromaDB query took {time.time() - start_time:.2f}s")

        image_data = []
        if results and results.get("ids") and results["ids"][0]:
            ids = results["ids"][0]
            distances = results["distances"][0]
            metadatas = results["metadatas"][0] if results.get("metadatas") else [{}] * len(ids)
            uris = results.get("uris", [[]])[0] # Get URIs if available

            for i, item_id in enumerate(ids):
                # Construct image URL from ID (assuming ID corresponds to filename)
                try:
                    img_filename = f"{int(item_id)}.jpg" # Assuming ID is numeric string
                    image_path = os.path.join(STATIC_DIR, "images", img_filename)
                    if os.path.exists(image_path):
                        image_url = f"/static/images/{img_filename}"
                        image_data.append({
                            "id": item_id, # Keep original ID from Chroma
                            "distance": distances[i],
                            "image_url": image_url,
                            "metadata": metadatas[i] # Include metadata
                        })
                    else:
                        logger.warning(f"Image file not found for Chroma result ID {item_id}: {image_path}")
                except ValueError:
                     logger.warning(f"Chroma result ID {item_id} is not numeric, cannot construct image URL.")
                except Exception as e:
                    logger.error(f"Error processing Chroma result {item_id}: {e}")

        # Limit final results after checking file existence
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
    # Calculate popularity (value_counts is efficient)
    popularity = ml_model.df['articleType'].value_counts()
    # Handle cases where there are fewer than top_n article types
    num_popular_types = min(top_n, len(popularity))
    if num_popular_types == 0:
        return []
    popular_types = popularity.index[:num_popular_types]

    # Sample one item from each of the top N popular types for diversity
    recs = []
    available_items = ml_model.df[ml_model.df['articleType'].isin(popular_types)].copy()
    if available_items.empty:
        return []

    # Group by article type and sample 1 from each group
    # Use sample(frac=1).head(1) which handles empty groups better than n=1
    sampled_items = available_items.groupby('articleType').apply(lambda x: x.sample(frac=1).head(1)).reset_index(drop=True)

    # If fewer than top_n items were sampled (due to few types), fill randomly
    remaining_needed = top_n - len(sampled_items)
    if remaining_needed > 0 and len(ml_model.df) > len(sampled_items):
        # Exclude already selected items if possible
        exclude_ids = sampled_items['id'].tolist() if not sampled_items.empty else []
        additional_samples = ml_model.df[~ml_model.df['id'].isin(exclude_ids)].sample(min(remaining_needed, len(ml_model.df) - len(exclude_ids)))
        sampled_items = pd.concat([sampled_items, additional_samples], ignore_index=True)

    # Convert to dict format
    return sampled_items.head(top_n).to_dict('records')


def random_recommender(top_n=5):
    """Generates random recommendations."""
    if ml_model.df is None or ml_model.df.empty:
        return []
    # Ensure top_n is not larger than the dataset size
    actual_n = min(top_n, len(ml_model.df))
    if actual_n == 0:
        return []
    return ml_model.df.sample(actual_n).to_dict('records')

def inverse_popularity_score(recommendations: List[Dict]):
    """Calculates novelty based on inverse popularity of article types."""
    if not recommendations or ml_model.df is None or 'articleType' not in ml_model.df.columns:
        return 0.0
    try:
        # Pre-calculate value counts for efficiency
        type_counts = ml_model.df['articleType'].value_counts()
        total_items = len(ml_model.df)
        if total_items == 0: return 0.0

        scores = []
        for item in recommendations:
            item_type = item.get('articleType')
            if item_type:
                count = type_counts.get(item_type, 0) # Get count, default to 0 if type not found
                popularity = count / total_items
                scores.append(1 - popularity)
            else:
                scores.append(0.5) # Assign neutral score if articleType is missing

        return np.mean(scores) if scores else 0.0
    except Exception as e:
        logger.error(f"Error calculating inverse popularity score: {e}")
        return 0.0


def intra_list_diversity(recommendations: List[Dict]):
    """Calculates diversity within the recommendation list using feature similarity."""
    if not recommendations or len(recommendations) < 2 or ml_model.combined_features is None:
        return 0.0 # Diversity is undefined/maximal for 0 or 1 item

    try:
        rec_ids = [str(item['id']) for item in recommendations if 'id' in item]
        # Get indices, handling potential missing IDs
        rec_indices = [ml_model.id_to_index.get(rid) for rid in rec_ids]
        valid_indices = [idx for idx in rec_indices if idx is not None]

        if len(valid_indices) < 2:
             return 0.0 # Not enough valid items to calculate diversity

        # Extract features for valid items
        features = ml_model.combined_features[valid_indices]
        # Calculate pairwise cosine similarity
        similarities = cosine_similarity(features)
        # Extract upper triangle (excluding diagonal) to avoid duplicates and self-similarity
        upper_triangle_indices = np.triu_indices_from(similarities, k=1)
        if len(upper_triangle_indices[0]) == 0:
            return 0.0 # Should not happen if len(valid_indices) >= 2, but safety check

        mean_similarity = np.mean(similarities[upper_triangle_indices])
        # Diversity is 1 - mean similarity
        return 1.0 - mean_similarity
    except Exception as e:
        logger.error(f"Error calculating intra-list diversity: {e}", exc_info=True)
        return 0.0


def serendipity_measure(recommendations: List[Dict], user_history_item: Dict):
    """Calculates serendipity as 1 - avg similarity to a user history item."""
    if not recommendations or not user_history_item or ml_model.combined_features is None:
        return 0.0

    try:
        history_id = str(user_history_item.get('id'))
        history_idx = ml_model.id_to_index.get(history_id)
        if history_idx is None:
            logger.warning(f"History item ID {history_id} not found for serendipity.")
            return 0.0

        user_features = ml_model.combined_features[history_idx]

        rec_ids = [str(item.get('id')) for item in recommendations]
        rec_indices = [ml_model.id_to_index.get(rid) for rid in rec_ids]
        valid_indices = [idx for idx in rec_indices if idx is not None]

        if not valid_indices:
            return 0.0

        rec_features = ml_model.combined_features[valid_indices]

        # Calculate similarity between user history and each recommendation
        similarities = cosine_similarity(user_features, rec_features).flatten()

        # Serendipity is often defined as how *unexpected* the items are.
        # High similarity = less unexpected. So, 1 - avg_similarity.
        avg_similarity = np.mean(similarities)
        return 1.0 - avg_similarity

    except Exception as e:
        logger.error(f"Error calculating serendipity measure: {e}", exc_info=True)
        return 0.0


@app.get("/api/evaluate")
async def evaluate_recommendations():
    """Evaluates ML recommender against baselines for a random item."""
    if ml_model.df is None or ml_model.combined_features is None:
        raise HTTPException(status_code=500, detail="Evaluation cannot run: Data or features not loaded.")

    try:
        # Select a random product as the target
        target_product = ml_model.df.sample(1).iloc[0].to_dict()
        target_id = str(target_product['id']) # Use string ID
        target_idx = ml_model.id_to_index.get(target_id)

        if target_idx is None:
             raise HTTPException(status_code=500, detail="Failed to find index for sampled target product.")

        target_features = ml_model.combined_features[target_idx]
        target_article = target_product.get('articleType', 'Unknown')
        target_gender = target_product.get('gender', 'Unisex')
        target_color = target_product.get('baseColour')

        logger.info(f"Evaluating recommendations for target item: {target_id} ({target_article}, {target_gender}, {target_color})")

        # 1. Get ML Recommendations
        ml_recs, ml_novelty, ml_diversity, ml_serendipity = get_ml_recommendations(
            target_features, target_article, target_gender, target_color, target_id, top_n=5
        )
        # Convert ML recs dicts to list of dicts for metric functions if needed
        # ml_recs_list = [item for sublist in ml_recs.values() for item in sublist] if isinstance(ml_recs, dict) else ml_recs

        # 2. Get Popularity Baseline Recommendations
        popularity_recs_list = popularity_based_recommender(top_n=5)
        pop_novelty = inverse_popularity_score(popularity_recs_list)
        pop_diversity = intra_list_diversity(popularity_recs_list)
        pop_serendipity = serendipity_measure(popularity_recs_list, target_product)

        # 3. Get Random Baseline Recommendations
        random_recs_list = random_recommender(top_n=5)
        rand_novelty = inverse_popularity_score(random_recs_list)
        rand_diversity = intra_list_diversity(random_recs_list)
        rand_serendipity = serendipity_measure(random_recs_list, target_product)

        return {
            "target_item_id": target_id,
            "ML Model": {
                "Novelty": ml_novelty,
                "Diversity": ml_diversity,
                "Serendipity": ml_serendipity,
                "recommendations": [item['id'] for item in ml_recs] # Show IDs for context
            },
            "Popularity Baseline": {
                "Novelty": pop_novelty,
                "Diversity": pop_diversity,
                "Serendipity": pop_serendipity,
                 "recommendations": [item['id'] for item in popularity_recs_list]
            },
            "Random Baseline": {
                "Novelty": rand_novelty,
                "Diversity": rand_diversity,
                "Serendipity": rand_serendipity,
                 "recommendations": [item['id'] for item in random_recs_list]
            }
        }
    except Exception as e:
         logger.error(f"Error during evaluation: {e}", exc_info=True)
         raise HTTPException(status_code=500, detail=f"Evaluation failed: {str(e)}")


# --- Optional: Add root endpoint or health check ---
@app.get("/")
async def read_root():
    return {"message": "Fashion Recommendation API is running."}

@app.get("/health")
async def health_check():
    # Basic check: is the DataFrame loaded?
    if ml_model.df is not None and not ml_model.df.empty:
        return {"status": "ok", "message": f"Data loaded ({len(ml_model.df)} items)"}
    else:
        return {"status": "error", "message": "Data not loaded"}
