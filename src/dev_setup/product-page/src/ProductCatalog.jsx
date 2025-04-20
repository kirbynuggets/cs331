import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardActionArea,
  CardMedia,
  Box,
  Chip,
  Breadcrumbs,
  FormControl,
  Select,
  MenuItem,
  IconButton,
  InputAdornment,
  TextField,
  Button,
  CircularProgress,
  Pagination,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Slider,
  Divider,
  useMediaQuery,
  styled,
  Stack
} from '@mui/material';
import { createTheme, ThemeProvider, responsiveFontSizes } from '@mui/material/styles';
import {
  NavigateNext,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Close as CloseIcon,
  FavoriteBorder,
  Favorite,
  ShoppingBag,
  Sort as SortIcon,
  ViewList,
  ViewModule
} from '@mui/icons-material';
import CssBaseline from '@mui/material/CssBaseline';

// Define the same consistent theme
let theme = createTheme({
  palette: {
    primary: {
      main: '#000000',  // Black for primary
      light: '#333333',
    },
    secondary: {
      main: '#b7846f',  // Muted terracotta accent
      light: '#d9b8ac',
    },
    background: {
      default: '#ffffff',  // Clean white background
      paper: '#ffffff',    // White for cards and paper
    },
    text: {
      primary: '#292929', // Slightly softer black for text
      secondary: '#6e6e6e', // Muted gray for secondary text
    }
  },
  typography: {
    fontFamily: "'Nunito Sans', 'Inter', sans-serif",
    h1: {
      fontSize: '2rem',
      fontWeight: 600,
      letterSpacing: '0.5px',
      textTransform: 'uppercase',
      color: '#292929',
    },
    h2: {
      fontSize: '1.75rem',
      fontWeight: 600,
      letterSpacing: '0.5px',
    },
    h6: {
      fontSize: '1.25rem',
      fontWeight: 600,
      letterSpacing: '0.3px',
      textTransform: 'uppercase',
      color: '#292929',
    },
    body1: {
      color: '#292929',
      fontSize: '1rem',
      letterSpacing: '0.2px',
    },
    subtitle1: {
      fontSize: '1.1rem',
      fontWeight: 600,
      color: '#292929',
    },
    subtitle2: {
      color: '#6e6e6e',
      fontSize: '0.95rem',
      letterSpacing: '0.1px',
    },
    caption: {
      fontSize: '0.85rem',
      color: '#6e6e6e',
      letterSpacing: '0.5px',
    },
    body2: {
      fontSize: '0.95rem',
      fontWeight: 500,
      color: '#292929',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          padding: '12px 24px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '1px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        containedPrimary: {
          backgroundColor: '#000000',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#333333',
          },
        },
        outlinedPrimary: {
          borderColor: '#000000',
          borderWidth: '1px',
          '&:hover': {
            borderWidth: '1px',
            backgroundColor: 'rgba(0,0,0,0.04)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          boxShadow: 'none',
          transition: 'transform 0.3s, opacity 0.3s',
          '&:hover': {
            transform: 'translateY(-4px)',
            opacity: 0.9,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          padding: '4px 8px',
          height: 'auto',
          backgroundColor: '#f5f5f5',
          color: '#292929',
          fontWeight: 500,
          letterSpacing: '0.5px',
        },
        colorPrimary: {
          backgroundColor: '#000000',
          color: '#ffffff',
        },
        colorSecondary: {
          backgroundColor: '#b7846f',
          color: '#ffffff',
        },
      },
    },
    MuiPagination: {
      styleOverrides: {
        ul: {
          justifyContent: 'center',
        },
      },
    },
  },
  shape: {
    borderRadius: 0,
  },
});

// Make the theme responsive
theme = responsiveFontSizes(theme);

// Styled components
const ProductCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
}));

const ProductMedia = styled(CardMedia)(({ theme }) => ({
  height: 400,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
}));

const ProductInfo = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
}));

const ProductPrice = styled(Typography)(({ theme }) => ({
  color: theme.palette.secondary.main,
  fontWeight: 600,
}));

const WishlistButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  right: theme.spacing(1),
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
}));

const FilterButton = styled(Button)(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    display: 'none',
  },
}));

const PageHeader = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  [theme.breakpoints.up('md')]: {
    marginBottom: theme.spacing(6),
  },
}));

const FiltersContainer = styled(Box)(({ theme }) => ({
  width: 280,
  padding: theme.spacing(2),
  [theme.breakpoints.down('md')]: {
    display: 'none',
  },
}));

const SortContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(3),
  padding: theme.spacing(2, 0),
  borderBottom: '1px solid #f0f0f0',
}));

const ViewToggle = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
}));

const ListProductCard = styled(Card)(({ theme }) => ({
  height: '100%',
  boxShadow: 'none',
  display: 'flex',
  borderRadius: 0,
  transition: 'transform 0.3s, opacity 0.3s',
  '&:hover': {
    transform: 'translateY(-4px)',
    opacity: 0.9,
  },
}));

const ListProductMedia = styled(CardMedia)(({ theme }) => ({
  width: 200,
  height: 250,
  [theme.breakpoints.up('md')]: {
    width: 250,
    height: 300,
  },
}));

const ListProductInfo = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
}));

const SearchContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  width: '100%',
}));

const NoResultsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(6),
  textAlign: 'center',
}));

// Helper function to generate a price based on category and product name
const generatePrice = (item) => {
  // If price exists, use it
  if (item.price) return item.price;
  
  // Base price ranges by category
  const priceRanges = {
    tops: { min: 25, max: 65 },
    shirts: { min: 30, max: 70 },
    tshirts: { min: 20, max: 40 },
    bottoms: { min: 35, max: 80 },
    jeans: { min: 45, max: 85 },
    pants: { min: 40, max: 75 },
    shorts: { min: 25, max: 45 },
    dresses: { min: 45, max: 95 },
    accessories: { min: 15, max: 60 },
    shoes: { min: 50, max: 120 },
    outerwear: { min: 70, max: 150 },
    default: { min: 30, max: 70 }
  };
  
  // Determine category for pricing
  let category = 'default';
  
  // Try to match by category name
  const catLower = (item.masterCategory || '').toLowerCase();
  const subCatLower = (item.subCategory || '').toLowerCase();
  
  // Check if we have a range for this category or subcategory
  if (priceRanges[catLower]) {
    category = catLower;
  } else if (priceRanges[subCatLower]) {
    category = subCatLower;
  }
  
  // Generate a pseudo-random but consistent price for the same item
  const nameValue = item.productDisplayName ? 
    item.productDisplayName.split('').reduce((a, b) => a + b.charCodeAt(0), 0) : 
    item.id || Math.floor(Math.random() * 1000);
  
  const range = priceRanges[category].max - priceRanges[category].min;
  const offset = (nameValue % range);
  const basePrice = priceRanges[category].min + offset;
  
  // Return a price with 2 decimal places between min and max
  return parseFloat(basePrice.toFixed(2));
};

const ProductCatalog = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [wishlist, setWishlist] = useState({});
  const [filters, setFilters] = useState({
    categories: [],
    priceRange: [0, 200],
    colors: [],
    seasons: [],
  });
  const [availableFilters, setAvailableFilters] = useState({
    categories: [],
    colors: [],
    seasons: [],
  });
  
  const itemsPerPage = 12;
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // In a real app, you would include filters, sort, and pagination in the API call
        const response = await fetch(`/api/products?page=${currentPage}&limit=${itemsPerPage}&sort=${sortBy}&search=${searchQuery}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Process products to ensure all have required fields
        const processedProducts = data.products.map(product => ({
          ...product,
          price: generatePrice(product),
          image_url: product.image_url || '/images/placeholder.jpg',
          productDisplayName: product.productDisplayName || 'Untitled Product',
          subCategory: product.subCategory || 'Uncategorized',
          baseColour: product.baseColour || 'N/A',
          season: product.season || 'All Season',
        }));
        
        setProducts(processedProducts);
        setTotalPages(Math.ceil(data.totalCount / itemsPerPage));
        
        // Extract available filter options
        if (data.filters) {
          setAvailableFilters(data.filters);
        } else {
          // If the API doesn't provide filter options, extract them from products
          const categories = [...new Set(processedProducts.map(p => p.subCategory))];
          const colors = [...new Set(processedProducts.map(p => p.baseColour))];
          const seasons = [...new Set(processedProducts.map(p => p.season))];
          
          setAvailableFilters({
            categories,
            colors,
            seasons,
          });
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [currentPage, sortBy, searchQuery]);
  
  const toggleFilterDrawer = (open) => () => {
    setFilterDrawerOpen(open);
  };
  
  const handleSortChange = (event) => {
    setSortBy(event.target.value);
    setCurrentPage(1); // Reset to first page when changing sort
  };
  
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };
  
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    // Scroll to top when changing page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };
  
  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
  };
  
  const toggleWishlist = (productId) => {
    setWishlist(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };
  
  const handleFilterChange = (type, value) => {
    if (type === 'priceRange') {
      setFilters(prev => ({
        ...prev,
        priceRange: value
      }));
    } else {
      // For checkboxes (categories, colors, seasons)
      setFilters(prev => {
        const currentValues = [...prev[type]];
        const valueIndex = currentValues.indexOf(value);
        
        if (valueIndex === -1) {
          // Add the value
          return {
            ...prev,
            [type]: [...currentValues, value]
          };
        } else {
          // Remove the value
          currentValues.splice(valueIndex, 1);
          return {
            ...prev,
            [type]: currentValues
          };
        }
      });
    }
    
    // Reset to first page when filtering
    setCurrentPage(1);
  };
  
  // Apply filters to products
  const filteredProducts = products.filter(product => {
    // Filter by price range
    const price = product.price || 0;
    if (price < filters.priceRange[0] || price > filters.priceRange[1]) {
      return false;
    }
    
    // Filter by categories
    if (filters.categories.length > 0 && !filters.categories.includes(product.subCategory)) {
      return false;
    }
    
    // Filter by colors
    if (filters.colors.length > 0 && !filters.colors.includes(product.baseColour)) {
      return false;
    }
    
    // Filter by seasons
    if (filters.seasons.length > 0 && !filters.seasons.includes(product.season)) {
      return false;
    }
    
    return true;
  });
  
  // Filter panel content
  const filterContent = (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Filters</Typography>
        {isSmallScreen && (
          <IconButton onClick={toggleFilterDrawer(false)}>
            <CloseIcon />
          </IconButton>
        )}
      </Box>
      
      <Divider sx={{ mb: 3 }} />
      
      {/* Price Range Filter */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" gutterBottom>Price Range</Typography>
        <Slider
          value={filters.priceRange}
          onChange={(e, newValue) => handleFilterChange('priceRange', newValue)}
          valueLabelDisplay="auto"
          min={0}
          max={200}
          step={10}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2">${filters.priceRange[0]}</Typography>
          <Typography variant="body2">${filters.priceRange[1]}</Typography>
        </Box>
      </Box>
      
      {/* Category Filter */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" gutterBottom>Category</Typography>
        <FormGroup>
          {availableFilters.categories.map((category) => (
            <FormControlLabel
              key={category}
              control={
                <Checkbox
                  checked={filters.categories.includes(category)}
                  onChange={() => handleFilterChange('categories', category)}
                  size="small"
                />
              }
              label={<Typography variant="body2">{category}</Typography>}
            />
          ))}
        </FormGroup>
      </Box>
      
      {/* Color Filter */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" gutterBottom>Color</Typography>
        <FormGroup>
          {availableFilters.colors.map((color) => (
            <FormControlLabel
              key={color}
              control={
                <Checkbox
                  checked={filters.colors.includes(color)}
                  onChange={() => handleFilterChange('colors', color)}
                  size="small"
                />
              }
              label={<Typography variant="body2">{color}</Typography>}
            />
          ))}
        </FormGroup>
      </Box>
      
      {/* Season Filter */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" gutterBottom>Season</Typography>
        <FormGroup>
          {availableFilters.seasons.map((season) => (
            <FormControlLabel
              key={season}
              control={
                <Checkbox
                  checked={filters.seasons.includes(season)}
                  onChange={() => handleFilterChange('seasons', season)}
                  size="small"
                />
              }
              label={<Typography variant="body2">{season}</Typography>}
            />
          ))}
        </FormGroup>
      </Box>
      
      {/* Clear Filters Button */}
      <Button
        variant="outlined"
        fullWidth
        onClick={() => setFilters({
          categories: [],
          priceRange: [0, 200],
          colors: [],
          seasons: [],
        })}
      >
        Clear All Filters
      </Button>
    </>
  );
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xl" sx={{ py: 6 }}>
        {/* Breadcrumbs navigation */}
        <Breadcrumbs 
          separator={<NavigateNext fontSize="small" />} 
          aria-label="breadcrumb"
          sx={{ mb: 4 }}
        >
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Typography variant="body2">Home</Typography>
          </Link>
          <Typography variant="body2" color="text.primary">All Products</Typography>
        </Breadcrumbs>
        
        <PageHeader>
          <Typography variant="h1" sx={{ mb: 1, textAlign: 'center' }}>
            Our Collection
          </Typography>
          <Typography variant="subtitle2" sx={{ mb: 4, textAlign: 'center' }}>
            Discover our latest fashion pieces curated for your style
          </Typography>
          
          {/* Search Bar */}
          <SearchContainer>
            <form onSubmit={handleSearchSubmit}>
              <TextField
                fullWidth
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search products..."
                variant="outlined"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton type="submit" edge="end">
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </form>
          </SearchContainer>
          
          {/* Mobile Filter Button */}
          <FilterButton
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={toggleFilterDrawer(true)}
            fullWidth
          >
            Filter Products
          </FilterButton>
        </PageHeader>
        
        <Grid container spacing={4}>
          {/* Filter Sidebar (desktop) */}
          <Grid item md={3} lg={3}>
            <FiltersContainer>
              {filterContent}
            </FiltersContainer>
          </Grid>
          
          {/* Products Grid */}
          <Grid item xs={12} md={9} lg={9}>
            {/* Sort and View Controls */}
            <SortContainer>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <SortIcon sx={{ mr: 1 }} />
                <Typography variant="subtitle2" sx={{ mr: 2 }}>Sort By:</Typography>
                <FormControl variant="standard" size="small" sx={{ minWidth: 120 }}>
                  <Select
                    value={sortBy}
                    onChange={handleSortChange}
                    displayEmpty
                  >
                    <MenuItem value="newest">Newest</MenuItem>
                    <MenuItem value="price_low">Price: Low to High</MenuItem>
                    <MenuItem value="price_high">Price: High to Low</MenuItem>
                    <MenuItem value="name_asc">Name: A to Z</MenuItem>
                    <MenuItem value="name_desc">Name: Z to A</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              
              <ViewToggle>
                <Typography variant="body2" sx={{ mr: 1 }}>View:</Typography>
                <IconButton 
                  color={viewMode === 'grid' ? 'primary' : 'default'}
                  onClick={() => handleViewModeChange('grid')}
                >
                  <ViewModule />
                </IconButton>
                <IconButton 
                  color={viewMode === 'list' ? 'primary' : 'default'}
                  onClick={() => handleViewModeChange('list')}
                >
                  <ViewList />
                </IconButton>
              </ViewToggle>
            </SortContainer>
            
            {loading ? (
              // Loading state
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              // Error state
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography color="error" gutterBottom>Error: {error}</Typography>
                <Button variant="contained" onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </Box>
            ) : filteredProducts.length === 0 ? (
              // No results state
              <NoResultsContainer>
                <Typography variant="h6" gutterBottom>No products found</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Try adjusting your search or filter criteria
                </Typography>
                <Button 
                  variant="outlined" 
                  onClick={() => {
                    setSearchQuery('');
                    setFilters({
                      categories: [],
                      priceRange: [0, 200],
                      colors: [],
                      seasons: [],
                    });
                  }}
                >
                  Clear Filters
                </Button>
              </NoResultsContainer>
            ) : (
              // Product grid or list
              <>
                <Grid container spacing={3}>
                  {filteredProducts.map((product) => (
                    viewMode === 'grid' ? (
                      // Grid View
                      <Grid item xs={6} sm={6} md={4} key={product.id}>
                        <ProductCard>
                          <CardActionArea component={Link} to={`/product/${product.id}`}>
                            <ProductMedia
                              component="img"
                              image={`http://localhost:8000${product.image_url}`}
                              alt={product.productDisplayName}
                            />
                          </CardActionArea>
                          
                          <WishlistButton 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleWishlist(product.id);
                            }}
                            aria-label="add to wishlist"
                          >
                            {wishlist[product.id] ? <Favorite color="secondary" /> : <FavoriteBorder />}
                          </WishlistButton>
                          
                          <ProductInfo>
                            <Link 
                              to={`/product/${product.id}`} 
                              style={{ textDecoration: 'none', color: 'inherit' }}
                            >
                              <Typography variant="subtitle1" noWrap gutterBottom>
                                {product.productDisplayName}
                              </Typography>
                              
                              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                                {product.subCategory}
                              </Typography>
                              
                              <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                                <Chip 
                                  label={product.baseColour} 
                                  size="small" 
                                  sx={{ height: 20 }}
                                />
                                <Chip 
                                  label={product.season} 
                                  size="small" 
                                  sx={{ height: 20 }}
                                />
                              </Stack>
                            </Link>
                            
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                              <ProductPrice variant="subtitle2">
                                ${product.price?.toFixed(2)}
                              </ProductPrice>
                              
                              <Chip
                                label="View"
                                size="small"
                                color="primary"
                                sx={{ minWidth: '60px' }}
                                component={Link}
                                to={`/product/${product.id}`}
                                clickable
                              />
                            </Box>
                          </ProductInfo>
                        </ProductCard>
                      </Grid>
                    ) : (
                      // List View
                      <Grid item xs={12} key={product.id}>
                        <ListProductCard>
                          <CardActionArea 
                            component={Link} 
                            to={`/product/${product.id}`}
                            sx={{ display: 'flex', width: '100%', height: '100%', alignItems: 'stretch' }}
                          >
                            <ListProductMedia
                              component="img"
                              image={`http://localhost:8000${product.image_url}`}
                              alt={product.productDisplayName}
                            />
                            
                            <ListProductInfo>
                              <Box>
                                <Typography variant="h6" gutterBottom>
                                  {product.productDisplayName}
                                </Typography>
                                
                                <Typography variant="body2" color="text.secondary" paragraph>
                                  {product.subCategory}
                                </Typography>
                                
                                <Grid container spacing={2} sx={{ mb: 2 }}>
                                  <Grid item xs={6} sm={4}>
                                    <Typography variant="caption" color="text.secondary">
                                      Color
                                    </Typography>
                                    <Typography variant="body2">
                                      {product.baseColour}
                                    </Typography>
                                  </Grid>
                                  
                                  <Grid item xs={6} sm={4}>
                                    <Typography variant="caption" color="text.secondary">
                                      Season
                                    </Typography>
                                    <Typography variant="body2">
                                      {product.season}
                                    </Typography>
                                  </Grid>
                                  
                                  <Grid item xs={6} sm={4}>
                                    <Typography variant="caption" color="text.secondary">
                                      Usage
                                    </Typography>
                                    <Typography variant="body2">
                                      {product.usage || 'Casual'}
                                    </Typography>
                                  </Grid>
                                </Grid>
                              </Box>
                              
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <ProductPrice variant="h6">
                                  ${product.price?.toFixed(2)}
                                </ProductPrice>
                                
                                <Box>
                                  <IconButton 
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      toggleWishlist(product.id);
                                    }}
                                    aria-label="add to wishlist"
                                    sx={{ mr: 1 }}
                                  >
                                    {wishlist[product.id] ? <Favorite color="secondary" /> : <FavoriteBorder />}
                                  </IconButton>
                                  
                                  <Button
                                    variant="outlined"
                                    startIcon={<ShoppingBag />}
                                    component={Link}
                                    to={`/product/${product.id}`}
                                  >
                                    View Details
                                  </Button>
                                </Box>
                              </Box>
                            </ListProductInfo>
                          </CardActionArea>
                        </ListProductCard>
                      </Grid>
                    )
                  ))}
                </Grid>
                
                {/* Pagination */}
                <Box sx={{ mt: 6, mb: 2, display: 'flex', justifyContent: 'center' }}>
                  <Pagination 
                    count={totalPages} 
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                    size={isSmallScreen ? "small" : "medium"}
                    showFirstButton
                    showLastButton
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary" align="center">
                  Showing {filteredProducts.length} of {totalPages * itemsPerPage} products
                </Typography>
              </>
            )}
          </Grid>
        </Grid>
        
        {/* Mobile Filter Drawer */}
        <Drawer
          anchor="left"
          open={filterDrawerOpen}
          onClose={toggleFilterDrawer(false)}
        >
          <Box sx={{ width: 280, p: 2 }}>
            {filterContent}
          </Box>
        </Drawer>
      </Container>
    </ThemeProvider>
  );
};

export default ProductCatalog;