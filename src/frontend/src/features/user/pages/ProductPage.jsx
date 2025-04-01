// import React, { useState, useEffect } from 'react';
// import { useParams, Link } from 'react-router-dom';
// import {
//   Container,
//   Typography,
//   CardMedia,
//   Grid,
//   CircularProgress,
//   Paper,
//   Box,
//   Chip,
//   Card,
//   CardActionArea,
//   CardHeader,
//   styled,
//   Button,
//   Divider,
//   IconButton,
//   Tabs,
//   Tab,
//   Radio,
//   RadioGroup,
//   FormControlLabel,
//   Breadcrumbs,
//   Accordion,
//   AccordionSummary,
//   AccordionDetails,
//   Tooltip
// } from '@mui/material';
// import { createTheme, ThemeProvider, responsiveFontSizes } from '@mui/material/styles';
// import CssBaseline from '@mui/material/CssBaseline';
// import {
//   AccessTime,
//   ColorLens,
//   Category,
//   CalendarToday,
//   FavoriteBorder,
//   Share,
//   ShoppingBag,
//   ExpandMore,
//   ChevronRight,
//   LocalShipping,
//   Loop,
//   Loyalty,
//   NavigateNext
// } from '@mui/icons-material';

// // Define a custom theme inspired by Westside.com
// let theme = createTheme({
//   palette: {
//     primary: {
//       main: '#000000',  // Black for primary
//       light: '#333333',
//     },
//     secondary: {
//       main: '#b7846f',  // Muted terracotta accent
//       light: '#d9b8ac',
//     },
//     background: {
//       default: '#ffffff',  // Clean white background
//       paper: '#ffffff',    // White for cards and paper
//     },
//     text: {
//       primary: '#292929', // Slightly softer black for text
//       secondary: '#6e6e6e', // Muted gray for secondary text
//     }
//   },
//   typography: {
//     fontFamily: "'Nunito Sans', 'Inter', sans-serif",
//     h1: {
//       fontSize: '2rem',
//       fontWeight: 600,
//       letterSpacing: '0.5px',
//       textTransform: 'uppercase',
//       color: '#292929',
//     },
//     h2: {
//       fontSize: '1.75rem',
//       fontWeight: 600,
//       letterSpacing: '0.5px',
//     },
//     h6: {
//       fontSize: '1.25rem',
//       fontWeight: 600,
//       letterSpacing: '0.3px',
//       textTransform: 'uppercase',
//       color: '#292929',
//     },
//     body1: {
//       color: '#292929',
//       fontSize: '1rem',
//       letterSpacing: '0.2px',
//     },
//     subtitle1: {
//       fontSize: '1.1rem',
//       fontWeight: 600,
//       color: '#292929',
//     },
//     subtitle2: {
//       color: '#6e6e6e',
//       fontSize: '0.95rem',
//       letterSpacing: '0.1px',
//     },
//     caption: {
//       fontSize: '0.85rem',
//       color: '#6e6e6e',
//       letterSpacing: '0.5px',
//     },
//     body2: {
//       fontSize: '0.95rem',
//       fontWeight: 500,
//       color: '#292929',
//     },
//     button: {
//       textTransform: 'none',
//       fontWeight: 600,
//     }
//   },
//   components: {
//     MuiButton: {
//       styleOverrides: {
//         root: {
//           borderRadius: 0,
//           padding: '12px 24px',
//           fontWeight: 600,
//           textTransform: 'uppercase',
//           letterSpacing: '1px',
//           boxShadow: 'none',
//           '&:hover': {
//             boxShadow: 'none',
//           },
//         },
//         containedPrimary: {
//           backgroundColor: '#000000',
//           color: '#ffffff',
//           '&:hover': {
//             backgroundColor: '#333333',
//           },
//         },
//         outlinedPrimary: {
//           borderColor: '#000000',
//           borderWidth: '1px',
//           '&:hover': {
//             borderWidth: '1px',
//             backgroundColor: 'rgba(0,0,0,0.04)',
//           },
//         },
//       },
//     },
//     MuiCard: {
//       styleOverrides: {
//         root: {
//           borderRadius: 0,
//           boxShadow: 'none',
//           transition: 'transform 0.3s, opacity 0.3s',
//           '&:hover': {
//             transform: 'translateY(-4px)',
//             opacity: 0.9,
//           },
//         },
//       },
//     },
//     MuiChip: {
//       styleOverrides: {
//         root: {
//           borderRadius: 0,
//           padding: '4px 8px',
//           height: 'auto',
//           backgroundColor: '#f5f5f5',
//           color: '#292929',
//           fontWeight: 500,
//           letterSpacing: '0.5px',
//         },
//         colorPrimary: {
//           backgroundColor: '#000000',
//           color: '#ffffff',
//         },
//         colorSecondary: {
//           backgroundColor: '#b7846f',
//           color: '#ffffff',
//         },
//       },
//     },
//     MuiDivider: {
//       styleOverrides: {
//         root: {
//           margin: '24px 0',
//         },
//       },
//     },
//     MuiAccordion: {
//       styleOverrides: {
//         root: {
//           boxShadow: 'none',
//           '&:before': {
//             display: 'none',
//           },
//           '&.Mui-expanded': {
//             margin: 0,
//           },
//         },
//       },
//     },
//     MuiAccordionSummary: {
//       styleOverrides: {
//         root: {
//           padding: 0,
//           minHeight: 'auto',
//           '&.Mui-expanded': {
//             minHeight: 'auto',
//           },
//         },
//         content: {
//           margin: '12px 0',
//           '&.Mui-expanded': {
//             margin: '12px 0',
//           },
//         },
//       },
//     },
//     MuiAccordionDetails: {
//       styleOverrides: {
//         root: {
//           padding: '0 0 16px 0',
//         },
//       },
//     },
//     MuiTab: {
//       styleOverrides: {
//         root: {
//           textTransform: 'none',
//           fontWeight: 600,
//           padding: '12px 16px',
//           '&.Mui-selected': {
//             color: '#000000',
//           },
//         },
//       },
//     },
//     MuiTabs: {
//       styleOverrides: {
//         indicator: {
//           backgroundColor: '#000000',
//           height: 2,
//         },
//       },
//     },
//   },
//   shape: {
//     borderRadius: 0,
//   },
// });

// // Make the theme responsive
// theme = responsiveFontSizes(theme);

// // Styled components
// const ProductImage = styled(CardMedia)(({ theme }) => ({
//   height: '600px',
//   width: '100%',
//   objectFit: 'contain',
//   transition: 'transform 0.5s ease-in-out',
//   '&:hover': {
//     transform: 'scale(1.02)',
//   },
// }));

// const DetailItemContainer = styled(Box)(({ theme }) => ({
//   display: 'flex',
//   alignItems: 'center',
//   gap: theme.spacing(2),
//   marginBottom: theme.spacing(2),
// }));

// const DetailIconContainer = styled(Box)(({ theme }) => ({
//   display: 'flex',
//   alignItems: 'center',
//   justifyContent: 'center',
//   '& svg': {
//     color: theme.palette.text.secondary,
//     fontSize: '20px',
//   },
// }));

// const AddToCartButton = styled(Button)(({ theme }) => ({
//   width: '100%',
//   height: '48px',
// }));

// const ProductInfoContainer = styled(Box)(({ theme }) => ({
//   paddingLeft: theme.spacing(4),
//   [theme.breakpoints.down('md')]: {
//     paddingLeft: 0,
//     marginTop: theme.spacing(4),
//   },
// }));

// const SizeButton = styled(Button)(({ theme }) => ({
//   minWidth: '48px',
//   height: '48px',
//   margin: theme.spacing(0.5),
//   borderRadius: 0,
//   border: '1px solid #e0e0e0',
//   '&.selected': {
//     backgroundColor: '#000000',
//     color: '#ffffff',
//   },
//   '&:hover': {
//     backgroundColor: '#f5f5f5',
//   },
// }));

// const ColorCircle = styled(Box)(({ bgcolor, selected }) => ({
//   width: '32px',
//   height: '32px',
//   borderRadius: '50%',
//   backgroundColor: bgcolor || '#cccccc',
//   margin: '4px',
//   cursor: 'pointer',
//   border: selected ? '2px solid #000000' : '1px solid #e0e0e0',
//   transition: 'transform 0.2s',
//   '&:hover': {
//     transform: 'scale(1.1)',
//   },
// }));

// const DetailItem = ({ icon, title, value }) => {
//   return (
//     <DetailItemContainer>
//       <DetailIconContainer>
//         {icon}
//       </DetailIconContainer>
//       <div>
//         <Typography variant="caption" color="textSecondary">{title}</Typography>
//         <Typography variant="body2" fontWeight="500">{value}</Typography>
//       </div>
//     </DetailItemContainer>
//   );
// };

// const ProductPage = () => {
//   const { id } = useParams();
//   const [product, setProduct] = useState(null);
//   const [recommendations, setRecommendations] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [selectedTab, setSelectedTab] = useState(0);
//   const [selectedSize, setSelectedSize] = useState("");
//   const [quantity, setQuantity] = useState(1);
//   console.log("came to product page");
//   console.log(id);

//   // Available sizes (you can fetch these from the API in a real application)
//   const sizes = ["XS", "S", "M", "L", "XL"];

//   // Available colors (you can fetch these from the API in a real application)
//   const colors = [
//     { name: "Black", hex: "#000000" },
//     { name: "White", hex: "#ffffff" },
//     { name: "Red", hex: "#e53935" },
//     { name: "Blue", hex: "#1e88e5" },
//   ];

//   const [selectedColor, setSelectedColor] = useState(colors[0]);

//   useEffect(() => {
//     const fetchProductDetails = async () => {
//       setLoading(true);
//       try {
//         const response = await fetch(`http://localhost:8000/api/product/${id}`);
//         if (!response.ok) {
//           throw new Error(`Failed to fetch: ${response.status}`);
//         }
//         const data = await response.json();
//         setProduct(data.product);
//         setRecommendations(data.recommendations.recommendations || {});
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     }; 

//     fetchProductDetails();
//   }, [id]);

//   const handleTabChange = (event, newValue) => {
//     setSelectedTab(newValue);
//   };

//   const handleSizeSelect = (size) => {
//     setSelectedSize(size);
//   };

//   const handleColorSelect = (color) => {
//     setSelectedColor(color);
//   };

//   const handleQuantityChange = (event) => {
//     setQuantity(parseInt(event.target.value, 10));
//   };

//   if (loading) {
//     return (
//       <ThemeProvider theme={theme}>
//         <CssBaseline />
//         <Container style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
//           <CircularProgress />
//         </Container>
//       </ThemeProvider>
//     );
//   }

//   if (error) {
//     return (
//       <ThemeProvider theme={theme}>
//         <CssBaseline />
//         <Container>
//           <Typography color="error">Error: {error}</Typography>
//         </Container>
//       </ThemeProvider>
//     );
//   }

//   if (!product) {
//     return (
//       <ThemeProvider theme={theme}>
//         <CssBaseline />
//         <Container>
//           <Typography>Product not found.</Typography>
//         </Container>
//       </ThemeProvider>
//     );
//   }

//   return (
//     <ThemeProvider theme={theme}>
//       <CssBaseline />
//       <Container maxWidth="xl" sx={{ py: 4 }}>
//         {/* Breadcrumbs navigation */}
//         <Breadcrumbs
//           separator={<NavigateNext fontSize="small" />}
//           aria-label="breadcrumb"
//           sx={{ mb: 4 }}
//         >
//           <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
//             <Typography variant="body2">Home</Typography>
//           </Link>
//           <Link to={`/category/${product.masterCategory}`} style={{ textDecoration: 'none', color: 'inherit' }}>
//             <Typography variant="body2">{product.masterCategory}</Typography>
//           </Link>
//           <Link to={`/category/${product.subCategory}`} style={{ textDecoration: 'none', color: 'inherit' }}>
//             <Typography variant="body2">{product.subCategory}</Typography>
//           </Link>
//           <Typography variant="body2" color="text.primary">{product.productDisplayName}</Typography>
//         </Breadcrumbs>

//         <Grid container spacing={6}>
//           {/* Product Image Section */}
//           <Grid item xs={12} md={6}>
//             <Card elevation={0} sx={{ overflow: 'hidden', border: 'none' }}>
//               <ProductImage
//                 component="img"
//                 image={`http://localhost:8000${product.image_url}`}
//                 alt={product.productDisplayName}
//               />
//             </Card>
//           </Grid>

//           {/* Product Details Section */}
//           <Grid item xs={12} md={6}>
//             <ProductInfoContainer>
//               <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
//                 <Box>
//                   <Typography variant="h1" sx={{ mb: 1 }}>
//                     {product.productDisplayName}
//                   </Typography>
//                   <Typography variant="subtitle1" color="secondary" gutterBottom>
//                     ${Math.floor(Math.random() * 100) + 50}.00
//                   </Typography>
//                 </Box>
//                 <Box>
//                   <Tooltip title="Add to Wishlist">
//                     <IconButton aria-label="add to wishlist">
//                       <FavoriteBorder />
//                     </IconButton>
//                   </Tooltip>
//                   <Tooltip title="Share">
//                     <IconButton aria-label="share">
//                       <Share />
//                     </IconButton>
//                   </Tooltip>
//                 </Box>
//               </Box>

//               <Divider />

//               {/* Color Selection */}
//               <Box sx={{ my: 3 }}>
//                 <Typography variant="subtitle2" sx={{ mb: 1 }}>
//                   COLOR: <strong>{selectedColor.name}</strong>
//                 </Typography>
//                 <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
//                   {colors.map((color) => (
//                     <ColorCircle
//                       key={color.name}
//                       bgcolor={color.hex}
//                       selected={selectedColor.name === color.name}
//                       onClick={() => handleColorSelect(color)}
//                     />
//                   ))}
//                 </Box>
//               </Box>

//               {/* Size Selection */}
//               <Box sx={{ my: 3 }}>
//                 <Typography variant="subtitle2" sx={{ mb: 1 }}>
//                   SIZE: <strong>{selectedSize || "Select Size"}</strong>
//                 </Typography>
//                 <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
//                   {sizes.map((size) => (
//                     <SizeButton
//                       key={size}
//                       variant="outlined"
//                       className={selectedSize === size ? "selected" : ""}
//                       onClick={() => handleSizeSelect(size)}
//                     >
//                       {size}
//                     </SizeButton>
//                   ))}
//                 </Box>
//                 <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
//                   <Link to="/size-guide" style={{ color: 'inherit' }}>
//                     Size Guide
//                   </Link>
//                 </Typography>
//               </Box>

//               {/* Quantity */}
//               <Box sx={{ my: 3 }}>
//                 <Typography variant="subtitle2" sx={{ mb: 1 }}>
//                   QUANTITY
//                 </Typography>
//                 <RadioGroup
//                   row
//                   value={quantity}
//                   onChange={handleQuantityChange}
//                 >
//                   {[1, 2, 3, 4, 5].map((value) => (
//                     <FormControlLabel
//                       key={value}
//                       value={value}
//                       control={<Radio size="small" />}
//                       label={value}
//                     />
//                   ))}
//                 </RadioGroup>
//               </Box>

//               {/* Add to Cart Button */}
//               <Box sx={{ my: 3 }}>
//                 <AddToCartButton
//                   variant="contained"
//                   color="primary"
//                   startIcon={<ShoppingBag />}
//                 >
//                   Add to Bag
//                 </AddToCartButton>
//               </Box>

//               {/* Product Details Accordion */}
//               <Box sx={{ mt: 4 }}>
//                 <Accordion defaultExpanded>
//                   <AccordionSummary
//                     expandIcon={<ExpandMore />}
//                     aria-controls="product-details-content"
//                     id="product-details-header"
//                   >
//                     <Typography variant="subtitle1">Product Details</Typography>
//                   </AccordionSummary>
//                   <AccordionDetails>
//                     <Grid container spacing={2}>
//                       <Grid item xs={12} sm={6}>
//                         <DetailItem
//                           icon={<ColorLens />}
//                           title="COLOR"
//                           value={product.baseColour || 'N/A'}
//                         />
//                       </Grid>
//                       <Grid item xs={12} sm={6}>
//                         <DetailItem
//                           icon={<Category />}
//                           title="CATEGORY"
//                           value={product.subCategory || 'N/A'}
//                         />
//                       </Grid>
//                       <Grid item xs={12} sm={6}>
//                         <DetailItem
//                           icon={<CalendarToday />}
//                           title="SEASON"
//                           value={product.season || 'N/A'}
//                         />
//                       </Grid>
//                       <Grid item xs={12} sm={6}>
//                         <DetailItem
//                           icon={<AccessTime />}
//                           title="USAGE"
//                           value={product.usage || 'N/A'}
//                         />
//                       </Grid>
//                     </Grid>
//                   </AccordionDetails>
//                 </Accordion>

//                 <Accordion>
//                   <AccordionSummary
//                     expandIcon={<ExpandMore />}
//                     aria-controls="shipping-returns-content"
//                     id="shipping-returns-header"
//                   >
//                     <Typography variant="subtitle1">Shipping & Returns</Typography>
//                   </AccordionSummary>
//                   <AccordionDetails>
//                     <Grid container spacing={2}>
//                       <Grid item xs={12}>
//                         <DetailItem
//                           icon={<LocalShipping />}
//                           title="SHIPPING"
//                           value="Free shipping on orders over $50"
//                         />
//                       </Grid>
//                       <Grid item xs={12}>
//                         <DetailItem
//                           icon={<Loop />}
//                           title="RETURNS"
//                           value="Free returns within 30 days"
//                         />
//                       </Grid>
//                     </Grid>
//                   </AccordionDetails>
//                 </Accordion>
//               </Box>
//             </ProductInfoContainer>
//           </Grid>
//         </Grid>

//         {/* Complete the Look Section */}
//         {Object.keys(recommendations).length > 0 && (
//           <Box sx={{ mt: 8, mb: 4 }}>
//             <Typography variant="h2" sx={{ mb: 3, textAlign: 'center' }}>
//               Complete Your Look
//             </Typography>

//             {/* Recommendation Tabs */}
//             <Tabs
//               value={selectedTab}
//               onChange={handleTabChange}
//               centered
//               sx={{ mb: 4 }}
//             >
//               {Object.keys(recommendations).map((category, index) => (
//                 <Tab
//                   key={category}
//                   label={category.toUpperCase()}
//                   id={`category-tab-${index}`}
//                 />
//               ))}
//             </Tabs>

//             {/* Recommendation Products */}
//             {Object.entries(recommendations).map(([category, items], index) => (
//               <Box
//                 key={category}
//                 role="tabpanel"
//                 hidden={selectedTab !== index}
//                 id={`tabpanel-${index}`}
//               >
//                 {selectedTab === index && (
//                   <Grid container spacing={3}>
//                     {items.map((item) => (
//                       <Grid item xs={6} sm={4} md={3} key={item.id}>
//                         <Card sx={{ height: '100%' }}>
//                           <CardActionArea component={Link} to={`/product/${item.id}`}>
//                             <CardMedia
//                               component="img"
//                               image={`http://localhost:8000${item.image_url}`}
//                               alt={item.productDisplayName}
//                               sx={{ height: 320, objectFit: 'cover' }}
//                             />
//                             <Box sx={{ p: 2 }}>
//                               <Typography variant="body2" fontWeight="600" gutterBottom noWrap>
//                                 {item.productDisplayName}
//                               </Typography>
//                               <Typography variant="subtitle2" color="secondary">
//                                 ${Math.floor(Math.random() * 80) + 30}.00
//                               </Typography>
//                             </Box>
//                           </CardActionArea>
//                         </Card>
//                       </Grid>
//                     ))}
//                   </Grid>
//                 )}
//               </Box>
//             ))}
//           </Box>
//         )}
//       </Container>
//     </ThemeProvider>
//   );
// };

// export default ProductPage;

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
  Tooltip,
  Zoom,
  Fade,
  Collapse,
  Skeleton,
  Rating,
  Badge,
  Snackbar,
  Alert,
  Grow
} from '@mui/material';
import { createTheme, ThemeProvider, responsiveFontSizes } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import {
  AccessTime,
  ColorLens,
  Category,
  CalendarToday,
  FavoriteBorder,
  Favorite,
  Share,
  ShoppingBag,
  ExpandMore,
  ChevronRight,
  LocalShipping,
  Loop,
  Loyalty,
  NavigateNext,
  Star,
  StarBorder,
  AddShoppingCart,
  CheckCircle,
  ZoomIn,
  ZoomOut,
  ArrowForward,
  ArrowBack
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
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: 'none',
            transform: 'translateY(-2px)',
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
          transition: 'all 0.3s ease',
          '&.Mui-selected': {
            color: '#000000',
          },
          '&:hover': {
            backgroundColor: 'rgba(0,0,0,0.02)',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: '#b7846f',
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

// Enhanced styled components
const ProductImageContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  height: '600px',
  backgroundColor: '#f9f9f9',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const ProductImage = styled('img')(({ theme, zoomed }) => ({
  maxWidth: '100%',
  maxHeight: '100%',
  objectFit: 'contain',
  transition: 'transform 0.5s ease-in-out',
  transform: zoomed ? 'scale(1.5)' : 'scale(1)',
  cursor: zoomed ? 'zoom-out' : 'zoom-in',
}));

const ThumbnailContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  marginTop: theme.spacing(2),
}));

const Thumbnail = styled(Box)(({ theme, active }) => ({
  width: '60px',
  height: '60px',
  border: active ? '2px solid #b7846f' : '1px solid #e0e0e0',
  padding: '2px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
  },
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
}));

const ImageNavButton = styled(IconButton)(({ theme, direction }) => ({
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  backgroundColor: 'rgba(255,255,255,0.8)',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  left: direction === 'prev' ? '10px' : 'auto',
  right: direction === 'next' ? '10px' : 'auto',
  zIndex: 2,
  '&:hover': {
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
}));

const ZoomButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  bottom: '10px',
  right: '10px',
  backgroundColor: 'rgba(255,255,255,0.8)',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  zIndex: 2,
  '&:hover': {
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
}));

const DetailItemContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2),
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'translateX(5px)',
  },
}));

const DetailIconContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '& svg': {
    color: theme.palette.secondary.main,
    fontSize: '20px',
  },
}));

const AddToCartButton = styled(Button)(({ theme }) => ({
  width: '100%',
  height: '48px',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  background: 'linear-gradient(45deg, #000000 30%, #333333 90%)',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: -100,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
    transition: '0.5s',
  },
  '&:hover::after': {
    left: 100,
  },
}));

const FavoriteButton = styled(IconButton)(({ theme, isFavorite }) => ({
  backgroundColor: isFavorite ? 'rgba(244, 67, 54, 0.1)' : 'transparent',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: isFavorite ? 'rgba(244, 67, 54, 0.2)' : 'rgba(0, 0, 0, 0.04)',
    transform: 'scale(1.1)',
  },
}));

const ProductInfoContainer = styled(Box)(({ theme }) => ({
  paddingLeft: theme.spacing(4),
  [theme.breakpoints.down('md')]: {
    paddingLeft: 0,
    marginTop: theme.spacing(4),
  },
}));

const SizeButton = styled(Button)(({ theme, selected }) => ({
  minWidth: '48px',
  height: '48px',
  margin: theme.spacing(0.5),
  borderRadius: 0,
  border: '1px solid #e0e0e0',
  transition: 'all 0.3s ease',
  backgroundColor: selected ? '#000000' : 'transparent',
  color: selected ? '#ffffff' : '#292929',
  '&:hover': {
    backgroundColor: selected ? '#333333' : '#f5f5f5',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
  },
}));

const ColorCircle = styled(Box)(({ bgcolor, selected }) => ({
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  backgroundColor: bgcolor || '#cccccc',
  margin: '4px',
  cursor: 'pointer',
  border: selected ? '2px solid #b7846f' : '1px solid #e0e0e0',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.1)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  },
}));

const AccordionRoot = styled(Accordion)(({ theme }) => ({
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: 'rgba(0,0,0,0.01)',
  },
  '&::before': {
    backgroundColor: '#f5f5f5',
  },
  '&.Mui-expanded': {
    boxShadow: 'none',
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  position: 'relative',
  display: 'inline-block',
  marginBottom: theme.spacing(4),
  textAlign: 'center',
  '&:after': {
    content: '""',
    position: 'absolute',
    bottom: '-12px',
    left: '50%',
    width: '40px',
    height: '2px',
    backgroundColor: theme.palette.secondary.main,
    transform: 'translateX(-50%)',
  },
}));

const RecommendationCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
  border: '1px solid transparent',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-8px)',
    borderColor: '#f0f0f0',
    boxShadow: '0 15px 35px rgba(0,0,0,0.05), 0 5px 15px rgba(0,0,0,0.05)',
  },
}));

const RecommendationMedia = styled(CardMedia)(({ theme }) => ({
  height: 320,
  backgroundSize: 'cover',
  transition: 'transform 0.5s ease',
  '&:hover': {
    transform: 'scale(1.03)',
  },
}));

const QuickInfo = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(3),
  marginBottom: theme.spacing(3),
  padding: theme.spacing(2),
  backgroundColor: '#f9f9f9',
}));

const QuickInfoItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
}));

const BreadcrumbLink = styled(Link)(({ theme }) => ({
  textDecoration: 'none',
  color: 'inherit',
  display: 'flex',
  alignItems: 'center',
  transition: 'color 0.2s ease',
  '&:hover': {
    color: theme.palette.secondary.main,
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
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);
  const [zoomed, setZoomed] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // Generate additional product images (in a real app, these would come from the API)
  const generateAdditionalImages = (mainImageUrl) => {
    if (!mainImageUrl) return [mainImageUrl];
    
    // For demo purposes only - in a real app these would be actual different images
    return [
      mainImageUrl,
      mainImageUrl,
      mainImageUrl,
    ];
  };

  // Available sizes (you can fetch these from the API in a real application)
  const sizes = ["XS", "S", "M", "L", "XL"];

  // Available colors (you can fetch these from the API in a real application)
  const colors = [
    { name: "Black", hex: "#000000" },
    { name: "White", hex: "#ffffff" },
    { name: "Terracotta", hex: "#b7846f" },
    { name: "Blue", hex: "#1e88e5" },
  ];

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:8000/api/product/${id}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`);
        }
        const data = await response.json();
        setProduct(data.product);
        setRecommendations(data.recommendations.recommendations || {});
        // Set the first color as default
        setSelectedColor(colors[0]);
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

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    setSnackbarMessage(isFavorite 
      ? "Removed from wishlist" 
      : "Added to wishlist");
    setShowSnackbar(true);
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      setSnackbarMessage("Please select a size");
      setShowSnackbar(true);
      return;
    }
    setSnackbarMessage(`Added ${quantity} item(s) to your bag`);
    setShowSnackbar(true);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setShowSnackbar(false);
  };

  const handleToggleZoom = () => {
    setZoomed(!zoomed);
  };

  const handlePrevImage = () => {
    if (!product) return;
    const images = generateAdditionalImages(product.image_url);
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const handleNextImage = () => {
    if (!product) return;
    const images = generateAdditionalImages(product.image_url);
    setCurrentImageIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleThumbnailClick = (index) => {
    setCurrentImageIndex(index);
    setZoomed(false);
  };

  // Calculate random price (in a real app, this would come from the API)
  const generatePrice = () => {
    const basePrice = Math.floor(Math.random() * 100) + 50;
    return basePrice.toFixed(2);
  };

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Container maxWidth="xl" sx={{ py: 6 }}>
          <Grid container spacing={6}>
            <Grid item xs={12} md={6}>
              <Skeleton variant="rectangular" height={600} animation="wave" />
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                {[1, 2, 3].map((item) => (
                  <Skeleton key={item} variant="rectangular" width={60} height={60} animation="wave" />
                ))}
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Skeleton variant="text" height={60} width="80%" animation="wave" />
              <Skeleton variant="text" height={30} width="40%" animation="wave" />
              <Skeleton variant="rectangular" height={1} width="100%" sx={{ my: 3 }} animation="wave" />
              
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                <Skeleton width={100} animation="wave" />
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                {[1, 2, 3, 4].map((item) => (
                  <Skeleton key={item} variant="circular" width={32} height={32} animation="wave" />
                ))}
              </Box>
              
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                <Skeleton width={100} animation="wave" />
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                {[1, 2, 3, 4, 5].map((item) => (
                  <Skeleton key={item} variant="rectangular" width={48} height={48} animation="wave" />
                ))}
              </Box>
              
              <Skeleton variant="rectangular" height={48} width="100%" sx={{ mt: 4 }} animation="wave" />
            </Grid>
          </Grid>
        </Container>
      </ThemeProvider>
    );
  }

  if (error) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Container maxWidth="xl" sx={{ py: 6 }}>
          <Alert severity="error" sx={{ borderRadius: 0 }}>
            Error: {error}
          </Alert>
        </Container>
      </ThemeProvider>
    );
  }

  if (!product) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Container maxWidth="xl" sx={{ py: 6 }}>
          <Alert severity="info" sx={{ borderRadius: 0 }}>
            Product not found.
          </Alert>
        </Container>
      </ThemeProvider>
    );
  }

  // Generate product images
  const productImages = generateAdditionalImages(product.image_url);
  const currentImage = productImages[currentImageIndex];
  const price = generatePrice();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xl" sx={{ py: 6 }}>
        {/* Breadcrumbs navigation */}
        <Fade in={true} timeout={800}>
          <Breadcrumbs
            separator={<NavigateNext fontSize="small" />}
            aria-label="breadcrumb"
            sx={{ mb: 4 }}
          >
            <BreadcrumbLink to="/">
              <Typography variant="body2">Home</Typography>
            </BreadcrumbLink>
            <BreadcrumbLink to={`/category/${product.masterCategory}`}>
              <Typography variant="body2">{product.masterCategory}</Typography>
            </BreadcrumbLink>
            <BreadcrumbLink to={`/category/${product.subCategory}`}>
              <Typography variant="body2">{product.subCategory}</Typography>
            </BreadcrumbLink>
            <Typography variant="body2" color="text.primary">{product.productDisplayName}</Typography>
          </Breadcrumbs>
        </Fade>

        <Grid container spacing={6}>
          {/* Product Image Section */}
          <Grid item xs={12} md={6}>
            <Fade in={true} timeout={800}>
              <Box>
                <ProductImageContainer>
                  <ImageNavButton 
                    direction="prev" 
                    onClick={handlePrevImage}
                  >
                    <ArrowBack fontSize="small" />
                  </ImageNavButton>
                  
                  <ProductImage
                    src={`http://localhost:8000${currentImage}`}
                    alt={product.productDisplayName}
                    zoomed={zoomed}
                    onClick={handleToggleZoom}
                  />
                  
                  <ImageNavButton 
                    direction="next" 
                    onClick={handleNextImage}
                  >
                    <ArrowForward fontSize="small" />
                  </ImageNavButton>
                  
                  <ZoomButton onClick={handleToggleZoom}>
                    {zoomed ? <ZoomOut /> : <ZoomIn />}
                  </ZoomButton>
                </ProductImageContainer>
                
                <ThumbnailContainer>
                  {productImages.map((img, index) => (
                    <Thumbnail 
                      key={index} 
                      active={index === currentImageIndex}
                      onClick={() => handleThumbnailClick(index)}
                    >
                      <img 
                        src={`http://localhost:8000${img}`} 
                        alt={`${product.productDisplayName} thumbnail ${index + 1}`} 
                      />
                    </Thumbnail>
                  ))}
                </ThumbnailContainer>
              </Box>
            </Fade>
          </Grid>

          {/* Product Details Section */}
          <Grid item xs={12} md={6}>
            <Fade in={true} timeout={1000}>
              <ProductInfoContainer>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h1" sx={{ mb: 1 }}>
                      {product.productDisplayName}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Rating value={4.5} precision={0.5} readOnly size="small" />
                      <Typography variant="body2" color="text.secondary">
                        (24 Reviews)
                      </Typography>
                    </Box>
                    <Typography variant="subtitle1" color="secondary" gutterBottom>
                      ${price}
                    </Typography>
                  </Box>
                  <Box>
                    <Tooltip title={isFavorite ? "Remove from Wishlist" : "Add to Wishlist"}>
                      <FavoriteButton 
                        aria-label="add to wishlist"
                        onClick={handleToggleFavorite}
                        isFavorite={isFavorite}
                      >
                        {isFavorite ? <Favorite color="error" /> : <FavoriteBorder />}
                      </FavoriteButton>
                    </Tooltip>
                    <Tooltip title="Share">
                      <IconButton aria-label="share">
                        <Share />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                <Divider />

                {/* Quick Info */}
                <QuickInfo>
                  <QuickInfoItem>
                    <LocalShipping sx={{ fontSize: 20, color: 'text.secondary', mb: 0.5 }} />
                    <Typography variant="caption">Free Shipping</Typography>
                  </QuickInfoItem>
                  <QuickInfoItem>
                    <Loop sx={{ fontSize: 20, color: 'text.secondary', mb: 0.5 }} />
                    <Typography variant="caption">30 Day Returns</Typography>
                  </QuickInfoItem>
                  <QuickInfoItem>
                    <Loyalty sx={{ fontSize: 20, color: 'text.secondary', mb: 0.5 }} />
                    <Typography variant="caption">Loyalty Points</Typography>
                  </QuickInfoItem>
                </QuickInfo>

                {/* Color Selection */}
                {/* <Box sx={{ my: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                    COLOR: <Typography component="span" sx={{ ml: 1, fontWeight: 'bold' }}>{selectedColor?.name}</Typography>
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                    {colors.map((color) => (
                      <Tooltip key={color.name} title={color.name}>
                        <ColorCircle
                          bgcolor={color.hex}
                          selected={selectedColor?.name === color.name}
                          onClick={() => handleColorSelect(color)}
                        />
                      </Tooltip>
                    ))}
                  </Box>
                </Box> */}

                {/* Size Selection */}
                <Box sx={{ my: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                    SIZE: <Typography component="span" sx={{ ml: 1, fontWeight: 'bold' }}>{selectedSize || "Select Size"}</Typography>
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                    {sizes.map((size) => (
                      <SizeButton
                        key={size}
                        variant="outlined"
                        selected={selectedSize === size}
                        onClick={() => handleSizeSelect(size)}
                      >
                        {size}
                      </SizeButton>
                    ))}
                  </Box>
                  <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                    <Link to="/size-guide" style={{ color: 'inherit', textDecoration: 'none', borderBottom: '1px solid #e0e0e0' }}>
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
                        control={
                          <Radio 
                            size="small" 
                            sx={{
                              '&.Mui-checked': {
                                color: theme.palette.secondary.main,
                              },
                            }}
                          />
                        }
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
                    startIcon={<AddShoppingCart />}
                    onClick={handleAddToCart}
                    disabled={!selectedSize}
                  >
                    Add to Bag
                  </AddToCartButton>
                  {!selectedSize && (
                    <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
                      Please select a size
                    </Typography>
                  )}
                </Box>

                {/* Product Details Accordion */}
                <Box sx={{ mt: 4 }}>
                  <AccordionRoot defaultExpanded>
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
                  </AccordionRoot>

                  <AccordionRoot>
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
                  </AccordionRoot>
                </Box>
              </ProductInfoContainer>
            </Fade>
          </Grid>
        </Grid>

        {/* Complete the Look Section */}
        {Object.keys(recommendations).length > 0 && (
          <Box sx={{ mt: 8, mb: 4, pb: 8, px: 26, pt: 9}}>
            <Fade in={true} timeout={1200}>
              <div>
                <SectionTitle variant="h2" sx={{ width: '100%', mb: 6, textAlign: 'center' }}>
                  Complete Your Look
                </SectionTitle>

                {/* Recommendation Tabs */}
                <Tabs
                  value={selectedTab}
                  onChange={handleTabChange}
                  centered
                  sx={{ mb: 4 }}
                  TabIndicatorProps={{
                    style: {
                      transition: 'all 0.3s ease',
                    }
                  }}
                >
                  {Object.keys(recommendations).map((category, index) => (
                    <Tab
                      key={category}
                      label={category.toUpperCase()}
                      id={`category-tab-${index}`}
                    />
                  ))}
                </Tabs>
              </div>
            </Fade>

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
                    {items.map((item, itemIndex) => (
                      <Grid item xs={6} sm={4} md={3} key={item.id}>
                        <Grow
                          in={true}
                          style={{ transformOrigin: '0 0 0' }}
                          timeout={500 + itemIndex * 100}
                        >
                          <RecommendationCard>
                            <CardActionArea component={Link} to={`/product/${item.id}`}>
                              <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                                <RecommendationMedia
                                  component="img"
                                  image={`http://localhost:8000${item.image_url}`}
                                  alt={item.productDisplayName}
                                />
                                <IconButton
                                  sx={{
                                    position: 'absolute',
                                    top: 10,
                                    right: 10,
                                    backgroundColor: 'rgba(255,255,255,0.8)',
                                    '&:hover': {
                                      backgroundColor: 'rgba(255,255,255,0.9)',
                                    },
                                  }}
                                >
                                  <FavoriteBorder fontSize="small" />
                                </IconButton>
                              </Box>
                              <Box sx={{ p: 2 }}>
                                <Typography variant="body2" fontWeight="600" gutterBottom>
                                  {item.productDisplayName}
                                </Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                                  <Typography variant="subtitle2" color="secondary">
                                    ${Math.floor(Math.random() * 80) + 30}.00
                                  </Typography>
                                  <Chip 
                                    label="View" 
                                    size="small" 
                                    color="primary"
                                    sx={{ 
                                      minWidth: "60px",
                                      transition: "all 0.2s ease",
                                      "&:hover": {
                                        transform: "translateY(-2px)",
                                        boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
                                      }
                                    }}
                                  />
                                </Box>
                              </Box>
                            </CardActionArea>
                          </RecommendationCard>
                        </Grow>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
            ))}
          </Box>
        )}
        
        {/* Snackbar for notifications */}
        <Snackbar
          open={showSnackbar}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity="success" 
            sx={{ borderRadius: 0, alignItems: 'center' }}
            icon={<CheckCircle />}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
};

export default ProductPage;