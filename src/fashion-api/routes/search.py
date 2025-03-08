from fastapi import APIRouter, HTTPException, Depends, Form
from fastapi.responses import JSONResponse
from typing import Optional
from sqlalchemy.orm import Session
from core.database import get_db
from services.image_search_service import ImageSearchService

router = APIRouter()

@router.post("/api/search")
async def search(query: Optional[str] = Form(None)):
    """Handles search requests from the frontend."""
    if not query:
        raise HTTPException(status_code=400, detail="Query is required")
    try:
        image_search_service = ImageSearchService()
        return await image_search_service.search_images(query)
    except Exception as e:
        print(f"Error during search: {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred during search: {str(e)}")
