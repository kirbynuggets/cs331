import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Box,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Fade,
  useTheme,
  alpha,
  styled,
} from '@mui/material';
import {
  Delete,
  ShoppingCart,
  Favorite,
  ArrowForward,
  ShoppingBag,
  NavigateBefore,
} from '@mui/icons-material';
import { 
  fetchWishlist, 
  removeFromWishlist, 
  selectWishlist,
  selectWishlistItems 
} from '../wishlistSlice';
import { addItemToCart } from '../../cart/cartSlice';

// const BACKEND_URL = 'http://localhost:8000/api/product'; 


// Styled components
const WishlistEmptyContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(6),
  textAlign: 'center',
}));

const WishlistItemCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  boxShadow: 'none',
  border: `1px solid ${theme.palette.divider}`,
  '&:hover': {
    transform: 'translateY(-6px)',
    boxShadow: theme.shadows[3],
    '& .MuiCardMedia-root': {
      transform: 'scale(1.05)',
    },
  },
}));

const WishlistItemImage = styled(CardMedia)(({ theme }) => ({
  height: 260,
  backgroundSize: 'cover',
  transition: 'transform 0.5s ease',
}));

const ActionButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  borderRadius: theme.shape.borderRadius * 4,
  fontWeight: 500,
}));

const AddToCartButton = styled(Button)(({ theme }) => ({
  width: '100%',
  textTransform: 'none',
  borderRadius: theme.shape.borderRadius * 2,
  fontWeight: 500,
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
    transform: 'translateY(-2px)',
  },
}));

const RemoveButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.error.main,
  backgroundColor: alpha(theme.palette.error.main, 0.1),
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: alpha(theme.palette.error.main, 0.2),
    transform: 'rotate(10deg)',
  },
}));

const PageHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(4),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: theme.spacing(2),
  },
}));

const WishlistPage = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  
  const { items, status, error } = useSelector(selectWishlist);
  console.log("items:", items);  
  
  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);
  
  const handleRemoveFromWishlist = (productId) => {
    dispatch(removeFromWishlist(productId));
  };
  
  const handleAddToCart = (product) => {
    dispatch(addItemToCart({
      productId: product.id,
      quantity: 1,
      size: product.availableSizes?.[0] || 'M' // Default to first available size or M
    }));
  };
  
  // If wishlist is empty
  if (items.length === 0 && status !== 'loading') {
    return (
      <Container maxWidth="xl" sx={{ py: 6 }}>
        <WishlistEmptyContainer>
          <Favorite sx={{ fontSize: 70, color: 'error.light', mb: 2 }} />
          <Typography variant="h5" gutterBottom>Your wishlist is empty</Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom sx={{ maxWidth: 500, mb: 4 }}>
            You haven't added any items to your wishlist yet. Browse our collection to find items you'll love.
          </Typography>
          <Button
            component={RouterLink}
            to="/products"
            variant="contained"
            color="primary"
            size="large"
            startIcon={<ArrowForward />}
            sx={{ 
              borderRadius: theme.shape.borderRadius * 4, 
              textTransform: 'none',
              px: 4,
            }}
          >
            Start Shopping
          </Button>
        </WishlistEmptyContainer>
      </Container>
    );
  }
  
  // Show loading state
  if (status === 'loading' && items.length === 0) {
    return (
      <Container maxWidth="xl" sx={{ py: 6, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress color="secondary" />
      </Container>
    );
  }
  
  // Show error state
  if (error && status === 'failed' && items.length === 0) {
    return (
      <Container maxWidth="xl" sx={{ py: 6 }}>
        <Alert severity="error" sx={{ borderRadius: theme.shape.borderRadius }}>
          Error: {error}
        </Alert>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      <Fade in={true} timeout={800}>
        <div>
          <PageHeader>
            <Box>
              <Typography variant="h4" gutterBottom>My Wishlist</Typography>
              <Typography variant="body1" color="text.secondary">
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </Typography>
            </Box>
            <Button
              component={RouterLink}
              to="/products"
              startIcon={<NavigateBefore />}
              sx={{ textTransform: 'none' }}
            >
              Continue Shopping
            </Button>
          </PageHeader>
          
          <Grid container spacing={3}>
            {items.map((item, index) => (
              <Grid item xs={6} sm={4} md={3} key={item.id || index}>
                <Fade in={true} timeout={500 + index * 100}>
                  <WishlistItemCard>
                    <Box sx={{ position: 'relative' }}>
                      <RouterLink to={`/product/${item.id}`}>
                        <WishlistItemImage
                          component="img"
                          image={item.image_url} 
                          alt={item.productDisplayName}
                        />
                      </RouterLink>
                      <Box sx={{ position: 'absolute', top: 10, right: 10 }}>
                        <RemoveButton
                          size="small"
                          onClick={() => {
                            handleRemoveFromWishlist(item.id);
                            console.log("delete clicked")
                          }}
                          aria-label="remove from wishlist"
                        >
                          <Delete fontSize="small" />
                        </RemoveButton>
                      </Box>
                    </Box>
                    
                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <Typography 
                        variant="subtitle1" 
                        component={RouterLink}
                        to={`/product/${item.id}`}
                        sx={{ 
                          fontWeight: 600, 
                          mb: 1,
                          textDecoration: 'none',
                          color: 'text.primary',
                          '&:hover': {
                            color: 'primary.main',
                          }
                        }}
                      >
                        {item.productDisplayName}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {item.subCategory}
                      </Typography>
                      
                      {/* <Typography variant="h6" color="secondary.main" sx={{ mt: 'auto', mb: 2 }}>
                        ₹{(item.price || 0).toFixed(2)}
                      </Typography> */}
                      
                      <AddToCartButton
                        variant="contained"
                        color="primary"
                        startIcon={<ShoppingCart />}
                        onClick={() => handleAddToCart(item)}
                      >
                        Add to Cart
                      </AddToCartButton>
                    </CardContent>
                  </WishlistItemCard>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </div>
      </Fade>
    </Container>
  );
};

export default WishlistPage;

// import React, { useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { Link as RouterLink } from 'react-router-dom';
// import {
//   Container,
//   Typography,
//   Grid,
//   Box,
//   Card,
//   CardMedia,
//   CardContent,
//   IconButton,
//   Button,
//   Divider, // Keep if used elsewhere, otherwise remove if not needed
//   CircularProgress,
//   Alert,
//   Fade,
//   useTheme,
//   alpha,
//   styled,
// } from '@mui/material';
// import {
//   Delete,
//   ShoppingCart,
//   Favorite,
//   ArrowForward,
//   ShoppingBag, // Keep if used elsewhere, otherwise remove if not needed
//   NavigateBefore,
// } from '@mui/icons-material';
// import {
//   fetchWishlist,
//   removeFromWishlist,
//   selectWishlist,
// } from '../wishlistSlice'; // Adjust path if necessary
// import { addItemToCart } from '../../cart/cartSlice'; // 

// // --- Define your Backend URL here ---
// // IMPORTANT: Use environment variables for production builds!
// // Example: const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
// const BACKEND_URL = 'http://localhost:8000';

// // --- Styled components (keep as they are) ---
// const WishlistEmptyContainer = styled(Box)(({ theme }) => ({
//   display: 'flex',
//   flexDirection: 'column',
//   alignItems: 'center',
//   justifyContent: 'center',
//   padding: theme.spacing(6),
//   textAlign: 'center',
// }));

// const WishlistItemCard = styled(Card)(({ theme }) => ({
//   display: 'flex',
//   flexDirection: 'column',
//   height: '100%',
//   borderRadius: theme.shape.borderRadius,
//   overflow: 'hidden',
//   transition: 'all 0.3s ease',
//   boxShadow: 'none',
//   border: `1px solid ${theme.palette.divider}`,
//   '&:hover': {
//     transform: 'translateY(-6px)',
//     boxShadow: theme.shadows[3],
//     '& .MuiCardMedia-root': {
//       transform: 'scale(1.05)',
//     },
//   },
// }));

// const WishlistItemImage = styled(CardMedia)(({ theme }) => ({
//   height: 260, // Adjust as needed
//   backgroundSize: 'cover', // Or 'contain'
//   transition: 'transform 0.5s ease',
// }));

// // Removed ActionButton as it wasn't used in the provided map
// // const ActionButton = styled(Button)(({ theme }) => ({ ... }));

// const AddToCartButton = styled(Button)(({ theme }) => ({
//   width: '100%',
//   textTransform: 'none',
//   borderRadius: theme.shape.borderRadius * 2,
//   fontWeight: 500,
//   transition: 'all 0.3s ease',
//   '&:hover': {
//     backgroundColor: theme.palette.primary.dark,
//     transform: 'translateY(-2px)',
//   },
// }));

// const RemoveButton = styled(IconButton)(({ theme }) => ({
//   color: theme.palette.error.main,
//   backgroundColor: alpha(theme.palette.error.main, 0.1),
//   transition: 'all 0.3s ease',
//   '&:hover': {
//     backgroundColor: alpha(theme.palette.error.main, 0.2),
//     transform: 'rotate(10deg)', // Keep or remove rotation effect
//   },
// }));

// const PageHeader = styled(Box)(({ theme }) => ({
//   display: 'flex',
//   justifyContent: 'space-between',
//   alignItems: 'center',
//   marginBottom: theme.spacing(4),
//   [theme.breakpoints.down('sm')]: {
//     flexDirection: 'column',
//     alignItems: 'flex-start',
//     gap: theme.spacing(2),
//   },
// }));
// // --- End Styled Components ---


// const WishlistPage = () => {
//   const dispatch = useDispatch();
//   const theme = useTheme();

//   // Get wishlist state from Redux
//   const { items, status, error } = useSelector(selectWishlist);
//   console.log("Wishlist items from Redux:", items); // Log the items received from Redux

//   // Fetch wishlist data when the component mounts
//   useEffect(() => {
//     // Only fetch if status is 'idle' to avoid re-fetching unnecessarily
//     if (status === 'idle') {
//        dispatch(fetchWishlist());
//     }
//   }, [status, dispatch]); // Depend on status and dispatch

//   const handleRemoveFromWishlist = (productId) => {
//     dispatch(removeFromWishlist(productId));
//   };

//   const handleAddToCart = (product) => {
//     // Ensure product and product.id exist before dispatching
//     if (product && product.id) {
//       dispatch(addItemToCart({
//         productId: product.id,
//         quantity: 1,
//         // Add size logic if applicable and available on the item object
//         // size: product.availableSizes?.[0] || 'M'
//       }));
//     } else {
//       console.error("Cannot add to cart: product or product.id is missing", product);
//     }
//   };

//   // --- Helper function to construct full image URL ---
//   const getFullImageUrl = (relativeUrl) => {
//     // Provide a default placeholder image if the URL is missing
//     const placeholderImage = '/path/to/your/placeholder.jpg'; // *** Replace with your actual placeholder image path ***

//     if (!relativeUrl) {
//       return placeholderImage;
//     }
//     // If the URL already starts with http, assume it's absolute
//     if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) {
//       return relativeUrl;
//     }
//     // Otherwise, prepend the backend URL
//     // Ensure no double slashes (e.g., http://localhost:8000//static/image.jpg)
//     const cleanBackendUrl = BACKEND_URL.endsWith('/') ? BACKEND_URL.slice(0, -1) : BACKEND_URL;
//     const cleanRelativeUrl = relativeUrl.startsWith('/') ? relativeUrl : `/${relativeUrl}`;
//     return `${cleanBackendUrl}${cleanRelativeUrl}`;
//   };
//   // --- End Helper Function ---


//   // --- Render Loading State ---
//   if (status === 'loading') { // Show loader if actively loading, even if items exist briefly
//     return (
//       <Container maxWidth="xl" sx={{ py: 6, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
//         <CircularProgress color="secondary" />
//       </Container>
//     );
//   }

//   // --- Render Error State ---
//   // Show error only if loading failed and there are no items to display
//   if (status === 'failed' && items.length === 0) {
//     return (
//       <Container maxWidth="xl" sx={{ py: 6 }}>
//         <Alert severity="error" sx={{ borderRadius: theme.shape.borderRadius }}>
//           Error loading wishlist: {error || 'Unknown error'}
//         </Alert>
//       </Container>
//     );
//   }

//   // --- Render Empty Wishlist ---
//   if (items.length === 0 && status !== 'loading') { // Check status to avoid showing empty state while loading
//     return (
//       <Container maxWidth="xl" sx={{ py: 6 }}>
//         <WishlistEmptyContainer>
//           <Favorite sx={{ fontSize: 70, color: 'error.light', mb: 2 }} />
//           <Typography variant="h5" gutterBottom>Your wishlist is empty</Typography>
//           <Typography variant="body1" color="text.secondary" gutterBottom sx={{ maxWidth: 500, mb: 4 }}>
//             You haven't added any items to your wishlist yet. Browse our collection to find items you'll love.
//           </Typography>
//           <Button
//             component={RouterLink}
//             to="/products" // Link to your products page
//             variant="contained"
//             color="primary"
//             size="large"
//             startIcon={<ArrowForward />}
//             sx={{
//               borderRadius: theme.shape.borderRadius * 4,
//               textTransform: 'none',
//               px: 4,
//             }}
//           >
//             Start Shopping
//           </Button>
//         </WishlistEmptyContainer>
//       </Container>
//     );
//   }

//   // --- Render Wishlist Items ---
//   return (
//     <Container maxWidth="xl" sx={{ py: 6 }}>
//       <Fade in={true} timeout={800}>
//         <div>
//           <PageHeader>
//             <Box>
//               <Typography variant="h4" gutterBottom>My Wishlist</Typography>
//               <Typography variant="body1" color="text.secondary">
//                 {items.length} {items.length === 1 ? 'item' : 'items'}
//               </Typography>
//             </Box>
//             <Button
//               component={RouterLink}
//               to="/products" // Link to your products page
//               startIcon={<NavigateBefore />}
//               sx={{ textTransform: 'none' }}
//             >
//               Continue Shopping
//             </Button>
//           </PageHeader>

//           <Grid container spacing={3}>
//             {items.map((item, index) => {
//               // Ensure item and item.id exist before rendering the card
//               if (!item || !item.id) {
//                  console.warn("Skipping rendering wishlist item due to missing data:", item);
//                  return null; // Skip rendering this item if data is incomplete
//               }

//               return (
//                 <Grid item xs={6} sm={4} md={3} key={item.id}> {/* Use reliable item.id as key */}
//                   <Fade in={true} timeout={500 + index * 100}>
//                     <WishlistItemCard>
//                       <Box sx={{ position: 'relative' }}>
//                         <RouterLink to={`/product/${item.id}`}>
//                           <WishlistItemImage
//                             component="img"
//                             // *** Use the helper function to get the full URL ***
//                             image={getFullImageUrl(item.image_url)}
//                             alt={item.productDisplayName || 'Wishlist item'} // Add fallback alt text
//                           />
//                         </RouterLink>
//                         <Box sx={{ position: 'absolute', top: 10, right: 10 }}>
//                           <RemoveButton
//                             size="small"
//                             onClick={() => {
//                               handleRemoveFromWishlist(item.id);
//                               console.log("Delete clicked for item:", item.id);
//                             }}
//                             aria-label="Remove from wishlist"
//                           >
//                             <Delete fontSize="small" />
//                           </RemoveButton>
//                         </Box>
//                       </Box>

//                       <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
//                         <Typography
//                           variant="subtitle1"
//                           component={RouterLink}
//                           to={`/product/${item.id}`}
//                           sx={{
//                             fontWeight: 600,
//                             mb: 1,
//                             textDecoration: 'none',
//                             color: 'text.primary',
//                             '&:hover': {
//                               color: 'primary.main',
//                             },
//                             // Prevent text overflow
//                             overflow: 'hidden',
//                             textOverflow: 'ellipsis',
//                             display: '-webkit-box',
//                             WebkitLineClamp: 2, // Limit to 2 lines
//                            WebkitBoxOrient: 'vertical',
//                           }}
//                         >
//                           {item.productDisplayName || 'Unnamed Product'} {/* Fallback name */}
//                         </Typography>

//                         <Typography variant="body2" color="text.secondary" gutterBottom>
//                           {item.subCategory || 'Category'} {/* Fallback category */}
//                         </Typography>

//                         {/* Optional: Display Price if available */}
//                         {item.price && (
//                             <Typography variant="h6" color="text.primary" sx={{ mt: 'auto', mb: 2 }}>
//                                 ₹{item.price.toFixed(2)}
//                             </Typography>
//                         )}

//                         <Box sx={{ mt: item.price ? 0 : 'auto' }}> {/* Pushes button down if no price */}
//                           <AddToCartButton
//                             variant="contained"
//                             color="primary"
//                             startIcon={<ShoppingCart />}
//                             onClick={() => handleAddToCart(item)}
//                             disabled={status === 'loading'} // Disable button while loading actions might occur
//                           >
//                             Add to Cart
//                           </AddToCartButton>
//                         </Box>
//                       </CardContent>
//                     </WishlistItemCard>
//                   </Fade>
//                 </Grid>
//               );
//             })}
//           </Grid>
//         </div>
//       </Fade>
//     </Container>
//   );
// };

// export default WishlistPage;