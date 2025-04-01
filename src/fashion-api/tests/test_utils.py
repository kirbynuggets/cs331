import pytest
from main import inverse_popularity_score, intra_list_diversity, serendipity_measure
import pandas as pd
from scipy.sparse import csr_matrix
import numpy as np

def test_inverse_popularity_score():
    # Test with sample recommendations
    recommendations = [
        {"articleType": "RareItem"},
        {"articleType": "CommonItem"},
        {"articleType": "RareItem"}
    ]
    
    # Mock the global data to control popularity
    class MockModel:
        df = pd.DataFrame({"articleType": ["CommonItem"] * 10 + ["RareItem"] * 2})
    
    ml_model = MockModel()
    
    score = inverse_popularity_score(recommendations)
    assert 0 <= score <= 1
    # Rare items should contribute more to novelty
    assert score > 0.5

def test_intra_list_diversity(monkeypatch):
    # Test with diverse items
    diverse_recs = [
        {
            "id": "1",
            "articleType": "Shirts",
            "gender": "Men",
            "masterCategory": "Apparel",
            "subCategory": "Topwear",
            "baseColour": "Blue",
            "season": "Summer",
            "usage": "Casual",
            "productDisplayName": "Blue Shirt"
        },
        {
            "id": "2", 
            "articleType": "Jeans",
            "gender": "Men",
            "masterCategory": "Apparel",
            "subCategory": "Bottomwear",
            "baseColour": "Black",  # Different color for more diversity
            "season": "Winter",     # Different season
            "usage": "Formal",      # Different usage
            "productDisplayName": "Black Formal Jeans"
        }
    ]

    # Create properly diverse feature vectors
    class MockModel:
        combined_features = csr_matrix([
            [1, 0, 0, 0],
            [0, 1, 1, 1]
        ])
        id_to_index = {"1": 0, "2": 1}

    # Patch the global ML model
    monkeypatch.setattr('main.ml_model.combined_features', MockModel.combined_features)
    monkeypatch.setattr('main.ml_model.id_to_index', MockModel.id_to_index)
    
    ml_model = MockModel()

    score = intra_list_diversity(diverse_recs)
    # With very different items, diversity should be high
    assert score > 0.8  # Adjust threshold as needed

def test_serendipity_measure(monkeypatch):
    # Test with unexpected recommendations
    history_item = {
        "id": "1",
        "articleType": "Shirts",
        "gender": "Men",
        "masterCategory": "Apparel",
        "subCategory": "Topwear",
        "baseColour": "Blue",
        "season": "Summer",
        "usage": "Casual",
        "productDisplayName": "Blue Shirt"
    }
    unexpected_recs = [
        {
            "id": "10",
            "articleType": "Sunglasses",
            "gender": "Unisex",
            "masterCategory": "Accessories",
            "subCategory": "Eyewear",
            "baseColour": "Black",
            "season": "All",
            "usage": "Casual",
            "productDisplayName": "Black Sunglasses"
        }
    ]

    class MockModel:
        combined_features = csr_matrix([
            [1, 0, 0, 0],
            [0, 1, 1, 1]
        ])
        id_to_index = {"1": 0, "10": 1}

    # Patch the global ML model
    monkeypatch.setattr('main.ml_model.combined_features', MockModel.combined_features)
    monkeypatch.setattr('main.ml_model.id_to_index', MockModel.id_to_index)

    ml_model = MockModel()
    
    score = serendipity_measure(unexpected_recs, history_item)
    # With very different items, serendipity should be high
    assert score > 0.8  # Adjust threshold as needed
