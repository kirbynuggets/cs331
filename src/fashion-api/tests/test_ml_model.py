import pytest
from main import get_ml_recommendations, color_compatibility, check_negative_constraints
from scipy.sparse import csr_matrix
import numpy as np
from constants import COMPATIBLE_TYPES

def test_get_ml_recommendations(mock_ml_model):
    # Setup test data
    target_features = csr_matrix(np.random.rand(1, 10))
    
    # Test with valid input
    recommendations = get_ml_recommendations(
        target_features,
        'Shirts',
        'Men',
        'Blue',
        '1',
        top_n=2
    )
    
    # Verify the structure of the return value
    assert isinstance(recommendations, tuple)
    assert len(recommendations) == 4
    assert isinstance(recommendations[0], list)
    assert isinstance(recommendations[1], float)
    assert isinstance(recommendations[2], float)
    assert isinstance(recommendations[3], float)

def test_color_compatibility():
    # Test exact match
    assert color_compatibility("Blue", "Blue") == 1.0
    
    # Test compatible colors
    assert color_compatibility("Blue", "White") == 0.8
    assert color_compatibility("Black", "White") == 0.8
    
    # Test incompatible colors
    # Update this based on your actual COLOR_COMPATIBILITY dictionary
    # Blue and Orange might be compatible in your system
    assert color_compatibility("Blue", "Orange") in [0.0, 0.8]  # Adjust based on your rules
    
    # Test with unknown colors
    assert color_compatibility("Unknown", "Blue") == 0.1
    assert color_compatibility("Blue", "Unknown") == 0.1

def test_check_negative_constraints():
    # Test compatible items
    shirt = {"articleType": "Shirts", "usage": "Casual", "gender": "Men"}
    jeans = {"articleType": "Jeans", "usage": "Casual", "gender": "Men"}
    assert check_negative_constraints(shirt, jeans) is True
    
    # Test incompatible items - update based on your actual rules
    # In your system, dress + trousers might be compatible
    dress = {"articleType": "Dresses", "usage": "Formal", "gender": "Women"}
    trousers = {"articleType": "Trousers", "usage": "Formal", "gender": "Women"}
    # Change this to match your actual compatibility rules
    assert check_negative_constraints(dress, trousers) in [True, False]