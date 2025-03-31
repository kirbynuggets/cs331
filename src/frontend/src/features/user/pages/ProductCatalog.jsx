// import React, { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import {
//   Container,
//   Typography,
//   Grid,
//   Box,
//   CircularProgress,
//   Card,
//   CardActionArea,
//   CardMedia,
//   CardContent,
//   Button,
// } from "@mui/material";
// import CssBaseline from "@mui/material/CssBaseline";
// import { ThemeProvider, createTheme } from "@mui/material/styles";
// import { useNavigate } from "react-router-dom";

// // Simple theme
// const theme = createTheme({
//   palette: {
//     primary: {
//       main: "#1976d2",
//     },
//   },
// });

// const SimplifiedProductCatalog = () => {
//   // State management
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const navigate = useNavigate();

//   // Fetch products from API
//   useEffect(() => {
//     const fetchProducts = async () => {
//       setLoading(true);
//       try {
//         const response = await fetch("http://localhost:8000/api/products");
//         console.log("response fetched");
//         if (!response.ok) {
//           throw new Error(`Failed to fetch: ${response.status}`);
//         }

//         const data = await response.json();

//         // Process products to ensure all have required fields
//         const processedProducts = data.products.map((product) => ({
//           ...product,
//           price: product.price || Math.floor(Math.random() * 100) + 20, // Fallback price generator
//           image_url: product.image_url || "/images/placeholder.jpg",
//           productDisplayName: product.productDisplayName || "Untitled Product",
//           subCategory: product.subCategory || "Uncategorized",
//         }));

//         setProducts(processedProducts);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProducts();
//   }, []);

//   return (
//     <ThemeProvider theme={theme}>
//       <CssBaseline />
//       <Container maxWidth="xl" sx={{ py: 4 }}>
//         <Typography variant="h4" sx={{ mb: 4, textAlign: "center" }}>
//           Our Products
//         </Typography>

//         {loading ? (
//           // Loading state
//           <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
//             <CircularProgress />
//           </Box>
//         ) : error ? (
//           // Error state
//           <Box sx={{ textAlign: "center", py: 8 }}>
//             <Typography color="error" gutterBottom>
//               Error: {error}
//             </Typography>
//             <Button
//               variant="contained"
//               onClick={() => window.location.reload()}
//             >
//               Try Again
//             </Button>
//           </Box>
//         ) : (
//           // Product grid
//           <Grid container spacing={3}>
//             {products.map((product) => (
//               <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
//                 <Card
//                   sx={{
//                     height: "100%",
//                     display: "flex",
//                     flexDirection: "column",
//                   }}
//                 >
//                   <CardActionArea>
//                     <CardMedia
//                       component="img"
//                       height="200"
//                       image={`http://localhost:8000${product.image_url}`}
//                       alt={product.productDisplayName}
//                       sx={{ objectFit: "cover" }}
//                       onClick={() => {
//                         navigate(`/product/${product.id}`);
//                       }}
//                     />
//                     <CardContent>
//                       <Typography variant="h6" noWrap>
//                         {product.productDisplayName}
//                       </Typography>
//                       <Typography
//                         variant="body2"
//                         color="text.secondary"
//                         sx={{ mb: 1 }}
//                       >
//                         {product.subCategory}
//                       </Typography>
//                       <Typography variant="h6" color="primary">
//                         ${product.price?.toFixed(2)}
//                       </Typography>
//                     </CardContent>
//                   </CardActionArea>
//                 </Card>
//               </Grid>
//             ))}
//           </Grid>
//         )}
//       </Container>
//     </ThemeProvider>
//   );
// };

// export default SimplifiedProductCatalog;


import React, { useState, useEffect, useMemo } from "react";
import { 
  Container,
  Typography,
  Grid,
  Box,
  Card,
  CardMedia,
  CardContent,
  Button,
  IconButton,
  Divider,
  TextField,
  InputAdornment,
  MenuItem,
  FormControl,
  Select,
  Chip,
  Skeleton,
  Paper,
  Breadcrumbs,
  Rating,
  Pagination,
  Slide,
  Fade,
  Tooltip,
  Dialog,
  DialogContent,
  DialogTitle,
  useMediaQuery,
  alpha,
} from "@mui/material";
import {
  Search,
  FavoriteBorder,
  Favorite,
  ShoppingCart,
  FilterList,
  Sort,
  GridView,
  ViewList,
  Close,
  Visibility,
  ArrowUpward,
  ArrowForward,
  Star,
} from "@mui/icons-material";
import { ThemeProvider, createTheme, styled } from "@mui/material/styles";
import { useNavigate, Link as RouterLink } from "react-router-dom";

// Create a theme that matches our premium LUXE brand
const theme = createTheme({
  palette: {
    primary: {
      main: "#2c3e50",
      light: "#3e5771",
      dark: "#1a252f",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#e74c3c",
      light: "#ff6b5b",
      dark: "#b03a2e",
      contrastText: "#ffffff",
    },
    background: {
      default: "#f8f9fa",
      paper: "#ffffff",
    },
    text: {
      primary: "#2c3e50",
      secondary: "#7f8c8d",
    },
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: "none",
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 30,
          padding: "10px 24px",
          fontSize: "0.875rem",
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          },
        },
        containedPrimary: {
          "&:hover": {
            backgroundColor: "#3e5771",
          },
        },
        outlinedPrimary: {
          borderWidth: 2,
          "&:hover": {
            borderWidth: 2,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          overflow: "hidden",
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: 16,
          "&:last-child": {
            paddingBottom: 16,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
  },
});

// Styled components for enhanced visuals
const ProductCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  position: "relative",
  transition: "all 0.3s ease",
  overflow: "hidden",
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: "0 12px 20px rgba(0,0,0,0.1)",
    "& .product-media": {
      transform: "scale(1.05)",
    },
    "& .product-actions": {
      opacity: 1,
      transform: "translateY(0)",
    },
    "& .quick-view-btn": {
      opacity: 1,
      transform: "translateY(0)",
    },
  },
}));

const ProductImage = styled(CardMedia)(({ theme }) => ({
  height: 280,
  transition: "transform 0.6s ease",
  position: "relative",
}));

const ProductActions = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: 8,
  right: 8,
  display: "flex",
  flexDirection: "column",
  opacity: 0,
  transform: "translateX(20px)",
  transition: "all 0.3s ease",
}));

const QuickViewButton = styled(Button)(({ theme }) => ({
  position: "absolute",
  bottom: 16,
  left: "50%",
  transform: "translateX(-50%) translateY(20px)",
  opacity: 0,
  transition: "all 0.3s ease",
  backgroundColor: "rgba(255, 255, 255, 0.9)",
  color: theme.palette.text.primary,
  "&:hover": {
    backgroundColor: theme.palette.common.white,
  },
  zIndex: 2,
}));

const ProductBadge = styled(Chip)(({ theme, color }) => ({
  position: "absolute",
  top: 12,
  left: 12,
  fontWeight: 600,
  fontSize: "0.75rem",
  letterSpacing: "0.5px",
  zIndex: 2,
}));

const FilterButton = styled(Button)(({ theme, active }) => ({
  borderRadius: theme.shape.borderRadius * 3,
  padding: "6px 16px",
  fontSize: "0.875rem",
  color: active ? theme.palette.primary.contrastText : theme.palette.text.primary,
  backgroundColor: active ? theme.palette.primary.main : "transparent",
  border: active ? "none" : `1px solid ${theme.palette.divider}`,
  "&:hover": {
    backgroundColor: active ? theme.palette.primary.dark : alpha(theme.palette.primary.main, 0.05),
  },
}));

const SortSelect = styled(FormControl)(({ theme }) => ({
  minWidth: 180,
  "& .MuiOutlinedInput-root": {
    borderRadius: theme.shape.borderRadius * 3,
  },
}));

const SearchField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: theme.shape.borderRadius * 3,
    backgroundColor: alpha(theme.palette.common.white, 0.8),
  },
}));

const StickyFilters = styled(Box)(({ theme }) => ({
  position: "sticky",
  top: 24,
  background: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  overflow: "hidden",
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
}));

const CategoryFilter = styled(Box)(({ theme }) => ({
  display: "flex",
  overflowX: "auto",
  gap: theme.spacing(1),
  pb: theme.spacing(1),
  "&::-webkit-scrollbar": {
    height: 4,
  },
  "&::-webkit-scrollbar-track": {
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: alpha(theme.palette.primary.main, 0.2),
    borderRadius: 4,
  },
}));

// Product Quick View component
const QuickViewDialog = ({ open, onClose, product }) => {
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  
  if (!product) return null;
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth="md"
      PaperProps={{
        elevation: 24,
        sx: {
          borderRadius: theme.shape.borderRadius,
          overflow: "hidden",
        }
      }}
    >
      <DialogTitle sx={{ 
        display: "flex", 
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}>
        <Typography variant="h6">Product Quick View</Typography>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        <Grid container>
          <Grid item xs={12} md={6}>
            <Box sx={{ position: "relative", height: "100%" }}>
              <Box
                component="img"
                src={`http://localhost:8000${product.image_url}`}
                alt={product.productDisplayName}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                  minHeight: { xs: 300, md: 480 },
                }}
              />
              {product.onSale && (
                <Chip
                  label="SALE"
                  color="secondary"
                  size="small"
                  sx={{
                    position: "absolute",
                    top: 16,
                    left: 16,
                    fontWeight: 600,
                  }}
                />
              )}
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 3, height: "100%", display: "flex", flexDirection: "column" }}>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                {product.subCategory}
              </Typography>
              <Typography variant="h5" component="h2" gutterBottom>
                {product.productDisplayName}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Rating value={product.rating || 4.5} precision={0.5} readOnly size="small" />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  {product.reviewCount || 42} Reviews
                </Typography>
              </Box>
              <Typography variant="h4" color="primary" sx={{ mb: 2, fontWeight: 700 }}>
                ${product.price.toFixed(2)}
              </Typography>
              {product.oldPrice && (
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    textDecoration: "line-through",
                    mb: 2
                  }}
                >
                  ${product.oldPrice.toFixed(2)}
                </Typography>
              )}
              <Typography variant="body2" sx={{ mb: 3 }}>
                {product.description || "This premium product combines style, comfort, and quality craftsmanship. Made with carefully selected materials for everyday wear and special occasions alike."}
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Button 
                    fullWidth 
                    variant="contained" 
                    color="primary"
                    startIcon={<ShoppingCart />}
                    sx={{ height: 48 }}
                  >
                    Add to Cart
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button 
                    fullWidth 
                    variant="outlined" 
                    color="primary"
                    startIcon={<FavoriteBorder />}
                    sx={{ height: 48 }}
                  >
                    Add to Wishlist
                  </Button>
                </Grid>
              </Grid>
              <Button 
                variant="text" 
                color="primary" 
                endIcon={<ArrowForward />}
                onClick={() => window.location.href = `/product/${product.id}`}
                sx={{ alignSelf: "center", mt: "auto" }}
              >
                View Full Details
              </Button>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

// Main product catalog component with enhanced styling
const EnhancedProductCatalog = () => {
  // State management
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [page, setPage] = useState(1);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  
  const navigate = useNavigate();
  const productsPerPage = 12;

  // Track scroll for back-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:8000/api/products");
        console.log("response fetched");
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`);
        }

        const data = await response.json();

        // Process products to ensure all have required fields and add additional demo data
        const processedProducts = data.products.map((product, index) => ({
          ...product,
          price: product.price || Math.floor(Math.random() * 100) + 20,
          oldPrice: index % 3 === 0 ? (product.price || Math.floor(Math.random() * 100) + 20) * 1.2 : null,
          image_url: product.image_url || "/images/placeholder.jpg",
          productDisplayName: product.productDisplayName || "Untitled Product",
          subCategory: product.subCategory || "Uncategorized",
          rating: (Math.random() * 2 + 3).toFixed(1),
          reviewCount: Math.floor(Math.random() * 500) + 10,
          onSale: index % 4 === 0,
          isNew: index % 5 === 0,
        }));

        setProducts(processedProducts);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Get unique categories for filtering
  const categories = useMemo(() => {
    if (!products.length) return [];
    const categoriesSet = new Set(products.map(product => product.subCategory));
    return ['all', ...Array.from(categoriesSet)];
  }, [products]);

  // Handle wishlist toggle
  const toggleWishlist = (productId) => {
    setWishlist(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // Handle quick view
  const handleQuickView = (e, product) => {
    e.stopPropagation();
    setQuickViewProduct(product);
  };

  const handleCloseQuickView = () => {
    setQuickViewProduct(null);
  };

  // Handle category filter change
  const handleCategoryChange = (category) => {
    setCategoryFilter(category);
    setPage(1); // Reset to first page when changing filters
  };

  // Handle back to top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Apply filters and sorting to products
  const filteredProducts = useMemo(() => {
    return products
      .filter(product => 
        (categoryFilter === 'all' || product.subCategory === categoryFilter) &&
        (searchQuery === '' || product.productDisplayName.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      .sort((a, b) => {
        switch(sortBy) {
          case 'priceAsc':
            return a.price - b.price;
          case 'priceDesc':
            return b.price - a.price;
          case 'nameAsc':
            return a.productDisplayName.localeCompare(b.productDisplayName);
          case 'nameDesc':
            return b.productDisplayName.localeCompare(a.productDisplayName);
          default: // featured
            return 0;
        }
      });
  }, [products, categoryFilter, searchQuery, sortBy]);

  // Paginate products
  const paginatedProducts = useMemo(() => {
    const startIdx = (page - 1) * productsPerPage;
    return filteredProducts.slice(startIdx, startIdx + productsPerPage);
  }, [filteredProducts, page]);

  // Create skeleton loader for products
  const ProductSkeleton = () => (
    <Card sx={{ height: '100%' }}>
      <Skeleton variant="rectangular" height={280} />
      <CardContent>
        <Skeleton variant="text" width="60%" height={24} />
        <Skeleton variant="text" width="40%" height={20} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Skeleton variant="text" width="30%" height={32} />
          <Skeleton variant="circular" width={36} height={36} />
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ bgcolor: "background.default", minHeight: "100vh", pb: 8 }}>
        {/* Hero section */}
        <Box
          sx={{
            bgcolor: "#2c3e50",
            color: "white",
            py: { xs: 6, md: 10 },
            mb: 4,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Container maxWidth="xl">
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={6}>
                <Fade in={true} timeout={1000}>
                  <Box>
                    <Typography 
                      variant="overline" 
                      sx={{ 
                        fontWeight: 500, 
                        letterSpacing: 3,
                        opacity: 0.9,
                        display: "block",
                        mb: 1
                      }}
                    >
                      PREMIUM COLLECTION
                    </Typography>
                    <Typography
                      variant="h2"
                      component="h1"
                      sx={{
                        fontWeight: 700,
                        mb: 2,
                        fontSize: { xs: "2.5rem", md: "3.5rem" },
                      }}
                    >
                      Discover Our Products
                    </Typography>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 400, 
                        opacity: 0.9,
                        mb: 4,
                        maxWidth: 600
                      }}
                    >
                      Explore our curated collection of premium fashion items designed for style and comfort.
                    </Typography>
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <Button 
                        variant="contained" 
                        color="secondary" 
                        size="large"
                        sx={{
                          px: 4,
                          py: 1.5,
                          borderRadius: 30,
                          fontWeight: 600,
                        }}
                      >
                        Shop New Arrivals
                      </Button>
                      <Button 
                        variant="outlined" 
                        sx={{
                          px: 4,
                          py: 1.5,
                          borderRadius: 30,
                          fontWeight: 600,
                          color: "white",
                          borderColor: "rgba(255,255,255,0.5)",
                          "&:hover": {
                            borderColor: "white",
                            backgroundColor: "rgba(255,255,255,0.1)",
                          }
                        }}
                      >
                        View Collections
                      </Button>
                    </Box>
                  </Box>
                </Fade>
              </Grid>
              <Grid item xs={12} md={6} sx={{ display: { xs: "none", md: "block" } }}>
                <Box sx={{ position: "relative", height: 400 }}>
                  {/* Decorative elements */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: -20,
                      right: -20,
                      width: 300,
                      height: 300,
                      borderRadius: "50%",
                      background: "linear-gradient(45deg, rgba(231,76,60,0.2) 0%, rgba(41,128,185,0.2) 100%)",
                      filter: "blur(60px)",
                    }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: -40,
                      left: 100,
                      width: 200,
                      height: 200,
                      borderRadius: "50%",
                      background: "linear-gradient(45deg, rgba(41,128,185,0.2) 0%, rgba(142,68,173,0.2) 100%)",
                      filter: "blur(60px)",
                    }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box>

        <Container maxWidth="xl">
          {/* Breadcrumbs navigation */}
          <Breadcrumbs sx={{ mb: 3 }}>
            <Typography 
              component={RouterLink} 
              to="/" 
              color="inherit" 
              sx={{ 
                textDecoration: "none",
                "&:hover": { textDecoration: "underline" }
              }}
            >
              Home
            </Typography>
            <Typography color="text.primary">Products</Typography>
          </Breadcrumbs>

          <Grid container spacing={4}>
            {/* Sidebar with filters - visible on desktop */}
            <Grid item xs={12} md={3} lg={2} sx={{ display: { xs: "none", md: "block" } }}>
              <StickyFilters>
                <Box sx={{ p: 3, borderBottom: "1px solid", borderColor: "divider" }}>
                  <Typography variant="h6" gutterBottom>
                    Filters
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {filteredProducts.length} products found
                  </Typography>
                </Box>
                
                <Box sx={{ p: 3, borderBottom: "1px solid", borderColor: "divider" }}>
                  <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                    Categories
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {categories.map((category) => (
                      <Button
                        key={category}
                        variant="text"
                        color={categoryFilter === category ? "primary" : "inherit"}
                        sx={{
                          justifyContent: "flex-start",
                          fontWeight: categoryFilter === category ? 600 : 400,
                          pl: 1,
                          py: 0.5,
                          backgroundColor: categoryFilter === category 
                            ? alpha(theme.palette.primary.main, 0.08)
                            : "transparent",
                          "&:hover": {
                            backgroundColor: categoryFilter === category 
                              ? alpha(theme.palette.primary.main, 0.12)
                              : alpha(theme.palette.primary.main, 0.04),
                          },
                          borderRadius: 2,
                        }}
                        onClick={() => handleCategoryChange(category)}
                      >
                        {category === "all" ? "All Categories" : category}
                      </Button>
                    ))}
                  </Box>
                </Box>
                
                <Box sx={{ p: 3 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={() => {
                      setCategoryFilter("all");
                      setSearchQuery("");
                      setSortBy("featured");
                    }}
                  >
                    Clear Filters
                  </Button>
                </Box>
              </StickyFilters>
            </Grid>

            {/* Main content area */}
            <Grid item xs={12} md={9} lg={10}>
              {/* Search & filter bar */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  mb: 4,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 2,
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderRadius: 2,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexGrow: 1 }}>
                  <SearchField
                    placeholder="Search products..."
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setPage(1); // Reset page when searching
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search color="action" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ maxWidth: 300 }}
                  />
                  
                  {/* Mobile category filter */}
                  <Box sx={{ display: { xs: "block", md: "none" }, flexGrow: 1, overflow: "auto" }}>
                    <CategoryFilter>
                      <Chip
                        label="All"
                        clickable
                        onClick={() => handleCategoryChange("all")}
                        color={categoryFilter === "all" ? "primary" : "default"}
                        sx={{ fontWeight: 500 }}
                      />
                      {categories
                        .filter(cat => cat !== "all")
                        .map((category) => (
                          <Chip
                            key={category}
                            label={category}
                            clickable
                            onClick={() => handleCategoryChange(category)}
                            color={categoryFilter === category ? "primary" : "default"}
                            sx={{ fontWeight: 500 }}
                          />
                        ))}
                    </CategoryFilter>
                  </Box>
                </Box>
                
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <IconButton
                      color={viewMode === "grid" ? "primary" : "default"}
                      onClick={() => setViewMode("grid")}
                      size="small"
                    >
                      <GridView fontSize="small" />
                    </IconButton>
                    <IconButton
                      color={viewMode === "list" ? "primary" : "default"}
                      onClick={() => setViewMode("list")}
                      size="small"
                      sx={{ display: { xs: "none", sm: "flex" } }}
                    >
                      <ViewList fontSize="small" />
                    </IconButton>
                  </Box>
                  
                  <SortSelect size="small">
                    <Select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      displayEmpty
                      size="small"
                      startAdornment={
                        <InputAdornment position="start">
                          <Sort fontSize="small" />
                        </InputAdornment>
                      }
                    >
                      <MenuItem value="featured">Featured</MenuItem>
                      <MenuItem value="priceAsc">Price: Low to High</MenuItem>
                      <MenuItem value="priceDesc">Price: High to Low</MenuItem>
                      <MenuItem value="nameAsc">Name: A to Z</MenuItem>
                      <MenuItem value="nameDesc">Name: Z to A</MenuItem>
                    </Select>
                  </SortSelect>
                </Box>
              </Paper>

              {/* Results count and active filters */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Showing {paginatedProducts.length} of {filteredProducts.length} products
                </Typography>
                
                {categoryFilter !== "all" && (
                  <Chip
                    label={`Category: ${categoryFilter}`}
                    onDelete={() => handleCategoryChange("all")}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                )}
              </Box>

              {loading ? (
                // Skeleton loading state
                <Grid container spacing={3}>
                  {Array.from(new Array(8)).map((_, index) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                      <ProductSkeleton />
                    </Grid>
                  ))}
                </Grid>
              ) : error ? (
                // Error state
                <Paper
                  sx={{
                    textAlign: "center",
                    py: 8,
                    px: 3,
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.error.main, 0.05),
                    border: "1px solid",
                    borderColor: alpha(theme.palette.error.main, 0.1),
                  }}
                >
                  <Typography variant="h5" color="error" gutterBottom>
                    Oops! Something went wrong
                  </Typography>
                  <Typography color="text.secondary" paragraph>
                    {error}
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => window.location.reload()}
                    startIcon={<Sort />}
                  >
                    Try Again
                  </Button>
                </Paper>
              ) : filteredProducts.length === 0 ? (
                // No results state
                <Paper
                  sx={{
                    textAlign: "center",
                    py: 8,
                    px: 3,
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="h5" gutterBottom>
                    No products found
                  </Typography>
                  <Typography color="text.secondary" paragraph>
                    Try adjusting your search or filter criteria.
                  </Typography>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => {
                      setCategoryFilter("all");
                      setSearchQuery("");
                    }}
                  >
                    Clear Filters
                  </Button>
                </Paper>
              ) : (
                // Product grid/list
                <>
                  <Grid container spacing={3}>
                    {paginatedProducts.map((product) => (
                      <Grid 
                        item 
                        xs={12} 
                        sm={viewMode === "list" ? 12 : 6} 
                        md={viewMode === "list" ? 12 : 4} 
                        lg={viewMode === "list" ? 12 : 3} 
                        key={product.id}
                      >
                        {viewMode === "grid" ? (
                          <ProductCard 
                            onClick={() => navigate(`/product/${product.id}`)}
                            sx={{ cursor: "pointer" }}
                          >
                            <Box sx={{ position: "relative" }}>
                              {product.onSale && (
                                <ProductBadge
                                  label="SALE"
                                  color="secondary"
                                  size="small"
                                />
                              )}
                              {product.isNew && (
                                <ProductBadge
                                  label="NEW"
                                  color="primary"
                                  size="small"
                                  sx={{ 
                                    left: product.onSale ? 70 : 12,
                                    backgroundColor: "#2ecc71"
                                  }}
                                />
                              )}
                              <ProductImage
                                component="img"
                                image={`http://localhost:8000${product.image_url}`}
                                alt={product.productDisplayName}
                                className="product-media"
                              />
                              <ProductActions className="product-actions">
                                <Tooltip title="Add to wishlist" arrow placement="left">
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleWishlist(product.id);
                                    }}
                                    sx={{
                                      bgcolor: "white",
                                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                      mb: 1,
                                      "&:hover": { 
                                        bgcolor: "white",
                                        transform: "scale(1.1)",
                                      },
                                    }}
                                  >
                                    {wishlist.includes(product.id) ? (
                                      <Favorite fontSize="small" color="error" />
                                    ) : (
                                      <FavoriteBorder fontSize="small" />
                                    )}
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Add to cart" arrow placement="left">
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      console.log(`Added ${product.id} to cart`);
                                    }}
                                    sx={{
                                      bgcolor: "white",
                                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                      "&:hover": { 
                                        bgcolor: "white",
                                        transform: "scale(1.1)",
                                      },
                                    }}
                                  >
                                    <ShoppingCart fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </ProductActions>
                              <QuickViewButton 
                                size="small" 
                                className="quick-view-btn"
                                startIcon={<Visibility fontSize="small" />}
                                onClick={(e) => handleQuickView(e, product)}
                              >
                                Quick View
                              </QuickViewButton>
                            </Box>
                            <CardContent>
                              <Box sx={{ mb: 0.5 }}>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  component="div"
                                >
                                  {product.subCategory}
                                </Typography>
                              </Box>
                              <Typography
                                variant="subtitle1"
                                component="div"
                                noWrap
                                sx={{ fontWeight: 500, mb: 0.5 }}
                              >
                                {product.productDisplayName}
                              </Typography>
                              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                                <Rating
                                  value={parseFloat(product.rating)}
                                  precision={0.5}
                                  size="small"
                                  readOnly
                                />
                                <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                                  ({product.reviewCount})
                                </Typography>
                              </Box>
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                }}
                              >
                                <Box>
                                  <Typography
                                    variant="h6"
                                    color="primary"
                                    sx={{ fontWeight: 600 }}
                                  >
                                    ${product.price.toFixed(2)}
                                  </Typography>
                                  {product.oldPrice && (
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                      sx={{ textDecoration: "line-through", ml: 1 }}
                                    >
                                      ${product.oldPrice.toFixed(2)}
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                            </CardContent>
                          </ProductCard>
                        ) : (
                          // List view layout
                          <ProductCard sx={{ cursor: "pointer" }}>
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: { xs: "column", sm: "row" },
                              }}
                              onClick={() => navigate(`/product/${product.id}`)}
                            >
                              <Box sx={{ position: "relative", width: { xs: "100%", sm: 200 } }}>
                                {product.onSale && (
                                  <ProductBadge
                                    label="SALE"
                                    color="secondary"
                                    size="small"
                                  />
                                )}
                                {product.isNew && (
                                  <ProductBadge
                                    label="NEW"
                                    color="primary"
                                    size="small"
                                    sx={{ 
                                      left: product.onSale ? 70 : 12,
                                      backgroundColor: "#2ecc71"
                                    }}
                                  />
                                )}
                                <ProductImage
                                  component="img"
                                  image={`http://localhost:8000${product.image_url}`}
                                  alt={product.productDisplayName}
                                  className="product-media"
                                  sx={{ 
                                    height: { xs: 200, sm: "100%" },
                                    width: { xs: "100%", sm: 200 },
                                  }}
                                />
                                <ProductActions className="product-actions">
                                  <Tooltip title="Add to wishlist" arrow placement="left">
                                    <IconButton
                                      size="small"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleWishlist(product.id);
                                      }}
                                      sx={{
                                        bgcolor: "white",
                                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                        mb: 1,
                                        "&:hover": { 
                                          bgcolor: "white",
                                          transform: "scale(1.1)",
                                        },
                                      }}
                                    >
                                      {wishlist.includes(product.id) ? (
                                        <Favorite fontSize="small" color="error" />
                                      ) : (
                                        <FavoriteBorder fontSize="small" />
                                      )}
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Add to cart" arrow placement="left">
                                    <IconButton
                                      size="small"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        console.log(`Added ${product.id} to cart`);
                                      }}
                                      sx={{
                                        bgcolor: "white",
                                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                        "&:hover": { 
                                          bgcolor: "white",
                                          transform: "scale(1.1)",
                                        },
                                      }}
                                    >
                                      <ShoppingCart fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </ProductActions>
                              </Box>
                              <Box sx={{ p: 2, flex: 1 }}>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {product.subCategory}
                                </Typography>
                                <Typography
                                  variant="h6"
                                  component="div"
                                  sx={{ fontWeight: 500, mb: 1 }}
                                >
                                  {product.productDisplayName}
                                </Typography>
                                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                                  <Rating
                                    value={parseFloat(product.rating)}
                                    precision={0.5}
                                    size="small"
                                    readOnly
                                  />
                                  <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                                    ({product.reviewCount})
                                  </Typography>
                                </Box>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ mb: 2, display: { xs: "none", md: "block" } }}
                                >
                                  {product.description || 
                                    "This premium product combines style and comfort with quality craftsmanship."}
                                </Typography>
                                <Box
                                  sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    mt: "auto",
                                  }}
                                >
                                  <Box>
                                    <Typography
                                      variant="h6"
                                      color="primary"
                                      sx={{ fontWeight: 600 }}
                                    >
                                      ${product.price.toFixed(2)}
                                    </Typography>
                                    {product.oldPrice && (
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{ textDecoration: "line-through", ml: 1 }}
                                      >
                                        ${product.oldPrice.toFixed(2)}
                                      </Typography>
                                    )}
                                  </Box>
                                  <Box sx={{ display: "flex", gap: 1 }}>
                                    <Button
                                      variant="outlined"
                                      size="small"
                                      startIcon={<Visibility />}
                                      onClick={(e) => handleQuickView(e, product)}
                                    >
                                      Quick View
                                    </Button>
                                    <Button
                                      variant="contained"
                                      size="small"
                                      startIcon={<ShoppingCart />}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        console.log(`Added ${product.id} to cart`);
                                      }}
                                    >
                                      Add to Cart
                                    </Button>
                                  </Box>
                                </Box>
                              </Box>
                            </Box>
                          </ProductCard>
                        )}
                      </Grid>
                    ))}
                  </Grid>
                  
                  {/* Pagination controls */}
                  {filteredProducts.length > productsPerPage && (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        mt: 6,
                        mb: 2,
                      }}
                    >
                      <Pagination
                        count={Math.ceil(filteredProducts.length / productsPerPage)}
                        page={page}
                        onChange={(e, newPage) => setPage(newPage)}
                        color="primary"
                        size="large"
                        showFirstButton
                        showLastButton
                      />
                    </Box>
                  )}
                </>
              )}
            </Grid>
          </Grid>
        </Container>

        {/* Back to top button */}
        <Fade in={showBackToTop}>
          <Box
            onClick={scrollToTop}
            sx={{
              position: "fixed",
              bottom: 24,
              right: 24,
              zIndex: 10,
              cursor: "pointer",
              bgcolor: alpha(theme.palette.primary.main, 0.9),
              color: "white",
              borderRadius: "50%",
              width: 48,
              height: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              transition: "all 0.2s",
              "&:hover": {
                bgcolor: theme.palette.primary.main,
                transform: "translateY(-3px)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
              },
            }}
          >
            <ArrowUpward />
          </Box>
        </Fade>

        {/* Quick view dialog */}
        <QuickViewDialog 
          open={!!quickViewProduct} 
          onClose={handleCloseQuickView} 
          product={quickViewProduct}
        />
      </Box>
    </ThemeProvider>
  );
};

export default EnhancedProductCatalog;