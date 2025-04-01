import pytest
from fastapi import status
from main import app
from fastapi.testclient import TestClient
import pandas as pd
from scipy.sparse import csr_matrix
import numpy as np
from PIL import Image
from io import BytesIO

client = TestClient(app)

def test_product_page_endpoint(mock_ml_model, monkeypatch):
    # Mock get_item to return complete product data
    def mock_get_item(item_id):
        return {
            "id": 1,
            "gender": "Men",
            "masterCategory": "Apparel",
            "subCategory": "Topwear",
            "articleType": "Shirts",
            "baseColour": "Blue",
            "season": "Summer",
            "usage": "Casual",
            "productDisplayName": "Blue Shirt",
            "image_url": "/static/images/1.jpg"
        }
    monkeypatch.setattr('main.get_item', mock_get_item)

    # Mock get_ml_recommendations to return valid items
    def mock_get_ml_recommendations(*args, **kwargs):
        return [{
            "id": 2,
            "gender": "Men",
            "masterCategory": "Apparel",
            "subCategory": "Bottomwear",
            "articleType": "Jeans",
            "baseColour": "Blue",
            "season": "Summer",
            "usage": "Casual",
            "productDisplayName": "Blue Jeans",
            "image_url": "/static/images/2.jpg"
        }], 0.5, 0.5, 0.5
    monkeypatch.setattr('main.get_ml_recommendations', mock_get_ml_recommendations)

    response = client.get("/api/product/1")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "product" in data
    assert "recommendations" in data

@pytest.mark.asyncio
async def test_recommend_from_image(mock_ml_model, monkeypatch):
    # Mock DataFrame
    mock_ml_model.df = pd.DataFrame({
        'id': ['1', '2', '3'],
        'gender': ['Men', 'Women', 'Unisex'],
        'articleType': ['Shirts', 'Jeans', 'Shoes'],
        'baseColour': ['Blue', 'Black', 'Brown'],
        'season': ['Summer', 'Winter', 'All'],
        'usage': ['Casual', 'Formal', 'Sports'],
        'productDisplayName': ['Blue Shirt', 'Black Jeans', 'Brown Shoes'],
        'masterCategory': ['Apparel', 'Apparel', 'Footwear'],
        'subCategory': ['Topwear', 'Bottomwear', 'Formal']
    })

    # Mock encoders
    class MockEncoder:
        def transform(self, data):
            return csr_matrix([[1, 0, 0, 0, 0, 0]])  # 1 sample, 6 features
    
    mock_ml_model.onehot_encoder = MockEncoder()
    mock_ml_model.tfidf_vectorizer = MockEncoder()
    
    # Mock features
    mock_ml_model.combined_features = csr_matrix([
        [1, 0, 0, 0, 0, 0],  # Sample 1
        [0, 1, 0, 0, 0, 0],  # Sample 2
        [0, 0, 1, 0, 0, 0],  # Sample 3
    ])
    mock_ml_model.feature_dim = 6
    
    # Mock ID mappings
    mock_ml_model.id_to_index = {"1": 0, "2": 1, "3": 2}
    mock_ml_model.index_to_id = {0: "1", 1: "2", 2: "3"}

    # Mock CLIP model (required for image processing)
    mock_ml_model.clip_model = True  # Just needs to exist
    mock_ml_model.clip_processor = True

    # Mock predict_attributes
    def mock_predict_attributes(image):
        return {
            "gender": "Men",
            "articleType": "Shirts",
            "season": "Summer",
            "usage": "Casual",
            "masterCategory": "Apparel",
            "subCategory": "Topwear",
            "baseColour": "Blue"
        }
    monkeypatch.setattr('main.predict_attributes', mock_predict_attributes)

    # Mock get_ml_recommendations
    def mock_get_ml_recommendations(*args, **kwargs):
        return [{
            "id": 1,
            "gender": "Men",
            "masterCategory": "Apparel",
            "subCategory": "Bottomwear",
            "articleType": "Jeans",
            "baseColour": "Blue",
            "season": "Summer",
            "usage": "Casual",
            "productDisplayName": "Blue Jeans",
            "image_url": "/static/images/1.jpg"
        }], 0.5, 0.5, 0.5
    monkeypatch.setattr('main.get_ml_recommendations', mock_get_ml_recommendations)

    # Create test image
    img = Image.new('RGB', (100, 100), color='red')
    img_bytes = BytesIO()
    img.save(img_bytes, format='JPEG')
    img_bytes.seek(0)

    response = client.post("/api/recommend-from-image",
                         files={"file": ("test.jpg", img_bytes, "image/jpeg")})
    assert response.status_code == status.HTTP_200_OK

def test_product_page_invalid_id():
    # Test with non-existent ID
    response = client.get("/api/product/9999")
    assert response.status_code == status.HTTP_404_NOT_FOUND
    
    # Test with invalid ID format
    response = client.get("/api/product/abc")
    assert response.status_code == status.HTTP_400_BAD_REQUEST

def test_search_endpoint():
    response = client.post("/api/search", data={"query": "shirt"})
    assert response.status_code in [status.HTTP_200_OK, status.HTTP_503_SERVICE_UNAVAILABLE]
