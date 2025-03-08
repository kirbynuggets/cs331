import pytest
from fastapi.testclient import TestClient

def test_product_page_success(client, db):
    #  Add a test item to the database
    from core.models import ClothingItem
    test_item = ClothingItem(
        id=99999,
        gender="Men",
        masterCategory="Apparel",
        subCategory="Topwear",
        articleType="Shirts",
        baseColour="Blue",
        season="Summer",
        usage="Casual",
        productDisplayName="Test Shirt",
    )
    db.add(test_item)
    db.commit()

    response = client.get("/api/product/99999")
    assert response.status_code == 200
    data = response.json()
    assert data["product"]["id"] == 99999
    assert "recommendations" in data


def test_product_page_not_found(client):
    response = client.get("/api/product/99998")  # Assuming this ID doesn't exist
    assert response.status_code == 404

def test_recommend_from_image(client, db):
     # Create a test image file (replace 'test_image.jpg' with an actual image)
    with open("tests/test_image.jpg", "wb") as f:
        f.write(b"dummy image content")  # Replace with actual image content

    # Send a POST request with the test image
    with open("tests/test_image.jpg", "rb") as f:
        response = client.post("/api/recommend-from-image", files={"file": ("test_image.jpg", f, "image/jpeg")})

    # Check if the request was successful
    assert response.status_code == 200
    data = response.json()
    assert "recommendations" in data
    # Add more specific assertions here, depending on what you expect

def test_search_no_query(client):
    response = client.post("/search")  # No query provided
    assert response.status_code == 400  # Expect a 400 Bad Request


def test_search_with_query(client):
    response = client.post("/search", data={"query": "blue shirt"})
    assert response.status_code == 200
    data = response.json()
    assert "images" in data
    assert isinstance(data["images"], list)
    # Add more specific assertions based on expected search results
    #  For example, check the structure of the image data, distances, etc.