# --- services/item_service.py ---
from fastapi import HTTPException
from sqlalchemy.orm import Session
from core.models import ClothingItem
from schemas.item import Item, ProductPageResponse, OutfitRecommendation
from ml.model import MLModel  # Import the MLModel
from typing import Dict, Any, List
from PIL import Image


class ItemService:
    def __init__(self, db: Session):
        self.db = db
        self.ml_model = MLModel()
        self.ml_model.load_data(db)  # Load data into the model
        self.compatible_types = {
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
            self.compatible_types.setdefault(
                f"{item} (Women)", self.compatible_types.get(item, [])
            )
            if item in self.compatible_types:
                del self.compatible_types[item]

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
            self.compatible_types.setdefault(
                f"{item} (Men)", self.compatible_types.get(item, [])
            )
            if item in self.compatible_types:
                del self.compatible_types[item]

        if "Women" in self.compatible_types:
            self.compatible_types.update(
                {
                    "Dresses": ["Heels", "Flats", "Jackets", "Clutches", "Sunglasses"],
                    "Tops": ["Skirts", "Shorts", "Jackets"],
                    "Kurtis": ["Leggings", "Dupatta", "Sandals"],
                }
            )
        elif "Men" in self.compatible_types:
            self.compatible_types.update(
                {
                    "Shirts": ["Trousers", "Blazers", "Formal Shoes", "Ties"],
                    "Tshirts": ["Shorts", "Track Pants", "Sports Shoes"],
                }
            )

    def get_item(self, item_id: str) -> Dict[str, Any]:
        """Retrieve item from database."""
        item = self.db.query(ClothingItem).filter(ClothingItem.id == item_id).first()
        if not item:
            raise HTTPException(status_code=404, detail="Item not found")
        item_dict = item.__dict__
        item_dict["id"] = int(item_dict["id"])
        item_dict["image_url"] = f"/static/high_res_images/{item_id}.jpg"
        return item_dict

    async def get_product_page(self, item_id: str) -> ProductPageResponse:
        product = self.get_item(item_id)
        target_id = str(product["id"])
        target_gender = product["gender"]
        target_usage = product["usage"]
        target_season = product["season"]
        target_color = product["baseColour"]

        if target_id not in self.ml_model.id_to_index:
            raise HTTPException(status_code=404, detail="Item not found in ML model")
        target_idx = self.ml_model.id_to_index[target_id]
        target_article_type = product["articleType"]

        recommendations_dict = {}

        # Main Recommendations
        if target_article_type in self.compatible_types:
            for compatible_type in self.compatible_types[target_article_type]:
                recommended_items = self.ml_model.get_recommendations(
                    target_idx,
                    compatible_type,
                    target_id,
                    target_gender,
                    target_color,
                )
                if recommended_items:
                    recommendations_dict[compatible_type] = [
                        Item(**item) for item in recommended_items
                    ]

        # Accessory Recommendations
        formal_accessories = [
            "Belts",
            "Ties",
            "Watches",
            "Cufflinks",
            "Formal Shoes",
            "Pocket Squares",
            "Tie Clips",
        ]
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
        ]
        ethnic_accessories = [
            "Jewellery",
            "Bangles",
            "Bindis",
            "Jhumkas",
            "Maang Tikka",
            "Anklets",
            "Sandals",
            "Mojaris",
        ]

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
            "Home": [],
            "Smart Casual": [
                "Belts",
                "Watches",
                "Loafers",
                "Blazers",
                "Chinos",
            ],
        }

        accessory_list = []
        accessory_list.extend(accessory_combinations.get(target_usage, []))
        accessory_list.extend(seasonal_accessories.get(target_season, []))
        accessory_list = list(set(accessory_list))  # Remove duplicates

        for accessory_type in accessory_list:
            accessory_recs = self.ml_model.get_recommendations(
                target_idx,
                accessory_type,
                target_id,
                target_gender,
                target_color,
            )
            if accessory_recs:
                recommendations_dict[accessory_type] = [
                    Item(**item) for item in accessory_recs
                ]

        return ProductPageResponse(
            product=Item(**product),
            recommendations=OutfitRecommendation(recommendations=recommendations_dict),
        )

    async def get_recommendations_from_image(
        self, image: Image.Image
    ) -> OutfitRecommendation:
        attributes = self.ml_model.predict_attributes(image)

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

        onehot = self.ml_model.onehot_encoder.transform([categorical_data])
        tfidf = self.ml_model.tfidf_vectorizer.transform([synthetic_name])
        target_features = hstack([onehot, tfidf])

        recommendations_dict = {}
        target_article_type = attributes.get("articleType", "Shirts")
        target_gender = attributes.get("gender", "Unisex")
        target_usage = attributes.get("usage", "Casual")
        target_season = attributes.get(
            "season", "Summer"
        )  # Summer being the most common season
        target_color = attributes.get("baseColour", "Black")
        
        # Main Recommendations

        if target_article_type in self.compatible_types:
            for compatible_type in self.compatible_types[target_article_type]:
                recs = self.ml_model.get_recommendations(
                    0,  # Dummy index
                    compatible_type,
                    "dummy_id",
                    target_gender,
                    target_color,
                    top_n=2,
                )
                if recs:
                    recommendations_dict[compatible_type] = recs
        #Accessory Recommendations
        formal_accessories = [
            "Belts",
            "Ties",
            "Watches",
            "Cufflinks",
            "Formal Shoes",
            "Pocket Squares",
            "Tie Clips",
        ]
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
        ]
        ethnic_accessories = [
            "Jewellery",
            "Bangles",
            "Bindis",
            "Jhumkas",
            "Maang Tikka",
            "Anklets",
            "Sandals",
            "Mojaris",
        ]

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
            "Home": [],
            "Smart Casual": [
                "Belts",
                "Watches",
                "Loafers",
                "Blazers",
                "Chinos",
            ],
        }

        accessory_list = []
        accessory_list.extend(accessory_combinations.get(target_usage, []))
        accessory_list.extend(seasonal_accessories.get(target_season, []))
        accessory_list = list(set(accessory_list))

        for accessory_type in accessory_list:
            accessory_recs = self.ml_model.get_recommendations(
                0,
                accessory_type,
                "dummy_id",
                target_gender,
                target_color,
                top_n=2
            )
            if accessory_recs:
                recommendations_dict[accessory_type] = accessory_recs
                
        return OutfitRecommendation(recommendations=recommendations_dict)
