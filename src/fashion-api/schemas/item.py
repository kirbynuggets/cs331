from pydantic import BaseModel
from typing import List, Dict, Optional


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
