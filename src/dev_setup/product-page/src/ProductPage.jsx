import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Container,
  Typography,
  CardMedia,
  Grid,
  CircularProgress,
  Paper,
  Box,
  Chip,
  Card,
  CardActionArea,
  CardHeader,
  styled,
  Button,
  Divider,
  IconButton,
  Tabs,
  Tab,
  Radio,
  RadioGroup,
  FormControlLabel,
  Breadcrumbs,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip
} from '@mui/material';
import { createTheme, ThemeProvider, responsiveFontSizes } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import {
  AccessTime,
  ColorLens,
  Category,
  CalendarToday,
  FavoriteBorder,
  Share,
  ShoppingBag,
  ExpandMore,
  ChevronRight,
  LocalShipping,
  Loop,
  Loyalty,
  NavigateNext
} from '@mui/icons-material';

// Define a custom theme inspired by Westside.com
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
    MuiDivider: {
      styleOverrides: {
        root: {
          margin: '24px 0',
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          '&:before': {
            display: 'none',
          },
          '&.Mui-expanded': {
            margin: 0,
          },
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          padding: 0,
          minHeight: 'auto',
          '&.Mui-expanded': {
            minHeight: 'auto',
          },
        },
        content: {
          margin: '12px 0',
          '&.Mui-expanded': {
            margin: '12px 0',
          },
        },
      },
    },
    MuiAccordionDetails: {
      styleOverrides: {
        root: {
          padding: '0 0 16px 0',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          padding: '12px 16px',
          '&.Mui-selected': {
            color: '#000000',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: '#000000',
          height: 2,
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
const ProductImage = styled(CardMedia)(({ theme }) => ({
  height: '600px',
  width: '100%',
  objectFit: 'contain',
  transition: 'transform 0.5s ease-in-out',
  '&:hover': {
    transform: 'scale(1.02)',
  },
}));

const DetailItemContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

const DetailIconContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '& svg': {
    color: theme.palette.text.secondary,
    fontSize: '20px',
  },
}));

const AddToCartButton = styled(Button)(({ theme }) => ({
  width: '100%',
  height: '48px',
}));

const ProductInfoContainer = styled(Box)(({ theme }) => ({
  paddingLeft: theme.spacing(4),
  [theme.breakpoints.down('md')]: {
    paddingLeft: 0,
    marginTop: theme.spacing(4),
  },
}));

const SizeButton = styled(Button)(({ theme }) => ({
  minWidth: '48px',
  height: '48px',
  margin: theme.spacing(0.5),
  borderRadius: 0,
  border: '1px solid #e0e0e0',
  '&.selected': {
    backgroundColor: '#000000',
    color: '#ffffff',
  },
  '&:hover': {
    backgroundColor: '#f5f5f5',
  },
}));

const ColorCircle = styled(Box)(({ bgColor, selected }) => ({
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  backgroundColor: bgColor || '#cccccc',
  margin: '4px',
  cursor: 'pointer',
  border: selected ? '2px solid #000000' : '1px solid #e0e0e0',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'scale(1.1)',
  },
}));

const DetailItem = ({ icon, title, value }) => {
  return (
    <DetailItemContainer>
      <DetailIconContainer>
        {icon}
      </DetailIconContainer>
      <div>
        <Typography variant="caption" color="textSecondary">{title}</Typography>
        <Typography variant="body2" fontWeight="500">{value}</Typography>
      </div>
    </DetailItemContainer>
  );
};

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [recommendations, setRecommendations] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);

  // Available sizes (you can fetch these from the API in a real application)
  const sizes = ["XS", "S", "M", "L", "XL"];
  
  // Available colors (you can fetch these from the API in a real application)
  const colors = [
    { name: "Black", hex: "#000000" },
    { name: "White", hex: "#ffffff" },
    { name: "Red", hex: "#e53935" },
    { name: "Blue", hex: "#1e88e5" },
  ];
  
  const [selectedColor, setSelectedColor] = useState(colors[0]);

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/product/${id}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`);
        }
        const data = await response.json();
        setProduct(data.product);
        setRecommendations(data.recommendations.recommendations || {});
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
  };

  const handleColorSelect = (color) => {
    setSelectedColor(color);
  };

  const handleQuantityChange = (event) => {
    setQuantity(parseInt(event.target.value, 10));
  };

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Container style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Container>
      </ThemeProvider>
    );
  }

  if (error) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Container>
          <Typography color="error">Error: {error}</Typography>
        </Container>
      </ThemeProvider>
    );
  }

  if (!product) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Container>
          <Typography>Product not found.</Typography>
        </Container>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Breadcrumbs navigation */}
        <Breadcrumbs 
          separator={<NavigateNext fontSize="small" />} 
          aria-label="breadcrumb"
          sx={{ mb: 4 }}
        >
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Typography variant="body2">Home</Typography>
          </Link>
          <Link to={`/category/${product.masterCategory}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <Typography variant="body2">{product.masterCategory}</Typography>
          </Link>
          <Link to={`/category/${product.subCategory}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <Typography variant="body2">{product.subCategory}</Typography>
          </Link>
          <Typography variant="body2" color="text.primary">{product.productDisplayName}</Typography>
        </Breadcrumbs>

        <Grid container spacing={6}>
          {/* Product Image Section */}
          <Grid item xs={12} md={6}>
            <Card elevation={0} sx={{ overflow: 'hidden', border: 'none' }}>
              <ProductImage
                component="img"
                image={`http://localhost:8000${product.image_url}`}
                alt={product.productDisplayName}
              />
            </Card>
          </Grid>

          {/* Product Details Section */}
          <Grid item xs={12} md={6}>
            <ProductInfoContainer>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="h1" sx={{ mb: 1 }}>
                    {product.productDisplayName}
                  </Typography>
                  <Typography variant="subtitle1" color="secondary" gutterBottom>
                    ${Math.floor(Math.random() * 100) + 50}.00
                  </Typography>
                </Box>
                <Box>
                  <Tooltip title="Add to Wishlist">
                    <IconButton aria-label="add to wishlist">
                      <FavoriteBorder />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Share">
                    <IconButton aria-label="share">
                      <Share />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              <Divider />

              {/* Color Selection */}
              <Box sx={{ my: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  COLOR: <strong>{selectedColor.name}</strong>
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                  {colors.map((color) => (
                    <ColorCircle
                      key={color.name}
                      bgColor={color.hex}
                      selected={selectedColor.name === color.name}
                      onClick={() => handleColorSelect(color)}
                    />
                  ))}
                </Box>
              </Box>

              {/* Size Selection */}
              <Box sx={{ my: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  SIZE: <strong>{selectedSize || "Select Size"}</strong>
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                  {sizes.map((size) => (
                    <SizeButton
                      key={size}
                      variant="outlined"
                      className={selectedSize === size ? "selected" : ""}
                      onClick={() => handleSizeSelect(size)}
                    >
                      {size}
                    </SizeButton>
                  ))}
                </Box>
                <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                  <Link to="/size-guide" style={{ color: 'inherit' }}>
                    Size Guide
                  </Link>
                </Typography>
              </Box>

              {/* Quantity */}
              <Box sx={{ my: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  QUANTITY
                </Typography>
                <RadioGroup
                  row
                  value={quantity}
                  onChange={handleQuantityChange}
                >
                  {[1, 2, 3, 4, 5].map((value) => (
                    <FormControlLabel
                      key={value}
                      value={value}
                      control={<Radio size="small" />}
                      label={value}
                    />
                  ))}
                </RadioGroup>
              </Box>

              {/* Add to Cart Button */}
              <Box sx={{ my: 3 }}>
                <AddToCartButton 
                  variant="contained" 
                  color="primary"
                  startIcon={<ShoppingBag />}
                >
                  Add to Bag
                </AddToCartButton>
              </Box>

              {/* Product Details Accordion */}
              <Box sx={{ mt: 4 }}>
                <Accordion defaultExpanded>
                  <AccordionSummary
                    expandIcon={<ExpandMore />}
                    aria-controls="product-details-content"
                    id="product-details-header"
                  >
                    <Typography variant="subtitle1">Product Details</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <DetailItem
                          icon={<ColorLens />}
                          title="COLOR"
                          value={product.baseColour || 'N/A'}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <DetailItem
                          icon={<Category />}
                          title="CATEGORY"
                          value={product.subCategory || 'N/A'}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <DetailItem
                          icon={<CalendarToday />}
                          title="SEASON"
                          value={product.season || 'N/A'}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <DetailItem
                          icon={<AccessTime />}
                          title="USAGE"
                          value={product.usage || 'N/A'}
                        />
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>

                <Accordion>
                  <AccordionSummary
                    expandIcon={<ExpandMore />}
                    aria-controls="shipping-returns-content"
                    id="shipping-returns-header"
                  >
                    <Typography variant="subtitle1">Shipping & Returns</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <DetailItem
                          icon={<LocalShipping />}
                          title="SHIPPING"
                          value="Free shipping on orders over $50"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <DetailItem
                          icon={<Loop />}
                          title="RETURNS"
                          value="Free returns within 30 days"
                        />
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </Box>
            </ProductInfoContainer>
          </Grid>
        </Grid>

        {/* Complete the Look Section */}
        {Object.keys(recommendations).length > 0 && (
          <Box sx={{ mt: 8, mb: 4 }}>
            <Typography variant="h2" sx={{ mb: 3, textAlign: 'center' }}>
              Complete Your Look
            </Typography>
            
            {/* Recommendation Tabs */}
            <Tabs 
              value={selectedTab} 
              onChange={handleTabChange} 
              centered
              sx={{ mb: 4 }}
            >
              {Object.keys(recommendations).map((category, index) => (
                <Tab 
                  key={category} 
                  label={category.toUpperCase()} 
                  id={`category-tab-${index}`}
                />
              ))}
            </Tabs>
            
            {/* Recommendation Products */}
            {Object.entries(recommendations).map(([category, items], index) => (
              <Box 
                key={category} 
                role="tabpanel"
                hidden={selectedTab !== index}
                id={`tabpanel-${index}`}
              >
                {selectedTab === index && (
                  <Grid container spacing={3}>
                    {items.map((item) => (
                      <Grid item xs={6} sm={4} md={3} key={item.id}>
                        <Card sx={{ height: '100%' }}>
                          <CardActionArea component={Link} to={`/product/${item.id}`}>
                            <CardMedia
                              component="img"
                              image={`http://localhost:8000${item.image_url}`}
                              alt={item.productDisplayName}
                              sx={{ height: 320, objectFit: 'cover' }}
                            />
                            <Box sx={{ p: 2 }}>
                              <Typography variant="body2" fontWeight="600" gutterBottom noWrap>
                                {item.productDisplayName}
                              </Typography>
                              <Typography variant="subtitle2" color="secondary">
                                ${Math.floor(Math.random() * 80) + 30}.00
                              </Typography>
                            </Box>
                          </CardActionArea>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
            ))}
          </Box>
        )}
      </Container>
    </ThemeProvider>
  );
};

export default ProductPage;