import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  Dialog,
  DialogContent,
  DialogTitle,
  useMediaQuery,
  alpha,
  Slider,
  CircularProgress, // Add CircularProgress for loading state
  Alert, // Add Alert for error messages
  Accordion, // Add Accordion for filter panels
  AccordionSummary, // Add AccordionSummary
  AccordionDetails, // Add AccordionDetails
  Drawer, // Add Drawer for mobile filters
  List, // Add List for mobile filter menu
  ListItem, // Add ListItem for mobile filter menu
  ListItemText, // Add ListItemText for mobile filter menu
  Divider, // Add Divider for separating filter sections
  Switch, // Add Switch for toggle features
  Tooltip, // Add Tooltip for explaining features
} from "@mui/material";
import {
  Search,
  FavoriteBorder,
  Favorite,
  ShoppingCart,
  GridView,
  ViewList,
  Close,
  Visibility,
  KeyboardArrowUp,
  ArrowForward,
  FilterList, // Add FilterList for filter icon
  Sort, // Add Sort for sort icon
  ExpandMore, // Add ExpandMore for accordion
  Tune, // Add Tune for advanced filter
  Clear, // Add Clear for clearing filters
} from "@mui/icons-material";
import { ThemeProvider, createTheme, styled } from "@mui/material/styles";
import { useNavigate, Link as RouterLink, useSearchParams } from "react-router-dom"; // Add useSearchParams

const theme = createTheme({
  palette: {
    primary: {
      main: "#0f4c81", // Soft blue as primary color
      light: "#3671a5",
      dark: "#092c4c",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#f5f5f5", // Light gray as secondary color
      light: "#ffffff",
      dark: "#e0e0e0",
      contrastText: "#0f4c81",
    },
    background: {
      default: "#ffffff",
      paper: "#ffffff",
    },
    text: {
      primary: "#333333",
      secondary: "#666666",
    },
  },
  typography: {
    fontFamily: "'Helvetica Neue', 'Inter', 'Roboto', 'Arial', sans-serif",
    h1: {
      fontWeight: 400,
      letterSpacing: 1,
    },
    h2: {
      fontWeight: 400,
      letterSpacing: 0.5,
    },
    h3: {
      fontWeight: 400,
      letterSpacing: 0.5,
    },
    h4: {
      fontWeight: 400,
    },
    h5: {
      fontWeight: 400,
    },
    h6: {
      fontWeight: 400,
    },
    button: {
      textTransform: "none",
      fontWeight: 400,
      letterSpacing: 0.5,
    },
    body1: {
      letterSpacing: 0.3,
    },
    body2: {
      letterSpacing: 0.3,
    },
  },
  shape: {
    borderRadius: 0,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          padding: "10px 24px",
          fontSize: "0.875rem",
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
          },
        },
        containedPrimary: {
          backgroundColor: "#0f4c81",
          "&:hover": {
            backgroundColor: "#092c4c",
          },
        },
        outlinedPrimary: {
          borderWidth: 1,
          "&:hover": {
            borderWidth: 1,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          boxShadow: "none",
          border: "none",
          overflow: "hidden",
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: "16px 0",
          "&:last-child": {
            paddingBottom: 16,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 400,
          borderRadius: 0,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          boxShadow: "none",
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 0,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 0,
        },
      },
    },
    MuiPagination: {
      styleOverrides: {
        root: {
          "& .MuiPaginationItem-root": {
            borderRadius: 0,
          },
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: 0,
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
  background: "transparent",
  "&:hover": {
    "& .product-media": {
      opacity: 0.9,
    },
    "& .product-actions": {
      opacity: 1,
    },
    "& .quick-view-btn": {
      opacity: 1,
    },
  },
}));

const ProductImage = styled(CardMedia)(({ theme }) => ({
  height: 450,
  transition: "opacity 0.3s ease",
  position: "relative",
  backgroundColor: "#f8f8f8",
}));

const ProductActions = styled(Box)(({ theme }) => ({
  position: "absolute",
  bottom: 196,
  left: 0,
  right: 0,
  display: "flex",
  justifyContent: "center",
  opacity: 0,
  transition: "all 0.3s ease",
  gap: 8,
  padding: "8px 0",
}));

const QuickViewButton = styled(Button)(({ theme }) => ({
  position: "absolute",
  bottom: 120,
  left: "50%",
  transform: "translateX(-50%)",
  opacity: 0,
  transition: "all 0.3s ease",
  backgroundColor: "rgba(255, 255, 255, 0.9)",
  color: theme.palette.text.primary,
  "&:hover": {
    backgroundColor: theme.palette.common.white,
  },
  zIndex: 2,
  paddingLeft: 16, 
  paddingRight: 16,
}));

const ProductBadge = styled(Chip)(({ theme, color }) => ({
  position: "absolute",
  top: 12,
  left: 0,
  fontWeight: 400,
  fontSize: "0.75rem",
  letterSpacing: "1px",
  borderRadius: 0,
  zIndex: 2,
  paddingLeft: 5,
  paddingRight: 5,
}));

const FilterButton = styled(Button)(({ theme, active }) => ({
  borderRadius: 0,
  padding: "6px 16px",
  fontSize: "0.875rem",
  color: active ? theme.palette.common.white : theme.palette.text.primary,
  backgroundColor: active ? theme.palette.primary.main : theme.palette.common.white,
  border: active ? "none" : `1px solid ${theme.palette.divider}`,
  "&:hover": {
    backgroundColor: active ? theme.palette.primary.dark : alpha(theme.palette.primary.main, 0.05),
  },
}));

const SortSelect = styled(FormControl)(({ theme }) => ({
  minWidth: 180,
  "& .MuiOutlinedInput-root": {
    borderRadius: 0,
  },
}));

const SearchField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: 0,
    backgroundColor: alpha(theme.palette.common.white, 0.8),
  },
}));

const StickyFilters = styled(Box)(({ theme }) => ({
  position: "sticky",
  top: 24,
  background: theme.palette.background.paper,
  overflow: "hidden",
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
    borderRadius: 0,
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
        elevation: 0,
        sx: {
          borderRadius: 0,
          overflow: "hidden",
          border: "1px solid",
          borderColor: "divider",
        }
      }}
    >
      <DialogTitle sx={{ 
        display: "flex", 
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid",
        borderColor: "divider",
        pt: 2,
        pb: 2,
      }}>
        <Typography variant="h6" sx={{ fontWeight: 400, letterSpacing: 0.5 }}>Quick View</Typography>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent>
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
                  color="error"
                  size="small"
                  sx={{
                    position: "absolute",
                    top: 16,
                    left: 0,
                    fontWeight: 400,
                    borderRadius: 0,
                  }}
                />
              )}
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 4, height: "100%", display: "flex", flexDirection: "column" }}>
              <Typography variant="caption" color="text.secondary" gutterBottom letterSpacing={1} textTransform="uppercase">
                {product.subCategory}
              </Typography>
              <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 400, letterSpacing: 0.5 }}>
                {product.productDisplayName}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Rating value={product.rating || 4.5} precision={0.5} readOnly size="small" />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  {product.reviewCount || 42} Reviews
                </Typography>
              </Box>
              <Typography variant="h5" color="text.primary" sx={{ mb: 2, fontWeight: 400 }}>
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
              <Typography variant="body2" sx={{ mb: 4, letterSpacing: 0.3, lineHeight: 1.6 }}>
                {product.description || "This premium product combines style, comfort, and quality craftsmanship. Made with carefully selected materials for everyday wear and special occasions alike."}
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12}>
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
                <Grid item xs={12}>
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

// // Main product catalog component with enhanced styling
// const WestsideProductCatalog = () => {
//   // State management
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [sortBy, setSortBy] = useState("featured");
//   const [categoryFilter, setCategoryFilter] = useState("all");
//   const [viewMode, setViewMode] = useState("grid");
//   const [page, setPage] = useState(1);
//   const [quickViewProduct, setQuickViewProduct] = useState(null);
//   const [showBackToTop, setShowBackToTop] = useState(false);
//   const [wishlist, setWishlist] = useState([]);
  
//   const navigate = useNavigate();
//   const productsPerPage = 12;

//   // Track scroll for back-to-top button
//   useEffect(() => {
//     const handleScroll = () => {
//       setShowBackToTop(window.scrollY > 500);
//     };
    
//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   // Fetch products from API
//   useEffect(() => {
//     const fetchProducts = async () => {
//       setLoading(true);
//       try {
//         const response = await fetch("http://localhost:8000/api/products");
//         if (!response.ok) {
//           throw new Error(`Failed to fetch: ${response.status}`);
//         }

//         const data = await response.json();

//         // Process products to ensure all have required fields and add additional demo data
//         const processedProducts = data.products.map((product, index) => ({
//           ...product,
//           price: product.price || Math.floor(Math.random() * 100) + 20,
//           oldPrice: index % 3 === 0 ? (product.price || Math.floor(Math.random() * 100) + 20) * 1.2 : null,
//           image_url: product.image_url || "/images/placeholder.jpg",
//           productDisplayName: product.productDisplayName || "Untitled Product",
//           subCategory: product.subCategory || "Uncategorized",
//           rating: (Math.random() * 2 + 3).toFixed(1),
//           reviewCount: Math.floor(Math.random() * 500) + 10,
//           onSale: index % 4 === 0,
//           isNew: index % 5 === 0,
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

//   // Get unique categories for filtering
//   const categories = useMemo(() => {
//     if (!products.length) return [];
//     const categoriesSet = new Set(products.map(product => product.subCategory));
//     return ['all', ...Array.from(categoriesSet)];
//   }, [products]);

//   // Handle wishlist toggle
//   const toggleWishlist = (productId) => {
//     setWishlist(prev => 
//       prev.includes(productId)
//         ? prev.filter(id => id !== productId)
//         : [...prev, productId]
//     );
//   };

//   // Handle quick view
//   const handleQuickView = (e, product) => {
//     e.stopPropagation();
//     setQuickViewProduct(product);
//   };

//   const handleCloseQuickView = () => {
//     setQuickViewProduct(null);
//   };

//   // Handle category filter change
//   const handleCategoryChange = (category) => {
//     setCategoryFilter(category);
//     setPage(1); // Reset to first page when changing filters
//   };

//   // Handle back to top
//   const scrollToTop = () => {
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//   };

//   // Apply filters and sorting to products
//   const filteredProducts = useMemo(() => {
//     return products
//       .filter(product => 
//         (categoryFilter === 'all' || product.subCategory === categoryFilter) &&
//         (searchQuery === '' || product.productDisplayName.toLowerCase().includes(searchQuery.toLowerCase()))
//       )
//       .sort((a, b) => {
//         switch(sortBy) {
//           case 'priceAsc':
//             return a.price - b.price;
//           case 'priceDesc':
//             return b.price - a.price;
//           case 'nameAsc':
//             return a.productDisplayName.localeCompare(b.productDisplayName);
//           case 'nameDesc':
//             return b.productDisplayName.localeCompare(a.productDisplayName);
//           default: // featured
//             return 0;
//         }
//       });
//   }, [products, categoryFilter, searchQuery, sortBy]);

//   // Paginate products
//   const paginatedProducts = useMemo(() => {
//     const startIdx = (page - 1) * productsPerPage;
//     return filteredProducts.slice(startIdx, startIdx + productsPerPage);
//   }, [filteredProducts, page]);

//   // Create skeleton loader for products
//   const ProductSkeleton = () => (
//     <Card sx={{ height: '100%', boxShadow: 'none' }}>
//       <Skeleton variant="rectangular" height={450} />
//       <CardContent sx={{ pt: 2, px: 0 }}>
//         <Skeleton variant="text" width="60%" height={24} />
//         <Skeleton variant="text" width="40%" height={20} />
//         <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
//           <Skeleton variant="text" width="30%" height={32} />
//           <Skeleton variant="circular" width={36} height={36} />
//         </Box>
//       </CardContent>
//     </Card>
//   );

//   return (
//     <ThemeProvider theme={theme}>
//       <Box sx={{ bgcolor: "background.default", minHeight: "100vh", pb: 8, px: 12, pt: 9}}>
//         {/* Hero section */}
//         <Box
//           sx={{
//             bgcolor: "#f5f5f5",
//             color: "text.primary",
//             py: { xs: 8, md: 12 },
//             mb: 4,
//             position: "relative",
//             overflow: "hidden",
//           }}
//         >
//           <Container maxWidth="xl">
//             <Grid container spacing={4} alignItems="center">
//               <Grid item xs={12} md={6}>
//                 <Box>
//                   <Typography 
//                     variant="caption" 
//                     sx={{ 
//                       fontWeight: 400, 
//                       letterSpacing: 2,
//                       textTransform: "uppercase",
//                       display: "block",
//                       mb: 1,
//                       color: "#0f4c81"
//                     }}
//                   >
//                     New Collection
//                   </Typography>
//                   <Typography
//                     variant="h2"
//                     component="h1"
//                     sx={{
//                       fontWeight: 400,
//                       mb: 2,
//                       letterSpacing: 1,
//                       fontSize: { xs: "2rem", md: "2.5rem" },
//                     }}
//                   >
//                     Spring/Summer 2025
//                   </Typography>
//                   <Typography 
//                     variant="body1" 
//                     sx={{ 
//                       fontWeight: 400, 
//                       mb: 4,
//                       maxWidth: 500,
//                       lineHeight: 1.8,
//                       letterSpacing: 0.3,
//                     }}
//                   >
//                     Explore our curated collection of premium fashion items designed for style and comfort.
//                   </Typography>
//                   <Box sx={{ display: "flex", gap: 2 }}>
//                     <Button 
//                       variant="contained" 
//                       color="primary" 
//                       size="large"
//                       sx={{
//                         px: 4,
//                         py: 1.5,
//                         letterSpacing: 1,
//                       }}
//                     >
//                       Shop Now
//                     </Button>
//                   </Box>
//                 </Box>
//               </Grid>
//             </Grid>
//           </Container>
//         </Box>

//         <Container maxWidth="xl">
//           {/* Breadcrumbs navigation */}
//           <Breadcrumbs sx={{ mb: 4 }}>
//             <Typography 
//               component={RouterLink} 
//               to="/" 
//               color="inherit" 
//               sx={{ 
//                 textDecoration: "none",
//                 "&:hover": { textDecoration: "underline" }
//               }}
//             >
//               Home
//             </Typography>
//             <Typography color="text.primary">Products</Typography>
//           </Breadcrumbs>

//           <Grid container spacing={6}>
//             {/* Sidebar with filters - visible on desktop */}
//             <Grid item xs={12} md={3} lg={2} sx={{ display: { xs: "none", md: "block" } }}>
//               <StickyFilters>
//                 <Box sx={{ pb: 3, borderBottom: "1px solid", borderColor: "divider" }}>
//                   <Typography variant="h6" letterSpacing={0.5} gutterBottom sx={{ fontWeight: 500 }}>
//                     Categories
//                   </Typography>
//                   <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
//                     {categories.map((category) => (
//                       <Button
//                         key={category}
//                         variant="text"
//                         color={categoryFilter === category ? "primary" : "inherit"}
//                         sx={{
//                           justifyContent: "flex-start",
//                           fontWeight: categoryFilter === category ? 500 : 400,
//                           pl: 1,
//                           py: 0.5,
//                           backgroundColor: "transparent",
//                           letterSpacing: 0.3,
//                           "&:hover": {
//                             backgroundColor: "transparent",
//                             color: "#0f4c81"
//                           },
//                           borderRadius: 0,
//                           textTransform: "uppercase",
//                           fontSize: "0.85rem"
//                         }}
//                         onClick={() => handleCategoryChange(category)}
//                       >
//                         {category === "all" ? "All Categories" : category}
//                       </Button>
//                     ))}
//                   </Box>
//                 </Box>
                
//                 <Box sx={{ pt: 3 }}>
//                   <Typography variant="h6" letterSpacing={0.5} gutterBottom sx={{ fontWeight: 500 }}>
//                     Sort By
//                   </Typography>
//                   <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
//                     {[
//                       { value: "featured", label: "Featured" },
//                       { value: "priceAsc", label: "Price: Low to High" },
//                       { value: "priceDesc", label: "Price: High to Low" },
//                       { value: "nameAsc", label: "Name: A to Z" },
//                       { value: "nameDesc", label: "Name: Z to A" }
//                     ].map((option) => (
//                       <Button
//                         key={option.value}
//                         variant="text"
//                         color={sortBy === option.value ? "primary" : "inherit"}
//                         sx={{
//                           justifyContent: "flex-start",
//                           fontWeight: sortBy === option.value ? 500 : 400,
//                           pl: 1,
//                           py: 0.5,
//                           backgroundColor: "transparent",
//                           letterSpacing: 0.3,
//                           "&:hover": {
//                             backgroundColor: "transparent",
//                             color: "#0f4c81"
//                           },
//                           borderRadius: 0,
//                           fontSize: "0.85rem"
//                         }}
//                         onClick={() => setSortBy(option.value)}
//                       >
//                         {option.label}
//                       </Button>
//                     ))}
//                   </Box>
//                 </Box>
//               </StickyFilters>
//             </Grid>

//             {/* Main content area */}
//             <Grid item xs={12} md={9} lg={10}>
//               {/* Search & filter bar */}
//               <Box
//                 sx={{
//                   mb: 4,
//                   display: "flex",
//                   flexWrap: "wrap",
//                   gap: 2,
//                   alignItems: "center",
//                   justifyContent: "space-between",
//                 }}
//               >
//                 <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexGrow: 1 }}>
//                   <SearchField
//                     placeholder="Search products..."
//                     variant="outlined"
//                     size="small"
//                     fullWidth
//                     value={searchQuery}
//                     onChange={(e) => {
//                       setSearchQuery(e.target.value);
//                       setPage(1); // Reset page when searching
//                     }}
//                     InputProps={{
//                       startAdornment: (
//                         <InputAdornment position="start">
//                           <Search color="action" />
//                         </InputAdornment>
//                       ),
//                     }}
//                     sx={{ maxWidth: 300 }}
//                   />
                  
//                   {/* Mobile category filter */}
//                   <Box sx={{ display: { xs: "block", md: "none" }, flexGrow: 1, overflow: "auto" }}>
//                     <CategoryFilter>
//                       <Chip
//                         label="All"
//                         clickable
//                         onClick={() => handleCategoryChange("all")}
//                         color={categoryFilter === "all" ? "primary" : "default"}
//                         sx={{ fontWeight: 400 }}
//                       />
//                       {categories
//                         .filter(cat => cat !== "all")
//                         .map((category) => (
//                           <Chip
//                             key={category}
//                             label={category}
//                             clickable
//                             onClick={() => handleCategoryChange(category)}
//                             color={categoryFilter === category ? "primary" : "default"}
//                             sx={{ fontWeight: 400 }}
//                           />
//                         ))}
//                     </CategoryFilter>
//                   </Box>
//                 </Box>
                
//                 <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
//                   <Box sx={{ display: "flex", alignItems: "center" }}>
//                     <IconButton
//                       color={viewMode === "grid" ? "primary" : "default"}
//                       onClick={() => setViewMode("grid")}
//                       size="small"
//                     >
//                       <GridView fontSize="small" />
//                     </IconButton>
//                     <IconButton
//                       color={viewMode === "list" ? "primary" : "default"}
//                       onClick={() => setViewMode("list")}
//                       size="small"
//                       sx={{ display: { xs: "none", sm: "flex" } }}
//                     >
//                       <ViewList fontSize="small" />
//                     </IconButton>
//                   </Box>
                  
//                   {/* Mobile sort selector */}
//                   <Box sx={{ display: { xs: "block", md: "none" } }}>
//                     <SortSelect size="small">
//                       <Select
//                         value={sortBy}
//                         onChange={(e) => setSortBy(e.target.value)}
//                         displayEmpty
//                         size="small"
//                       >
//                         <MenuItem value="featured">Featured</MenuItem>
//                         <MenuItem value="priceAsc">Price: Low to High</MenuItem>
//                         <MenuItem value="priceDesc">Price: High to Low</MenuItem>
//                         <MenuItem value="nameAsc">Name: A to Z</MenuItem>
//                         <MenuItem value="nameDesc">Name: Z to A</MenuItem>
//                       </Select>
//                     </SortSelect>
//                   </Box>
//                 </Box>
//               </Box>

//               {/* Results count and active filters */}
//               <Box
//                 sx={{
//                   display: "flex",
//                   justifyContent: "space-between",
//                   alignItems: "center",
//                   mb: 4,
//                 }}
//               >
//                 <Typography variant="body2" color="text.secondary" letterSpacing={0.3}>
//                   Showing {paginatedProducts.length} of {filteredProducts.length} products
//                 </Typography>
                
//                 {categoryFilter !== "all" && (
//                   <Chip
//                     label={`${categoryFilter}`}
//                     onDelete={() => handleCategoryChange("all")}
//                     size="small"
//                     color="primary"
//                     variant="outlined"
//                   />
//                 )}
//               </Box>

//               {loading ? (
//                 // Skeleton loading state
//                 <Grid container spacing={4}>
//                   {Array.from(new Array(8)).map((_, index) => (
//                     <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
//                       <ProductSkeleton />
//                     </Grid>
//                   ))}
//                 </Grid>
//               ) : error ? (
//                 // Error state
//                 <Box
//                   sx={{
//                     textAlign: "center",
//                     py: 8,
//                     px: 3,
//                     borderTop: "1px solid #e0e0e0",
//                     borderBottom: "1px solid #e0e0e0",
//                   }}
//                 >
//                   <Typography variant="h5" gutterBottom sx={{ fontWeight: 400, letterSpacing: 0.5 }}>
//                     Oops! Something went wrong
//                   </Typography>
//                   <Typography color="text.secondary" paragraph letterSpacing={0.3} sx={{ mb: 4 }}>
//                     {error}
//                   </Typography>
//                   <Button
//                     variant="contained"
//                     color="primary"
//                     onClick={() => window.location.reload()}
//                   >
//                     Try Again
//                   </Button>
//                 </Box>
//               ) : filteredProducts.length === 0 ? (
//                 // No results state
//                 <Box
//                   sx={{
//                     textAlign: "center",
//                     py: 8,
//                     px: 3,
//                     borderTop: "1px solid #e0e0e0",
//                     borderBottom: "1px solid #e0e0e0",
//                   }}
//                 >
//                   <Typography variant="h5" gutterBottom sx={{ fontWeight: 400, letterSpacing: 0.5 }}>
//                     No products found
//                   </Typography>
//                   <Typography color="text.secondary" paragraph letterSpacing={0.3} sx={{ mb: 4 }}>
//                     Try adjusting your search or filter criteria.
//                   </Typography>
//                   <Button
//                     variant="outlined"
//                     color="primary"
//                     onClick={() => {
//                       setCategoryFilter("all");
//                       setSearchQuery("");
//                     }}
//                   >
//                     Clear Filters
//                   </Button>
//                 </Box>
//               ) : (
//                 // Product grid/list
//                 <>
//                   <Grid container spacing={4}>
//                     {paginatedProducts.map((product) => (
//                       <Grid 
//                         item 
//                         xs={12} 
//                         sm={viewMode === "list" ? 12 : 6} 
//                         md={viewMode === "list" ? 12 : 4} 
//                         lg={viewMode === "list" ? 12 : 3} 
//                         key={product.id}
//                       >
//                         {viewMode === "grid" ? (
//                           <ProductCard 
//                             onClick={() => navigate(`/product/${product.id}`)}
//                             sx={{ cursor: "pointer" }}
//                           >
//                             <Box sx={{ position: "relative" }}>
//                               {product.onSale && (
//                                 <ProductBadge
//                                   label="SALE"
//                                   color="error"
//                                   size="small"
//                                 />
//                               )}
//                               {product.isNew && (
//                                 <ProductBadge
//                                   label="NEW"
//                                   size="small"
//                                   sx={{ 
//                                     top: product.onSale ? 42 : 12,
//                                     backgroundColor: "#0f4c81",
//                                     color: "white"
//                                   }}
//                                 />
//                               )}
//                               <ProductImage
//                                 component="img"
//                                 image={`http://localhost:8000${product.image_url}`}
//                                 alt={product.productDisplayName}
//                                 className="product-media"
//                               />
//                               <ProductActions className="product-actions">
//                                 <Button
//                                   variant="contained"
//                                   color="primary"
//                                   size="small"
//                                   onClick={(e) => {
//                                     e.stopPropagation();
//                                     console.log(`Added ${product.id} to cart`);
//                                   }}
//                                   startIcon={<ShoppingCart />}
//                                 >
//                                   Add to Cart
//                                 </Button>
//                                 <IconButton
//                                   onClick={(e) => {
//                                     e.stopPropagation();
//                                     toggleWishlist(product.id);
//                                   }}
//                                   sx={{
//                                     bgcolor: "white",
//                                     boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
//                                     "&:hover": { 
//                                       bgcolor: "white",
//                                     },
//                                   }}
//                                 >
//                                   {wishlist.includes(product.id) ? (
//                                     <Favorite fontSize="small" color="error" />
//                                   ) : (
//                                     <FavoriteBorder fontSize="small" />
//                                   )}
//                                 </IconButton>
//                               </ProductActions>
//                               <QuickViewButton 
//                                 size="small" 
//                                 className="quick-view-btn"
//                                 startIcon={<Visibility fontSize="small" />}
//                                 onClick={(e) => handleQuickView(e, product)}
//                                 variant="outlined"
//                               >
//                                 Quick View
//                               </QuickViewButton>
//                             </Box>
//                             <CardContent>
//                               <Typography
//                                 variant="caption"
//                                 color="text.secondary"
//                                 component="div"
//                                 letterSpacing={1}
//                                 textTransform="uppercase"
//                               >
//                                 {product.subCategory}
//                               </Typography>
//                               <Typography
//                                 variant="body1"
//                                 component="div"
//                                 noWrap
//                                 sx={{ fontWeight: 400, mb: 1, mt: 0.5, letterSpacing: 0.3 }}
//                               >
//                                 {product.productDisplayName}
//                               </Typography>
//                               <Typography
//                                 variant="body2"
//                                 color="text.primary"
//                                 sx={{ fontWeight: 400, letterSpacing: 0.3 }}
//                               >
//                                 ${product.price.toFixed(2)}
//                                 {product.oldPrice && (
//                                   <Typography
//                                     component="span"
//                                     variant="body2"
//                                     color="text.secondary"
//                                     sx={{ textDecoration: "line-through", ml: 1 }}
//                                   >
//                                     ${product.oldPrice.toFixed(2)}
//                                   </Typography>
//                                 )}
//                               </Typography>
//                             </CardContent>
//                           </ProductCard>
//                         ) : (
//                           // List view layout
//                           <ProductCard sx={{ cursor: "pointer" }}>
//                             <Box
//                               sx={{
//                                 display: "flex",
//                                 flexDirection: { xs: "column", sm: "row" },
//                               }}
//                               onClick={() => navigate(`/product/${product.id}`)}
//                             >
//                               <Box sx={{ position: "relative", width: { xs: "100%", sm: 250 } }}>
//                                 {product.onSale && (
//                                   <ProductBadge
//                                     label="SALE"
//                                     color="error"
//                                     size="small"
//                                   />
//                                 )}
//                                 {product.isNew && (
//                                   <ProductBadge
//                                     label="NEW"
//                                     size="small"
//                                     sx={{ 
//                                       top: product.onSale ? 42 : 12,
//                                       backgroundColor: "#0f4c81",
//                                       color: "white"
//                                     }}
//                                   />
//                                 )}
//                                 <ProductImage
//                                   component="img"
//                                   image={`http://localhost:8000${product.image_url}`}
//                                   alt={product.productDisplayName}
//                                   className="product-media"
//                                   sx={{ 
//                                     height: { xs: 200, sm: 300 },
//                                     width: { xs: "100%", sm: 250 },
//                                   }}
//                                 />
//                               </Box>
//                               <Box sx={{ p: 3, flex: 1 }}>
//                                 <Typography
//                                   variant="caption"
//                                   color="text.secondary"
//                                   letterSpacing={1}
//                                   textTransform="uppercase"
//                                 >
//                                   {product.subCategory}
//                                 </Typography>
//                                 <Typography
//                                   variant="h6"
//                                   component="div"
//                                   sx={{ fontWeight: 400, mb: 1, letterSpacing: 0.5 }}
//                                 >
//                                   {product.productDisplayName}
//                                 </Typography>
//                                 <Typography
//                                   variant="body2"
//                                   color="text.secondary"
//                                   sx={{ mb: 3, display: { xs: "none", md: "block" }, letterSpacing: 0.3, lineHeight: 1.6 }}
//                                 >
//                                   {product.description || 
//                                     "This premium product combines style and comfort with quality craftsmanship."}
//                                 </Typography>
//                                 <Box
//                                   sx={{
//                                     display: "flex",
//                                     justifyContent: "space-between",
//                                     alignItems: "center",
//                                     mt: "auto",
//                                     flexWrap: { xs: "wrap", md: "nowrap" },
//                                     gap: 2
//                                   }}
//                                 >
//                                   <Typography
//                                     variant="body1"
//                                     color="text.primary"
//                                     sx={{ fontWeight: 400, letterSpacing: 0.3 }}
//                                   >
//                                     ${product.price.toFixed(2)}
//                                     {product.oldPrice && (
//                                       <Typography
//                                         component="span"
//                                         variant="body2"
//                                         color="text.secondary"
//                                         sx={{ textDecoration: "line-through", ml: 1 }}
//                                       >
//                                         ${product.oldPrice.toFixed(2)}
//                                       </Typography>
//                                     )}
//                                   </Typography>
//                                   <Box sx={{ display: "flex", gap: 2 }}>
//                                     <Button
//                                       variant="outlined"
//                                       color="primary"
//                                       startIcon={<Visibility />}
//                                       onClick={(e) => handleQuickView(e, product)}
//                                     >
//                                       Quick View
//                                     </Button>
//                                     <Button
//                                       variant="contained"
//                                       color="primary"
//                                       startIcon={<ShoppingCart />}
//                                       onClick={(e) => {
//                                         e.stopPropagation();
//                                         console.log(`Added ${product.id} to cart`);
//                                       }}
//                                     >
//                                       Add to Cart
//                                     </Button>
//                                   </Box>
//                                 </Box>
//                               </Box>
//                             </Box>
//                           </ProductCard>
//                         )}
//                       </Grid>
//                     ))}
//                   </Grid>
                  
//                   {/* Pagination controls */}
//                   {filteredProducts.length > productsPerPage && (
//                     <Box
//                       sx={{
//                         display: "flex",
//                         justifyContent: "center",
//                         mt: 8,
//                         mb: 2,
//                       }}
//                     >
//                       <Pagination
//                         count={Math.ceil(filteredProducts.length / productsPerPage)}
//                         page={page}
//                         onChange={(e, newPage) => setPage(newPage)}
//                         color="primary"
//                         size="large"
//                         showFirstButton
//                         showLastButton
//                       />
//                     </Box>
//                   )}
//                 </>
//               )}
//             </Grid>
//           </Grid>
//         </Container>

//         {/* Back to top button */}
//         <Box
//           onClick={scrollToTop}
//           sx={{
//             position: "fixed",
//             bottom: 24,
//             right: 24,
//             zIndex: 10,
//             cursor: "pointer",
//             bgcolor: alpha(theme.palette.primary.main, 0.9),
//             color: "white",
//             width: 48,
//             height: 48,
//             display: showBackToTop ? "flex" : "none",
//             alignItems: "center",
//             justifyContent: "center",
//             transition: "all 0.2s",
//             "&:hover": {
//               bgcolor: theme.palette.primary.main,
//             },
//           }}
//         >
//           <KeyboardArrowUp />
//         </Box>

//         {/* Quick view dialog */}
//         <QuickViewDialog 
//           open={!!quickViewProduct} 
//           onClose={handleCloseQuickView} 
//           product={quickViewProduct}
//         />
//       </Box>
//     </ThemeProvider>
//   );
// };

// export default WestsideProductCatalog;

// Enhanced product catalog component
const EnhancedProductCatalog = () => {
  // URL Search Parameters for persistent filters and pagination
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State management
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sort_by") || "featured");
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get("category") || "all");
  const [genderFilter, setGenderFilter] = useState(searchParams.get("gender") || "");
  const [colorFilter, setColorFilter] = useState(searchParams.get("color") || "");
  const [priceRange, setPriceRange] = useState([
    parseFloat(searchParams.get("price_min")) || 0, 
    parseFloat(searchParams.get("price_max")) || 1000
  ]);
  const [viewMode, setViewMode] = useState(searchParams.get("view") || "grid");
  const [page, setPage] = useState(parseInt(searchParams.get("page")) || 1);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [productsPerPage, setProductsPerPage] = useState(parseInt(searchParams.get("limit")) || 12);
  const [totalProducts, setTotalProducts] = useState(0);
  const [availableFilters, setAvailableFilters] = useState({
    gender: [],
    masterCategory: [],
    subCategory: [],
    articleType: [],
    baseColour: [],
    season: [],
    usage: [],
  });
  const [priceRangeLimits, setPriceRangeLimits] = useState({ min: 0, max: 1000 });
  const [activeFilters, setActiveFilters] = useState([]);
  
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Calculate offset for API pagination
  const offset = (page - 1) * productsPerPage;

  // Track scroll for back-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch available filters for filter dropdowns
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [categoriesResponse, priceRangeResponse] = await Promise.all([
          fetch("http://localhost:8000/api/categories"),
          fetch("http://localhost:8000/api/price-range")
        ]);
        
        if (!categoriesResponse.ok || !priceRangeResponse.ok) {
          throw new Error(`Failed to fetch filters`);
        }
        
        const categories = await categoriesResponse.json();
        const priceRange = await priceRangeResponse.json();
        
        setAvailableFilters(categories);
        setPriceRangeLimits({
          min: Math.floor(priceRange.min_price),
          max: Math.ceil(priceRange.max_price)
        });
        
        // Initialize price range if not already set
        if (priceRange.min_price !== undefined && priceRange.max_price !== undefined && 
            !searchParams.has("price_min") && !searchParams.has("price_max")) {
          setPriceRange([
            Math.floor(priceRange.min_price),
            Math.ceil(priceRange.max_price)
          ]);
        }
      } catch (err) {
        console.error("Error fetching filters:", err);
      }
    };

    fetchFilters();
  }, [searchParams]);

  // Update active filters display
  useEffect(() => {
    const newActiveFilters = [];
    
    if (categoryFilter && categoryFilter !== "all") {
      newActiveFilters.push({ type: "category", value: categoryFilter, label: `Category: ${categoryFilter}` });
    }
    
    if (genderFilter) {
      newActiveFilters.push({ type: "gender", value: genderFilter, label: `Gender: ${genderFilter}` });
    }
    
    if (colorFilter) {
      newActiveFilters.push({ type: "color", value: colorFilter, label: `Color: ${colorFilter}` });
    }
    
    if (priceRange[0] > priceRangeLimits.min || priceRange[1] < priceRangeLimits.max) {
      newActiveFilters.push({ 
        type: "price", 
        value: priceRange, 
        label: `Price: $${priceRange[0]} - $${priceRange[1]}` 
      });
    }
    
    if (searchQuery) {
      newActiveFilters.push({ type: "search", value: searchQuery, label: `Search: ${searchQuery}` });
    }
    
    setActiveFilters(newActiveFilters);
  }, [categoryFilter, genderFilter, colorFilter, priceRange, searchQuery, priceRangeLimits]);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (page > 1) params.set("page", page.toString());
    if (searchQuery) params.set("search", searchQuery);
    if (sortBy !== "featured") params.set("sort_by", sortBy);
    if (categoryFilter !== "all") params.set("category", categoryFilter);
    if (genderFilter) params.set("gender", genderFilter);
    if (colorFilter) params.set("color", colorFilter);
    if (priceRange[0] > priceRangeLimits.min) params.set("price_min", priceRange[0].toString());
    if (priceRange[1] < priceRangeLimits.max) params.set("price_max", priceRange[1].toString());
    if (viewMode !== "grid") params.set("view", viewMode);
    if (productsPerPage !== 12) params.set("limit", productsPerPage.toString());
    
    setSearchParams(params);
  }, [
    page, 
    searchQuery, 
    sortBy, 
    categoryFilter, 
    genderFilter, 
    colorFilter, 
    priceRange, 
    viewMode, 
    productsPerPage, 
    priceRangeLimits,
    setSearchParams
  ]);

  // Fetch products from API with all filters applied
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Build query parameters
        const params = new URLSearchParams();
        params.append("limit", productsPerPage.toString());
        params.append("offset", offset.toString());
        
        if (searchQuery) params.append("search", searchQuery);
        
        if (categoryFilter && categoryFilter !== "all") {
          // Determine which filter to use based on the category value 
          // (might be articleType, subCategory, or masterCategory)
          if (availableFilters.articleType.includes(categoryFilter)) {
            params.append("articleType", categoryFilter);
          } else if (availableFilters.subCategory.includes(categoryFilter)) {
            params.append("subCategory", categoryFilter);
          } else if (availableFilters.masterCategory.includes(categoryFilter)) {
            params.append("masterCategory", categoryFilter);
          }
        }
        
        if (genderFilter) params.append("gender", genderFilter);
        if (colorFilter) params.append("baseColour", colorFilter);
        
        if (priceRange[0] > priceRangeLimits.min) params.append("price_min", priceRange[0].toString());
        if (priceRange[1] < priceRangeLimits.max) params.append("price_max", priceRange[1].toString());
        
        // Map UI sort options to API sort parameters
        switch(sortBy) {
          case "priceAsc":
            params.append("sort_by", "price");
            params.append("sort_direction", "asc");
            break;
          case "priceDesc":
            params.append("sort_by", "price");
            params.append("sort_direction", "desc");
            break;
          case "nameAsc":
            params.append("sort_by", "productDisplayName");
            params.append("sort_direction", "asc");
            break;
          case "nameDesc":
            params.append("sort_by", "productDisplayName");
            params.append("sort_direction", "desc");
            break;
          default: // featured
            params.append("sort_by", "id");
            params.append("sort_direction", "asc");
            break;
        }
        
        const response = await fetch(`http://localhost:8000/api/products?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`);
        }

        const data = await response.json();
        
        // Get total count from header if available
        const totalCount = response.headers.get("X-Total-Count");
        if (totalCount) {
          setTotalProducts(parseInt(totalCount));
        } else {
          // If no header, estimate based on current page
          setTotalProducts(Math.max((page * productsPerPage), data.products.length + offset));
        }
        
        // Process products to ensure all have required fields
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
        console.error("Error fetching products:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [
    productsPerPage, 
    offset, 
    searchQuery, 
    sortBy, 
    categoryFilter, 
    genderFilter, 
    colorFilter, 
    priceRange,
    availableFilters,
    page,
    priceRangeLimits
  ]);

  // Get unique categories for filtering (combining all category types)
  const categories = useMemo(() => {
    const allCategories = [
      ...availableFilters.masterCategory,
      ...availableFilters.subCategory,
      ...availableFilters.articleType
    ];
    // Remove duplicates
    return ['all', ...new Set(allCategories)];
  }, [availableFilters]);

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

  // Handle gender filter change
  const handleGenderChange = (gender) => {
    setGenderFilter(gender);
    setPage(1);
  };

  // Handle color filter change
  const handleColorChange = (color) => {
    setColorFilter(color);
    setPage(1);
  };

  // Handle price range change
  const handlePriceRangeChange = (event, newValue) => {
    setPriceRange(newValue);
    setPage(1);
  };

  // Handle back to top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
  };

  // Handle mobile filters toggle
  const toggleMobileFilters = () => {
    setMobileFiltersOpen(!mobileFiltersOpen);
  };

  // Handle clear all filters
  const handleClearFilters = () => {
    setSearchQuery("");
    setSortBy("featured");
    setCategoryFilter("all");
    setGenderFilter("");
    setColorFilter("");
    setPriceRange([priceRangeLimits.min, priceRangeLimits.max]);
    setPage(1);
  };

  // Handle removing a single filter
  const handleRemoveFilter = (filter) => {
    switch (filter.type) {
      case "category":
        setCategoryFilter("all");
        break;
      case "gender":
        setGenderFilter("");
        break;
      case "color":
        setColorFilter("");
        break;
      case "price":
        setPriceRange([priceRangeLimits.min, priceRangeLimits.max]);
        break;
      case "search":
        setSearchQuery("");
        break;
      default:
        break;
    }
  };

  // Create skeleton loader for products
  const ProductSkeleton = () => (
    <Card sx={{ height: '100%', boxShadow: 'none' }}>
      <Skeleton variant="rectangular" height={450} />
      <CardContent sx={{ pt: 2, px: 0 }}>
        <Skeleton variant="text" width="60%" height={24} />
        <Skeleton variant="text" width="40%" height={20} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Skeleton variant="text" width="30%" height={32} />
          <Skeleton variant="circular" width={36} height={36} />
        </Box>
      </CardContent>
    </Card>
  );

  // Side filter panel component
  const FilterPanel = () => (
    <StickyFilters>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" letterSpacing={0.5} sx={{ fontWeight: 500 }}>
          Filters
        </Typography>
        
        {activeFilters.length > 0 && (
          <Button 
            size="small"
            startIcon={<Clear />}
            onClick={handleClearFilters}
          >
            Clear All
          </Button>
        )}
      </Box>
      
      {/* Gender Filter */}
      <Accordion defaultExpanded sx={{ mb: 2, boxShadow: 'none', '&::before': { display: 'none' } }}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography fontWeight={500}>Gender</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {['Men', 'Women', 'Boys', 'Girls', 'Unisex'].map((gender) => (
              <Button
                key={gender}
                variant="text"
                color={genderFilter === gender ? "primary" : "inherit"}
                sx={{
                  justifyContent: "flex-start",
                  fontWeight: genderFilter === gender ? 500 : 400,
                  py: 0.5,
                  backgroundColor: "transparent",
                  "&:hover": { backgroundColor: "transparent", color: "#0f4c81" },
                  borderRadius: 0,
                }}
                onClick={() => handleGenderChange(gender === genderFilter ? "" : gender)}
              >
                {gender}
              </Button>
            ))}
          </Box>
        </AccordionDetails>
      </Accordion>
      
      {/* Category Filter */}
      <Accordion defaultExpanded sx={{ mb: 2, boxShadow: 'none', '&::before': { display: 'none' } }}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography fontWeight={500}>Category</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1, maxHeight: 300, overflow: 'auto' }}>
            <Button
              variant="text"
              color={categoryFilter === "all" ? "primary" : "inherit"}
              sx={{
                justifyContent: "flex-start",
                fontWeight: categoryFilter === "all" ? 500 : 400,
                py: 0.5,
                backgroundColor: "transparent",
                "&:hover": { backgroundColor: "transparent", color: "#0f4c81" },
                borderRadius: 0,
              }}
              onClick={() => handleCategoryChange("all")}
            >
              All Categories
            </Button>
            
            {/* Group by master category */}
            {availableFilters.masterCategory.map((masterCat) => (
              <Box key={masterCat} sx={{ mb: 1 }}>
                <Button
                  variant="text"
                  color={categoryFilter === masterCat ? "primary" : "inherit"}
                  sx={{
                    justifyContent: "flex-start",
                    fontWeight: 500,
                    py: 0.5,
                    backgroundColor: "transparent",
                    "&:hover": { backgroundColor: "transparent", color: "#0f4c81" },
                    borderRadius: 0,
                  }}
                  onClick={() => handleCategoryChange(masterCat)}
                >
                  {masterCat}
                </Button>
                
                {/* Related subcategories */}
                <Box sx={{ pl: 2 }}>
                  {availableFilters.subCategory
                    .filter(subCat => subCat.includes(masterCat) || Math.random() > 0.7) // This is a simplification
                    .map((subCat) => (
                      <Button
                        key={subCat}
                        variant="text"
                        color={categoryFilter === subCat ? "primary" : "inherit"}
                        sx={{
                          justifyContent: "flex-start",
                          fontWeight: categoryFilter === subCat ? 500 : 400,
                          py: 0.5,
                          backgroundColor: "transparent",
                          "&:hover": { backgroundColor: "transparent", color: "#0f4c81" },
                          borderRadius: 0,
                          fontSize: "0.85rem"
                        }}
                        onClick={() => handleCategoryChange(subCat)}
                      >
                        {subCat}
                      </Button>
                    ))
                  }
                </Box>
              </Box>
            ))}
          </Box>
        </AccordionDetails>
      </Accordion>
      
      {/* Color Filter */}
      <Accordion defaultExpanded sx={{ mb: 2, boxShadow: 'none', '&::before': { display: 'none' } }}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography fontWeight={500}>Color</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, maxHeight: 200, overflow: 'auto' }}>
            {availableFilters.baseColour.map((color) => (
              <Chip
                key={color}
                label={color}
                clickable
                onClick={() => handleColorChange(color === colorFilter ? "" : color)}
                color={colorFilter === color ? "primary" : "default"}
                sx={{ m: 0.5 }}
              />
            ))}
          </Box>
        </AccordionDetails>
      </Accordion>
      
      {/* Price Range Filter */}
      <Accordion defaultExpanded sx={{ mb: 2, boxShadow: 'none', '&::before': { display: 'none' } }}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography fontWeight={500}>Price Range</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ px: 2 }}>
            <Slider
              getAriaLabel={() => 'Price range'}
              value={priceRange}
              onChange={handlePriceRangeChange}
              valueLabelDisplay="auto"
              min={priceRangeLimits.min}
              max={priceRangeLimits.max}
              sx={{ mt: 4 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Typography variant="body2">${priceRange[0]}</Typography>
              <Typography variant="body2">${priceRange[1]}</Typography>
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>
      
      {/* Sort By */}
      <Box sx={{ pt: 3 }}>
        <Typography variant="h6" letterSpacing={0.5} gutterBottom sx={{ fontWeight: 500 }}>
          Sort By
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
          {[
            { value: "featured", label: "Featured" },
            { value: "priceAsc", label: "Price: Low to High" },
            { value: "priceDesc", label: "Price: High to Low" },
            { value: "nameAsc", label: "Name: A to Z" },
            { value: "nameDesc", label: "Name: Z to A" }
          ].map((option) => (
            <Button
              key={option.value}
              variant="text"
              color={sortBy === option.value ? "primary" : "inherit"}
              sx={{
                justifyContent: "flex-start",
                fontWeight: sortBy === option.value ? 500 : 400,
                py: 0.5,
                backgroundColor: "transparent",
                "&:hover": { backgroundColor: "transparent", color: "#0f4c81" },
                borderRadius: 0,
              }}
              onClick={() => setSortBy(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </Box>
      </Box>
    </StickyFilters>
  );

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ bgcolor: "background.default", minHeight: "100vh", pb: 8, px: { xs: 2, md: 6, lg: 12 }, pt: { xs: 4, md: 9}}}>
        {/* Hero section */}
        <Box
          sx={{
            bgcolor: "#f5f5f5",
            color: "text.primary",
            py: { xs: 8, md: 12 },
            mb: 4,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Container maxWidth="xl">
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={6}>
                <Box>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontWeight: 400, 
                      letterSpacing: 2,
                      textTransform: "uppercase",
                      display: "block",
                      mb: 1,
                      color: "#0f4c81"
                    }}
                  >
                    Discover Your Style
                  </Typography>
                  <Typography
                    variant="h2"
                    component="h1"
                    sx={{
                      fontWeight: 400,
                      mb: 2,
                      letterSpacing: 1,
                      fontSize: { xs: "2rem", md: "2.5rem" },
                    }}
                  >
                    Premium Fashion Collection
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontWeight: 400, 
                      mb: 4,
                      maxWidth: 500,
                      lineHeight: 1.8,
                      letterSpacing: 0.3,
                    }}
                  >
                    Explore our curated collection of premium fashion items designed for style and comfort.
                  </Typography>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      size="large"
                      sx={{
                        px: 4,
                        py: 1.5,
                        letterSpacing: 1,
                      }}
                    >
                      Shop Now
                    </Button>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box>

        <Container maxWidth="xl">
          {/* Breadcrumbs navigation */}
          <Breadcrumbs sx={{ mb: 4 }}>
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

          <Grid container spacing={6}>
            {/* Sidebar with filters - visible on desktop */}
            <Grid item xs={12} md={3} lg={2} sx={{ display: { xs: "none", md: "block" } }}>
              <FilterPanel />
            </Grid>

            {/* Main content area */}
            <Grid item xs={12} md={9} lg={10}>
              {/* Search & filter bar */}
              <Box
                sx={{
                  mb: 4,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 2,
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexGrow: 1 }}>
                  <form onSubmit={handleSearchSubmit} style={{ width: '100%', maxWidth: 300 }}>
                    <SearchField
                      placeholder="Search products..."
                      variant="outlined"
                      size="small"
                      fullWidth
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </form>
                  
                  {/* Mobile filter button */}
                  <Button
                    variant="outlined"
                    startIcon={<FilterList />}
                    size="small"
                    onClick={toggleMobileFilters}
                    sx={{ display: { md: 'none' } }}
                  >
                    Filters {activeFilters.length > 0 && `(${activeFilters.length})`}
                  </Button>
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
                  
                  {/* Sort selector for mobile */}
                  <Box sx={{ display: { xs: "block", md: "none" } }}>
                    <FormControl size="small">
                      <Select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        displayEmpty
                        size="small"
                      >
                        <MenuItem value="featured">Featured</MenuItem>
                        <MenuItem value="priceAsc">Price: Low to High</MenuItem>
                        <MenuItem value="priceDesc">Price: High to Low</MenuItem>
                        <MenuItem value="nameAsc">Name: A to Z</MenuItem>
                        <MenuItem value="nameDesc">Name: Z to A</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Box>
              </Box>

              {/* Results count and active filters */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: 'column', sm: 'row' },
                  justifyContent: "space-between",
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  flexWrap: 'wrap',
                  mb: 4,
                  gap: 2
                }}
              >
                <Typography variant="body2" color="text.secondary" letterSpacing={0.3}>
                  Showing {products.length} of {totalProducts} products
                </Typography>
                
                {activeFilters.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {activeFilters.map((filter, index) => (
                      <Chip
                        key={index}
                        label={filter.label}
                        onDelete={() => handleRemoveFilter(filter)}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                    
                    <Button 
                      size="small"
                      variant="text"
                      onClick={handleClearFilters}
                      sx={{ ml: 1, textTransform: 'none' }}
                    >
                      Clear All
                    </Button>
                  </Box>
                )}
              </Box>

              {loading ? (
                // Skeleton loading state
                <Grid container spacing={4}>
                  {Array.from(new Array(productsPerPage)).map((_, index) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                      <ProductSkeleton />
                    </Grid>
                  ))}
                </Grid>
              ) : error ? (
                // Error state
                <Box
                  sx={{
                    textAlign: "center",
                    py: 8,
                    px: 3,
                    borderTop: "1px solid #e0e0e0",
                    borderBottom: "1px solid #e0e0e0",
                  }}
                >
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 400, letterSpacing: 0.5 }}>
                    Oops! Something went wrong
                  </Typography>
                  <Typography color="text.secondary" paragraph letterSpacing={0.3} sx={{ mb: 4 }}>
                    {error}
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => window.location.reload()}
                  >
                    Try Again
                  </Button>
                </Box>
              ) : products.length === 0 ? (
                // No results state
                <Box
                  sx={{
                    textAlign: "center",
                    py: 8,
                    px: 3,
                    borderTop: "1px solid #e0e0e0",
                    borderBottom: "1px solid #e0e0e0",
                  }}
                >
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 400, letterSpacing: 0.5 }}>
                    No products found
                  </Typography>
                  <Typography color="text.secondary" paragraph letterSpacing={0.3} sx={{ mb: 4 }}>
                    Try adjusting your search or filter criteria.
                  </Typography>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={handleClearFilters}
                  >
                    Clear Filters
                  </Button>
                </Box>
              ) : (
                // Product grid/list
                <>
                  <Grid container spacing={4}>
                    {products.map((product) => (
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
                                  color="error"
                                  size="small"
                                />
                              )}
                              {product.isNew && (
                                <ProductBadge
                                  label="NEW"
                                  size="small"
                                  sx={{ 
                                    top: product.onSale ? 42 : 12,
                                    backgroundColor: "#0f4c81",
                                    color: "white"
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
                                <Button
                                  variant="contained"
                                  color="primary"
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    console.log(`Added ${product.id} to cart`);
                                  }}
                                  startIcon={<ShoppingCart />}
                                >
                                  Add to Cart
                                </Button>
                                <IconButton
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleWishlist(product.id);
                                  }}
                                  sx={{
                                    bgcolor: "white",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                    "&:hover": { 
                                      bgcolor: "white",
                                    },
                                  }}
                                >
                                  {wishlist.includes(product.id) ? (
                                    <Favorite fontSize="small" color="error" />
                                  ) : (
                                    <FavoriteBorder fontSize="small" />
                                  )}
                                </IconButton>
                              </ProductActions>
                              <QuickViewButton 
                                size="small" 
                                className="quick-view-btn"
                                startIcon={<Visibility fontSize="small" />}
                                onClick={(e) => handleQuickView(e, product)}
                                variant="outlined"
                              >
                                Quick View
                              </QuickViewButton>
                            </Box>
                            <CardContent>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                component="div"
                                letterSpacing={1}
                                textTransform="uppercase"
                              >
                                {product.subCategory}
                              </Typography>
                              <Typography
                                variant="body1"
                                component="div"
                                noWrap
                                sx={{ fontWeight: 400, mb: 1, mt: 0.5, letterSpacing: 0.3 }}
                              >
                                {product.productDisplayName}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.primary"
                                sx={{ fontWeight: 400, letterSpacing: 0.3 }}
                              >
                                ${product.price.toFixed(2)}
                                {product.oldPrice && (
                                  <Typography
                                    component="span"
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ textDecoration: "line-through", ml: 1 }}
                                  >
                                    ${product.oldPrice.toFixed(2)}
                                  </Typography>
                                )}
                              </Typography>
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
                              <Box sx={{ position: "relative", width: { xs: "100%", sm: 250 } }}>
                                {product.onSale && (
                                  <ProductBadge
                                    label="SALE"
                                    color="error"
                                    size="small"
                                  />
                                )}
                                {product.isNew && (
                                  <ProductBadge
                                    label="NEW"
                                    size="small"
                                    sx={{ 
                                      top: product.onSale ? 42 : 12,
                                      backgroundColor: "#0f4c81",
                                      color: "white"
                                    }}
                                  />
                                )}
                                <ProductImage
                                  component="img"
                                  image={`http://localhost:8000${product.image_url}`}
                                  alt={product.productDisplayName}
                                  className="product-media"
                                  sx={{ 
                                    height: { xs: 200, sm: 300 },
                                    width: { xs: "100%", sm: 250 },
                                  }}
                                />
                              </Box>
                              <Box sx={{ p: 3, flex: 1 }}>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  letterSpacing={1}
                                  textTransform="uppercase"
                                >
                                  {product.subCategory}
                                </Typography>
                                <Typography
                                  variant="h6"
                                  component="div"
                                  sx={{ fontWeight: 400, mb: 1, letterSpacing: 0.5 }}
                                >
                                  {product.productDisplayName}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ mb: 3, display: { xs: "none", md: "block" }, letterSpacing: 0.3, lineHeight: 1.6 }}
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
                                    flexWrap: { xs: "wrap", md: "nowrap" },
                                    gap: 2
                                  }}
                                >
                                  <Typography
                                    variant="body1"
                                    color="text.primary"
                                    sx={{ fontWeight: 400, letterSpacing: 0.3 }}
                                  >
                                    ${product.price.toFixed(2)}
                                    {product.oldPrice && (
                                      <Typography
                                        component="span"
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{ textDecoration: "line-through", ml: 1 }}
                                      >
                                        ${product.oldPrice.toFixed(2)}
                                      </Typography>
                                    )}
                                  </Typography>
                                  <Box sx={{ display: "flex", gap: 2 }}>
                                    <Button
                                      variant="outlined"
                                      color="primary"
                                      startIcon={<Visibility />}
                                      onClick={(e) => handleQuickView(e, product)}
                                    >
                                      Quick View
                                    </Button>
                                    <Button
                                      variant="contained"
                                      color="primary"
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
                  {totalProducts > productsPerPage && (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: { xs: 'column', sm: 'row' },
                        justifyContent: "space-between",
                        alignItems: "center",
                        mt: 8,
                        mb: 2,
                        gap: 2
                      }}
                    >
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select
                          value={productsPerPage}
                          onChange={(e) => {
                            setProductsPerPage(Number(e.target.value));
                            setPage(1); // Reset to first page when changing page size
                          }}
                          displayEmpty
                          size="small"
                          variant="outlined"
                        >
                          <MenuItem value={12}>12 per page</MenuItem>
                          <MenuItem value={24}>24 per page</MenuItem>
                          <MenuItem value={36}>36 per page</MenuItem>
                          <MenuItem value={48}>48 per page</MenuItem>
                        </Select>
                      </FormControl>
                      
                      <Pagination
                        count={Math.ceil(totalProducts / productsPerPage)}
                        page={page}
                        onChange={(e, newPage) => setPage(newPage)}
                        color="primary"
                        size={isMobile ? "medium" : "large"}
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

        {/* Mobile Filters Drawer */}
        <Drawer
          anchor="left"
          open={mobileFiltersOpen}
          onClose={() => setMobileFiltersOpen(false)}
          sx={{ zIndex: (theme) => theme.zIndex.drawer + 2 }}
          PaperProps={{
            sx: { width: '80%', maxWidth: 350, pt: 0 }
          }}
        >
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6">Filters</Typography>
            <IconButton onClick={() => setMobileFiltersOpen(false)}>
              <Close />
            </IconButton>
          </Box>
          
          <Box sx={{ p: 2, height: '100%', overflow: 'auto' }}>
            <FilterPanel />
          </Box>
          
          <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between' }}>
            <Button 
              variant="outlined" 
              color="inherit" 
              onClick={handleClearFilters}
            >
              Clear All
            </Button>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => setMobileFiltersOpen(false)}
            >
              Apply Filters
            </Button>
          </Box>
        </Drawer>

        {/* Back to top button */}
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
            width: 48,
            height: 48,
            display: showBackToTop ? "flex" : "none",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s",
            "&:hover": {
              bgcolor: theme.palette.primary.main,
            },
          }}
        >
          <KeyboardArrowUp />
        </Box>

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