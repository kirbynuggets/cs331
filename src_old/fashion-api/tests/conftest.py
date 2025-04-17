import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from main import app, MLModel, get_item
from constants import ARTICLE_TYPE_GROUPS, COMPATIBLE_TYPES
import pandas as pd
from scipy.sparse import csr_matrix
import numpy as np
from fastapi import status

@pytest.fixture(scope="module")
def client():
    return TestClient(app)

@pytest.fixture
def sample_data():
    return pd.DataFrame({
        'id': ['1', '2', '3', '4', '5'],
        'gender': ['Men', 'Women', 'Unisex', 'Men', 'Women'],
        'articleType': ['Shirts', 'Tshirts', 'Jeans', 'Formal Shoes', 'Ties'],
        'baseColour': ['Blue', 'Red', 'Black', 'Brown', 'Black'],
        'season': ['Summer', 'Winter', 'All', 'All', 'All'],
        'usage': ['Casual', 'Casual', 'Casual', 'Formal', 'Formal'],
        'productDisplayName': ['Blue Shirt', 'Red Tshirt', 'Black Jeans', 'Brown Shoes', 'Black Tie'],
        'masterCategory': ['Apparel', 'Apparel', 'Apparel', 'Footwear', 'Accessories'],
        'subCategory': ['Topwear', 'Topwear', 'Bottomwear', 'Formal', 'Accessories']
    })

@pytest.fixture
def mock_annoy_index():
    class MockAnnoyIndex:
        def __init__(self):
            self.n_items = 100  # Default number of items
            
        def get_nns_by_vector(self, *args, **kwargs):
            return [0, 1, 2], [0.1, 0.2, 0.3]  # Return some dummy indices and distances
            
        def get_n_items(self):
            return self.n_items
            
    return MockAnnoyIndex()

@pytest.fixture
def mock_ml_model(sample_data, mock_annoy_index):
    model = MLModel()
    model.df = sample_data
    model.combined_features = csr_matrix(np.random.rand(len(sample_data), 10))
    model.id_to_index = {str(row['id']): idx for idx, row in sample_data.iterrows()}
    model.index_to_id = {idx: str(row['id']) for idx, row in sample_data.iterrows()}
    model.feature_dim = 10
    model.annoy_index = mock_annoy_index
    return model

@pytest.fixture(autouse=True)
def mock_dependencies(monkeypatch, mock_ml_model):
    # Patch the global ml_model in main.py
    monkeypatch.setattr('main.ml_model', mock_ml_model)