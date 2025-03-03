from typing import List, Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from sqlalchemy import create_engine, text

app = FastAPI()

# Serve static files (for frontend)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Database connection
DATABASE_URL = "mysql+pymysql://fashion_user:securepass@localhost/fashion_db"
engine = create_engine(DATABASE_URL)

from typing import Optional


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
    image_url: Optional[str] = None  # Add image URL


class OutfitRecommendation(BaseModel):
    topwear: List[Item]
    bottomwear: List[Item]
    footwear: List[Item]
    accessories: List[Item]


class ProductPageResponse(BaseModel):
    product: Item
    recommendations: OutfitRecommendation


def get_item(item_id: str):
    with engine.connect() as connection:
        result = connection.execute(
            text("SELECT * FROM clothing_items WHERE id = :id"), {"id": item_id}
        )
        item = result.mappings().first()
        if not item:
            raise HTTPException(status_code=404, detail="Item not found")
        # Convert id to integer if necessary
        item = dict(item)
        item["id"] = int(item["id"])
        # Ensure baseColour is handled properly
        if item["baseColour"] is None:
            item["baseColour"] = None  # Explicitly set to None
        item["image_url"] = f"/static/images/{item['id']}.jpg"  # Add image URL
        return item


def get_compatible_items(base_item: dict, category_rules: dict, limit: int = 5):
    query = """
        SELECT * FROM clothing_items 
        WHERE 
            gender IN (:gender, 'Unisex') AND
            season = :season AND
            `usage` = :usage AND
            subCategory IN :categories
        LIMIT :limit
    """
    with engine.connect() as connection:
        result = connection.execute(
            text(query),
            {
                "gender": base_item["gender"],
                "season": base_item["season"],
                "usage": base_item["usage"],
                "categories": tuple(category_rules["compatible_categories"]),
                "limit": limit,
            },
        )
        items = result.mappings().all()
        # Add image_url to each item
        for item in items:
            item = dict(item)
            item["image_url"] = f"/static/images/{item['id']}.jpg"
        return items


@app.get("/product/{item_id}", response_model=ProductPageResponse)
async def product_page(item_id: str):
    # Get product details
    product = get_item(item_id)

    # Get outfit recommendations
    category_mapping = {
        "Topwear": {
            "compatible_categories": ["Bottomwear", "Footwear", "Belts", "Watches"]
        },
        "Bottomwear": {"compatible_categories": ["Topwear", "Footwear", "Belts"]},
        "Footwear": {"compatible_categories": ["Topwear", "Bottomwear", "Socks"]},
    }

    compatible_items = get_compatible_items(
        product,
        category_mapping.get(product["subCategory"], {"compatible_categories": []}),
        limit=5,
    )

    recommendations = {
        "topwear": [],
        "bottomwear": [],
        "footwear": [],
        "accessories": [],
    }

    for item in compatible_items:
        item = dict(item)
        item["image_url"] = (
            f"/static/images/{item['id']}.jpg"  # Ensure image_url is set
        )
        category = item["subCategory"]
        if category == "Topwear":
            recommendations["topwear"].append(item)
        elif category == "Bottomwear":
            recommendations["bottomwear"].append(item)
        elif category in ["Footwear", "Shoes"]:
            recommendations["footwear"].append(item)
        elif category in ["Belts", "Watches", "Bags"]:
            recommendations["accessories"].append(item)

    return {"product": product, "recommendations": recommendations}
