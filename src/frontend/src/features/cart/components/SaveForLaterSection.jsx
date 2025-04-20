import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import {
  Typography,
  Grid,
  Box,
  Card,
  CardMedia,
  CardContent,
  Button,
  IconButton,
  Divider,
  CircularProgress,
  Fade,
  useTheme,
  alpha,
  styled,
} from '@mui/material';
import {
  Delete,
  ShoppingCart,
  Bookmark,
  NavigateBefore,
} from '@mui/icons-material';
import {
  fetchSaveForLater,
  moveToCart,
  removeSaveForLaterItem,
  selectSaveForLater,
  selectSaveForLaterItems
} from '../../saveForLater/saveForLaterSlice';

// Styled components
const SavedItemCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  marginBottom: theme.spacing(2),
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  boxShadow: 'none',
  border: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: theme.palette.primary.light,
    boxShadow: theme.shadows[1],
  },
}));

const SavedItemImage = styled(CardMedia)(({ theme }) => ({
  width: 100,
  height: 120,
  objectFit: 'contain',
  marginRight: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.grey[100],
}));

const ActionButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  borderRadius: theme.shape.borderRadius * 4,
  fontWeight: 500,
}));

const MoveToCartButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  textTransform: 'none',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
  },
}));

const RemoveButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.error.main,
  '&:hover': {
    backgroundColor: alpha(theme.palette.error.main, 0.1),
  },
}));

const SavedForLaterSection = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  
  const { items, status, error } = useSelector(selectSaveForLater);
  
  useEffect(() => {
    dispatch(fetchSaveForLater());
  }, [dispatch]);
  
  const handleMoveToCart = (itemId) => {
    dispatch(moveToCart(itemId));
  };
  
  const handleRemoveItem = (itemId) => {
    dispatch(removeSaveForLaterItem(itemId));
  };
  
  // If no saved items
  if (items.length === 0) {
    return null;
  }
  
  // Show loading state
  if (status === 'loading' && items.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress color="secondary" size={24} />
      </Box>
    );
  }
  
  return (
    <Box sx={{ mt: 6 }}>
      <Divider sx={{ mb: 4 }} />
      
      <Typography variant="h5" sx={{ mb: 3 }}>
        Saved For Later ({items.length} {items.length === 1 ? 'item' : 'items'})
      </Typography>
      
      {items.map((item) => (
        <Fade key={item.id} in={true} timeout={500}>
          <SavedItemCard>
            <SavedItemImage component="img" image={item.image_url} alt={item.productDisplayName} />
            <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box>
                  <Typography 
                    variant="subtitle1" 
                    component={RouterLink}
                    to={`/product/${item.id}`}
                    sx={{ 
                      fontWeight: 600, 
                      textDecoration: 'none',
                      color: 'text.primary',
                      '&:hover': {
                        color: 'primary.main',
                      }
                    }}
                  >
                    {item.productDisplayName}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary">
                    Size: {item.size}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary">
                    Color: {item.color || 'Default'}
                  </Typography>
                  
                  <Typography variant="subtitle2" color="secondary.main" sx={{ mt: 1 }}>
                    ₹{(item.price || 0).toFixed(2)}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <Box sx={{ display: 'flex', mt: 'auto' }}>
                    <MoveToCartButton
                      size="small"
                      startIcon={<ShoppingCart fontSize="small" />}
                      onClick={() => handleMoveToCart(item.id)}
                      sx={{ mr: 1 }}
                    >
                      Move to Cart
                    </MoveToCartButton>
                    
                    <RemoveButton
                      size="small"
                      onClick={() => handleRemoveItem(item.id)}
                      aria-label="remove item"
                    >
                      <Delete fontSize="small" />
                    </RemoveButton>
                  </Box>
                </Box>
              </Box>
            </Box>
          </SavedItemCard>
        </Fade>
      ))}
    </Box>
  );
};

export default SavedForLaterSection;