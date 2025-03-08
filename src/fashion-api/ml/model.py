import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import OneHotEncoder
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.cluster import KMeans
from scipy.sparse import hstack
import numpy as np
from transformers import CLIPProcessor, CLIPModel
from sqlalchemy.orm import Session
from core.models import ClothingItem
from typing import Dict
from PIL import Image
from . import utils


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

    def load_data(self, db: Session):
        """Load and preprocess data."""

        items = db.query(ClothingItem).all()
        self.df = pd.DataFrame([item.__dict__ for item in items])
        self.df["id"] = self.df["id"].astype(str)  # Ensure ID is string

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
            self.df[col] = self.df[col].fillna("Unknown")  # Handle missing values

        self._prepare_features()
        self._create_id_mapping()
        self._load_clip_model()

    def _prepare_features(self):
        """Prepare combined features for similarity calculations."""
        categorical_cols = [
            "gender",
            "masterCategory",
            "subCategory",
            "articleType",
            "baseColour",
            "season",
            "usage",
        ]

        self.onehot_encoder = OneHotEncoder(handle_unknown="ignore", sparse_output=True)
        onehot_features = self.onehot_encoder.fit_transform(self.df[categorical_cols])

        self.tfidf_vectorizer = TfidfVectorizer(stop_words="english", max_features=1000)
        tfidf_features = self.tfidf_vectorizer.fit_transform(
            self.df["productDisplayName"]
        )

        self.combined_features = hstack([onehot_features, tfidf_features])

    def _create_id_mapping(self):
        """Create a mapping from item ID to DataFrame index."""
        self.id_to_index = {str(row["id"]): idx for idx, row in self.df.iterrows()}

    def _load_clip_model(self):
        """Load the CLIP model and processor."""
        self.clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
        self.clip_processor = CLIPProcessor.from_pretrained(
            "openai/clip-vit-base-patch32"
        )

    def get_recommendations(
        self,
        target_idx: int,
        target_article_type: str,
        target_id: str,
        product_gender: str,
        target_color: str,
        top_n=3,
    ) -> list[dict]:
        """Get recommendations using cosine similarity and filters."""

        return utils.get_ml_recommendations(
            self,  # Pass the entire MLModel instance
            target_idx,
            target_article_type,
            target_id,
            product_gender,
            target_color,
            top_n,
        )

    def predict_attributes(self, image: Image.Image) -> dict:
        """Predict image attributes using CLIP."""
        return utils.predict_attributes(self, image)  # Pass self
