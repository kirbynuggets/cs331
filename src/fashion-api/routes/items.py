"""Routes for item-related endpoints."""

from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from sqlalchemy.orm import Session
from core.database import get_db
from services.item_service import ItemService
from schemas.item import (
    Item,
    ProductPageResponse,
    OutfitRecommendation,
)
from io import BytesIO
from PIL import Image

router = APIRouter()


@router.get("/api/product/{item_id}", response_model=ProductPageResponse)
async def product_page(item_id: str, db: Session = Depends(get_db)):
    """Get product details and outfit recommendations."""
    try:
        item_service = ItemService(db)
        return await item_service.get_product_page(item_id)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"An unexpected error occurred: {str(e)}"
        ) from e


@router.post("/api/recommend-from-image", response_model=OutfitRecommendation)
async def recommend_from_image(
    file: UploadFile = File(...), db: Session = Depends(get_db)
):
    try:
        item_service = ItemService(db)
        contents = await file.read()
        image = Image.open(BytesIO(contents)).convert("RGB")
        return await item_service.get_recommendations_from_image(image)

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error processing image: {str(e)}"
        ) from e
