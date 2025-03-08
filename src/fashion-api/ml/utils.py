import numpy as np
from sklearn.cluster import KMeans
from sklearn.metrics.pairwise import cosine_similarity
from PIL import Image
from typing import List, Dict, Optional
from .data_loader import article_type_groups  # Import from data_loader


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


def predict_attributes(ml_model, image: Image.Image) -> dict:
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


def get_ml_recommendations(
    ml_model,
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
        item["image_url"] = f"/static/high_res_images/{item['id']}.jpg"
        item["id"] = int(item["id"])
    return results
