import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  Box,
  InputBase,
  TextField,
  FormControl,
  InputAdornment,
  Fab,
  Dialog,
  DialogContent,
  DialogTitle,
  Slide,
  Chip,
  Paper,
  Avatar,
  useMediaQuery,
  useTheme, // Import useTheme hook
  Rating, // Keep Rating import if you might add it back based on different API data later
  Tooltip,
  CircularProgress, // Import CircularProgress for loading state
} from "@mui/material";
import {
  ShoppingCart,
  Favorite,
  Person,
  Search,
  Menu as MenuIcon,
  Close,
  Chat,
  Send,
  ShoppingBag,
  ChevronRight,
  FavoriteBorder,
  Instagram,
  Facebook,
  Twitter,
  Pinterest,
  AddShoppingCart,
  ArrowRightAlt,
  ExpandMore,
  Notifications,
  KeyboardArrowLeft,
  KeyboardArrowRight,
} from "@mui/icons-material";
import { styled, alpha } from "@mui/material/styles";
import { useNavigate, Link as RouterLink } from "react-router-dom"; // Use RouterLink for internal navigation
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchCart,
  selectCartItems,
  addItemToCart,
} from "../../cart/cartSlice.js";
import { 
  selectWishlistItems 
} from "../../wishlist/wishlistSlice.js";
import NavBar from "../../../components/layout/NavBar.jsx";

// Hero banner carousel items
const carouselItems = [
  {
    id: 1,
    image: "/assets/carousel-images/image1.webp",
    title: "NEW ARRIVALS",
    subtitle: "Spring Collection 2025",
    description: "Discover the latest trends for the upcoming season",
    action: "Shop Now",
  },
  {
    id: 2,
    image: "/assets/carousel-images/image2.webp",
    title: "SUMMER ESSENTIALS",
    subtitle: "Hot Season Deals",
    description: "Everything you need for the perfect summer wardrobe",
    action: "Discover More",
  },
  {
    id: 3,
    image: "/assets/carousel-images/image3.webp",
    title: "EXCLUSIVE ACCESSORIES",
    subtitle: "Complete Your Look",
    description: "Elevate your outfit with our curated accessories",
    action: "Browse Collection",
  },
  {
    id: 4,
    image: "/assets/carousel-images/image4.webp",
    title: "DESIGNER COLLECTION",
    subtitle: "Luxury Fashion Pieces",
    description: "Premium designer pieces for the fashion connoisseur",
    action: "View Collection",
  },
  {
    id: 5,
    image: "/assets/carousel-images/image5.webp",
    title: "SEASONAL SALE",
    subtitle: "Up to 50% Off Selected Items",
    description: "Limited time offers on our most popular styles",
    action: "Shop Sale",
  },
];

// Categories based on API 'gender' field
const categories = [
  { id: "Men", name: "Men", icon: "👔" },
  { id: "Women", name: "Women", icon: "👗" },
  // Add other categories if needed, based on API data (e.g., masterCategory)
];

// --- Styled Components for Theme Awareness ---

const SearchBar = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius * 3,
  backgroundColor: alpha(theme.palette.background.default, 0.1),
  "&:hover": {
    backgroundColor: alpha(theme.palette.background.default, 0.2),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(3),
    width: "auto",
  },
  border: `1px solid ${theme.palette.divider}`,
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: theme.palette.text.secondary,
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: theme.palette.text.primary,
  width: "100%",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "30ch",
    },
  },
}));

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const CategoryButton = styled(Button)(({ theme, selected }) => ({
  borderRadius: theme.shape.borderRadius * 3,
  padding: "8px 16px",
  marginRight: theme.spacing(1),
  textTransform: "none",
  fontWeight: 500,
  color: selected
    ? theme.palette.primary.contrastText
    : theme.palette.text.primary,
  backgroundColor: selected
    ? theme.palette.primary.main
    : alpha(theme.palette.action.hover, 0.05),
  "&:hover": {
    backgroundColor: selected
      ? alpha(theme.palette.primary.main, 0.9)
      : alpha(theme.palette.action.hover, 0.1),
  },
  transition: "all 0.3s ease",
}));

const ProductCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "all 0.3s ease",
  border: "none",
  borderRadius: theme.shape.borderRadius * 2,
  overflow: "hidden",
  backgroundColor: theme.palette.background.paper,
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: theme.shadows[4],
    "& .product-actions": {
      opacity: 1,
      transform: "translateY(0)",
    },
    "& .hover-content": {
      opacity: 1,
    },
  },
}));

const QuickViewButton = styled(Button)(({ theme }) => ({
  position: "absolute",
  bottom: 16,
  left: "50%",
  transform: "translateX(-50%) translateY(20px)",
  opacity: 0,
  transition: "all 0.3s ease",
  textTransform: "none",
  backgroundColor: alpha(theme.palette.background.paper, 0.9),
  color: theme.palette.text.primary,
  "&:hover": {
    backgroundColor: theme.palette.background.paper,
  },
  borderRadius: theme.shape.borderRadius * 3,
  zIndex: 2,
}));

const ProductImageOverlay = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background:
    "linear-gradient(to bottom, rgba(0,0,0,0) 60%, rgba(0,0,0,0.4) 100%)",
  opacity: 0,
  transition: "all 0.3s ease",
}));

// --- Image Recommender Chat Component ---
const ImageRecommenderChat = ({ open, onClose, username = "Guest" }) => {
  const [query, setQuery] = useState("");
  const [chatProducts, setChatProducts] = useState([]); // Renamed state variable
  const [loading, setLoading] = useState(false);
  const [chatError, setChatError] = useState(null); // Renamed state variable
  const [chatHistory, setChatHistory] = useState([
    {
      type: "bot",
      message:
        "Hello! I'm your personal AI stylist. I can help you find similar outfits or suggest items based on your preferences. How can I assist you today?",
    },
  ]);
  const navigate = useNavigate();
  const theme = useTheme();

  const performSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setChatError(null); // Use renamed state setter

    const newChatHistory = [...chatHistory, { type: "user", message: query }];
    setChatHistory(newChatHistory);

    try {
      const response = await fetch("http://localhost:8000/api/search", {
        // Ensure this URL is correct for chat search
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `query=${encodeURIComponent(query)}`,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      console.log("Chat Search Response:", data); // DEBUG

      if (data.error) {
        setChatError(data.error); // Use renamed state setter
        setChatHistory([
          ...newChatHistory,
          { type: "bot", message: `Error: ${data.error}` },
        ]);
      } else if (data.images && data.images.length > 0) {
        // Assuming data.images has { id, image_url, productDisplayName }
        const productsWithFullUrl = data.images.map((p) => ({
          ...p,
          image_url: `http://localhost:8000${p.image_url}`, // Add base URL for chat images too
        }));
        setChatProducts(productsWithFullUrl); // Use renamed state setter
        setChatHistory([
          ...newChatHistory,
          {
            type: "bot",
            message: "Here are some recommendations based on your search:",
            products: productsWithFullUrl, // Use the results here
          },
        ]);
      } else {
        setChatProducts([]); // Use renamed state setter
        setChatHistory([
          ...newChatHistory,
          {
            type: "bot",
            message:
              "No results found for your query. Try describing the style differently.",
          },
        ]);
      }
    } catch (err) {
      console.error("Error fetching chat search results:", err);
      setChatError("An error occurred while fetching results."); // Use renamed state setter
      setChatHistory([
        ...newChatHistory,
        {
          type: "bot",
          message:
            "An error occurred while fetching results. Please try again later.",
        },
      ]);
    } finally {
      setLoading(false);
      setQuery("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading) {
      performSearch();
    }
  };

  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={onClose}
      aria-describedby="image-recommender-chat"
      maxWidth="sm"
      fullWidth
      PaperProps={{
        elevation: 8,
        sx: {
          borderRadius: theme.shape.borderRadius * 2,
          overflow: "hidden",
          bgcolor: "background.paper",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor:
            theme.palette.mode === "dark"
              ? theme.palette.grey[800]
              : theme.palette.grey[100],
          pb: 1.5,
          pt: 1.5,
        }}
      >
        <Box display="flex" alignItems="center">
          <Chat sx={{ mr: 1, color: theme.palette.primary.main }} />
          <Typography variant="h6" fontWeight={600}>
            AI Style Assistant
          </Typography>
        </Box>
        <IconButton
          edge="end"
          color="inherit"
          onClick={onClose}
          aria-label="close"
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent
        sx={{ p: 0, display: "flex", flexDirection: "column", height: "65vh" }}
      >
        <Box
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            p: 3,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            bgcolor: "background.default",
          }}
        >
          {chatHistory.map((chat, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                justifyContent:
                  chat.type === "user" ? "flex-end" : "flex-start",
                mb: 1,
              }}
            >
              {chat.type === "bot" && (
                <Avatar
                  src="/assets/ai-assistant-avatar.png"
                  alt="AI Assistant"
                  sx={{ width: 36, height: 36, mr: 1, mt: 0.5 }}
                />
              )}
              <Box
                sx={{
                  maxWidth: "75%",
                  p: 1.5,
                  borderRadius: theme.shape.borderRadius * 2,
                  ...(chat.type === "user"
                    ? {
                        bgcolor: theme.palette.primary.main,
                        color: theme.palette.primary.contrastText,
                        borderBottomRightRadius: "4px",
                      }
                    : {
                        bgcolor: theme.palette.background.paper,
                        color: theme.palette.text.primary,
                        borderBottomLeftRadius: "4px",
                      }),
                  boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                }}
              >
                <Typography variant="body1">{chat.message}</Typography>
                {/* Render products returned by the AI search */}
                {chat.products && (
                  <Grid container spacing={1} sx={{ mt: 1.5 }}>
                    {chat.products.map((product, prodIndex) => (
                      <Grid item xs={6} key={prodIndex}>
                        <Card
                          sx={{
                            position: "relative",
                            cursor: "pointer",
                            overflow: "hidden",
                            borderRadius: 2,
                            boxShadow: "none",
                            bgcolor: theme.palette.background.default,
                            transition: "transform 0.2s ease",
                            "&:hover": { transform: "scale(1.03)" },
                          }}
                          onClick={() => navigate(`/product/${product.id}`)}
                        >
                          {/* Use image_url which now includes the base URL */}
                          <CardMedia
                            component="img"
                            image={product.image_url}
                            alt={product.productDisplayName}
                            sx={{ height: 100, objectFit: "cover" }}
                          />
                          <Box
                            sx={{
                              position: "absolute",
                              bottom: 0,
                              left: 0,
                              right: 0,
                              bgcolor: "rgba(0, 0, 0, 0.6)",
                              color: "white",
                              p: 0.5,
                              fontSize: "0.7rem",
                              textAlign: "center",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {product.productDisplayName}
                          </Box>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
              {chat.type === "user" && (
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    ml: 1,
                    mt: 0.5,
                    bgcolor: theme.palette.secondary.main,
                  }}
                >
                  {" "}
                  {username ? username.charAt(0).toUpperCase() : "G"}{" "}
                </Avatar>
              )}
            </Box>
          ))}
          {/* Loading indicator */}
          {loading && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
                gap: 1,
                pl: 1,
              }}
            >
              {" "}
              <Avatar
                src="/assets/ai-assistant-avatar.png"
                sx={{ width: 36, height: 36, mr: 1 }}
              />{" "}
              <Box sx={{ display: "flex", gap: 0.5 }}>
                {" "}
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: theme.palette.text.secondary,
                    animation: "chatPulse 1.4s infinite ease-in-out both",
                    animationDelay: "0s",
                  }}
                ></Box>{" "}
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: theme.palette.text.secondary,
                    animation: "chatPulse 1.4s infinite ease-in-out both",
                    animationDelay: "0.2s",
                  }}
                ></Box>{" "}
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: theme.palette.text.secondary,
                    animation: "chatPulse 1.4s infinite ease-in-out both",
                    animationDelay: "0.4s",
                  }}
                ></Box>{" "}
              </Box>{" "}
              <style>{` @keyframes chatPulse { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1.0); } } `}</style>{" "}
            </Box>
          )}
          {/* Error message */}
          {chatError && (
            <Typography color="error" sx={{ textAlign: "center", mt: 2 }}>
              {chatError}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            p: 2,
            borderTop: `1px solid ${theme.palette.divider}`,
            display: "flex",
            alignItems: "center",
            gap: 1,
            bgcolor: "background.paper",
          }}
        >
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Ask about styles, outfits, or trends..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: theme.shape.borderRadius * 4,
              },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  {" "}
                  <IconButton
                    onClick={performSearch}
                    disabled={!query.trim() || loading}
                    color="primary"
                    sx={{
                      bgcolor: theme.palette.primary.main,
                      color: theme.palette.primary.contrastText,
                      "&:hover": { bgcolor: theme.palette.primary.dark },
                      "&.Mui-disabled": {
                        bgcolor: theme.palette.action.disabledBackground,
                        color: theme.palette.action.disabled,
                      },
                    }}
                  >
                    {" "}
                    <Send />{" "}
                  </IconButton>{" "}
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

// --- Carousel Component ---
const Carousel = ({ carouselItems }) => {
  const [activeStep, setActiveStep] = useState(0);
  const maxSteps = carouselItems.length;
  const theme = useTheme();

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prevActiveStep) =>
        prevActiveStep === maxSteps - 1 ? 0 : prevActiveStep + 1,
      );
    }, 5000);
    return () => clearInterval(timer);
  }, [maxSteps]);

  const handleNext = () => {
    setActiveStep((prevActiveStep) =>
      prevActiveStep === maxSteps - 1 ? 0 : prevActiveStep + 1,
    );
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) =>
      prevActiveStep === 0 ? maxSteps - 1 : prevActiveStep - 1,
    );
  };

  const handleStepChange = (step) => {
    setActiveStep(step);
  };

  return (
    <Box
      sx={{
        width: "100%",
        position: "relative",
        maxWidth: "100%",
        borderRadius: { xs: 0, md: theme.shape.borderRadius * 3 },
        overflow: "hidden",
        boxShadow: "0 5px 20px rgba(0,0,0,0.1)",
        bgcolor: theme.palette.background.default,
      }}
    >
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          height: { xs: 400, sm: 500, md: 600 },
        }}
      >
        {carouselItems.map((item, index) => (
          <Box
            key={item.id}
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              opacity: activeStep === index ? 1 : 0,
              transition: "opacity 1s ease",
              zIndex: activeStep === index ? 1 : 0,
            }}
          >
            {" "}
            <Box
              component="img"
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transition: "transform 10s ease",
                transform: activeStep === index ? "scale(1.05)" : "scale(1)",
              }}
              src={item.image}
              alt={item.title}
            />{" "}
          </Box>
        ))}{" "}
      </Box>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "space-between",
          transform: "translateY(-50%)",
          px: { xs: 1, sm: 2, md: 3 },
          zIndex: 2,
        }}
      >
        {" "}
        <IconButton
          onClick={handleBack}
          sx={{
            backgroundColor: alpha(theme.palette.background.paper, 0.8),
            color: theme.palette.text.primary,
            "&:hover": {
              backgroundColor: alpha(theme.palette.background.paper, 0.9),
              transform: "scale(1.1)",
            },
            transition: "all 0.3s ease",
            width: { xs: 36, sm: 40, md: 48 },
            height: { xs: 36, sm: 40, md: 48 },
          }}
          size="large"
        >
          {" "}
          <KeyboardArrowLeft />{" "}
        </IconButton>{" "}
        <IconButton
          onClick={handleNext}
          sx={{
            backgroundColor: alpha(theme.palette.background.paper, 0.8),
            color: theme.palette.text.primary,
            "&:hover": {
              backgroundColor: alpha(theme.palette.background.paper, 0.9),
              transform: "scale(1.1)",
            },
            transition: "all 0.3s ease",
            width: { xs: 36, sm: 40, md: 48 },
            height: { xs: 36, sm: 40, md: 48 },
          }}
          size="large"
        >
          {" "}
          <KeyboardArrowRight />{" "}
        </IconButton>{" "}
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          position: "absolute",
          bottom: 16,
          left: 0,
          right: 0,
          zIndex: 2,
        }}
      >
        {" "}
        {carouselItems.map((_, index) => (
          <Button
            key={index}
            sx={{
              minWidth: "auto",
              p: 0.5,
              m: 0.5,
              width: 40,
              height: 4,
              borderRadius: 4,
              backgroundColor:
                index === activeStep
                  ? theme.palette.primary.main
                  : alpha(theme.palette.action.active, 0.3),
              transition: "all 0.3s ease",
              "&:hover": {
                backgroundColor:
                  index === activeStep
                    ? theme.palette.primary.dark
                    : alpha(theme.palette.action.active, 0.5),
              },
            }}
            onClick={() => handleStepChange(index)}
          />
        ))}{" "}
      </Box>{" "}
    </Box>
  );
};

// --- Main UserDashboard Component ---
const UserDashboard = ({ username = "Guest" }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [chatOpen, setChatOpen] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const wishlistItems = useSelector(selectWishlistItems);

  useEffect(() => {
    const fetchProducts = async (retryCount = 0) => {
      setIsLoading(true);
      setError(null);
      try {
        // Use the /api/random-products endpoint with the selected category filter
        const endpoint = categoryFilter === "all" 
          ? "http://localhost:8000/api/random-products?limit=12" 
          : `http://localhost:8000/api/random-products?limit=12&gender=${categoryFilter}`;
        
        console.log(`Fetching products from ${endpoint}`);
        const response = await fetch(endpoint);
        
        if (!response.ok) {
          // If it's a 500 error and we've not retried too many times, try again after a delay
          if (response.status === 500 && retryCount < 2) {
            console.log(`Retrying fetch (attempt ${retryCount + 1})...`);
            setTimeout(() => fetchProducts(retryCount + 1), 1500); // Wait 1.5s before retry
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`Received ${data.products?.length || 0} products`);
        
        if (!data.products || data.products.length === 0) {
          setAllProducts([]);
          // If specific gender filter has no results, show specific message
          if (categoryFilter !== "all") {
            setError(`No products found in the ${categoryFilter} category. Try a different category.`);
          } else {
            setError("No products found. Please try again later.");
          }
        } else {
          const productsWithFullUrl = data.products.map((p) => ({
            ...p,
            image_url: `http://localhost:8000${p.image_url}`,
          }));
          
          setAllProducts(productsWithFullUrl);
        }
      } catch (e) {
        console.error("Failed to fetch products:", e);
        setError("Failed to load products. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [categoryFilter]); // Re-fetch when category filter changes

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleNotificationOpen = (event) =>
    setNotificationAnchorEl(event.currentTarget);
  const handleNotificationClose = () => setNotificationAnchorEl(null);
  const handleLogout = () => {
    console.log("Logged out");
    navigate("/", { replace: true });
  };
  const toggleDrawer = (open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setDrawerOpen(open);
  };
  const handleOpenChat = () => setChatOpen(true);
  const handleCloseChat = () => setChatOpen(false);
  const handleCategoryChange = (category) => {
    setCategoryFilter(category);
    setDrawerOpen(false);
  };

  // Updated filtering logic
  const filteredProducts =
    categoryFilter === "all"
      ? allProducts
      : allProducts.filter((product) => {
          // Filter by the exact category ID which matches the 'gender' field in the API
          return (
            product.gender === categoryFilter || product.gender === "Unisex"
          ); // Let Unisex show in Men/Women filters too
        });

  const handleAddToCart = (productId) => {
    // Use the product data to construct a proper cart item
    const product = allProducts.find(p => p.id === productId);
    if (product) {
      dispatch(addItemToCart({
        productId,
        quantity: 1,
        price: product.price,
        size: null, // Default size or get from a selection if available
        color: product.baseColour || null
      }));
    }
    
    console.log(`Added product ${productId} to cart`);
  };

  const addToWishlist = (productId) => {
    dispatch(addToWishlist(productId));
    console.log(`Added product ${productId} to wishlist`);
  }; 
  
  const viewProductDetails = (productId) => {
    console.log(`Viewing product ${productId}`);
    navigate(`/product/${productId}`);
  };

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      {/* Hero Banner Carousel */}
      <Box
        sx={{ p: { xs: 0, md: 4 }, pt: { xs: 0, md: 4 }, pb: { xs: 4, md: 6 } }}
      >
        {" "}
        <Container maxWidth="xl" disableGutters={isMobile}>
          {" "}
          <Carousel carouselItems={carouselItems} />{" "}
        </Container>{" "}
      </Box>

      {/* AI Feature Highlight */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        {" "}
        <Paper
          elevation={0}
          sx={{
            backgroundColor: theme.palette.background.paper,
            p: { xs: 3, sm: 4, md: 5 },
            borderRadius: 4,
            textAlign: "center",
            mb: 4,
            boxShadow:
              theme.palette.mode === "dark"
                ? "0 10px 40px rgba(0, 0, 0, 0.2)"
                : "0 10px 40px rgba(0, 0, 0, 0.05)",
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          {" "}
          <Typography
            variant="h3"
            component="h2"
            gutterBottom
            sx={{
              fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem" },
              fontWeight: 650,
              mb: 2,
              color: theme.palette.primary.main,
              display: "inline-block",
            }}
          >
            {" "}
            AI-Powered Style Recommendations{" "}
          </Typography>{" "}
          <Typography
            variant="h6"
            sx={{
              mb: 4,
              maxWidth: "800px",
              mx: "auto",
              color: "text.secondary",
              fontWeight: 400,
            }}
          >
            {" "}
            Discover your perfect style with our intelligent fashion assistant.
            Personalized outfits based on your preferences and the latest
            trends.{" "}
          </Typography>{" "}
          <Grid
            container
            spacing={{ xs: 3, sm: 4, md: 5 }}
            justifyContent="center"
            sx={{ mt: 2 }}
          >
            {" "}
            <Grid item xs={12} sm={6}>
              {" "}
              <Paper
                elevation={2}
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  borderRadius: 4,
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  bgcolor: "background.paper",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: theme.shadows[6],
                  },
                }}
              >
                {" "}
                <CardMedia
                  component="img"
                  image="/assets/ai-feature/image-left.png"
                  alt="AI Recommendation Example"
                  sx={{
                    height: { xs: 240, sm: 280, md: 320 },
                    objectFit: "cover",
                  }}
                />{" "}
                <CardContent sx={{ p: 3, flexGrow: 1 }}>
                  {" "}
                  <Typography
                    variant="h5"
                    component="div"
                    gutterBottom
                    sx={{ fontWeight: 600 }}
                  >
                    {" "}
                    Fashion AI Assistant{" "}
                  </Typography>{" "}
                  <Typography variant="body1" color="text.secondary" paragraph>
                    {" "}
                    Our AI stylist analyzes your preferences and helps you
                    discover items that perfectly complement your style.{" "}
                  </Typography>{" "}
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={handleOpenChat}
                    endIcon={<Chat />}
                    sx={{
                      mt: 1,
                      borderRadius: theme.shape.borderRadius * 4,
                      textTransform: "none",
                      px: 3,
                    }}
                  >
                    {" "}
                    Chat with AI Stylist{" "}
                  </Button>{" "}
                </CardContent>{" "}
              </Paper>{" "}
            </Grid>{" "}
            <Grid item xs={12} sm={6}>
              {" "}
              <Paper
                elevation={2}
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  borderRadius: 4,
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  bgcolor: "background.paper",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: theme.shadows[6],
                  },
                }}
              >
                {" "}
                <CardMedia
                  component="img"
                  image="/assets/ai-feature/image-right.png"
                  alt="Image Upload Feature"
                  sx={{
                    height: { xs: 240, sm: 280, md: 320 },
                    objectFit: "cover",
                  }}
                />{" "}
                <CardContent sx={{ p: 3, flexGrow: 1 }}>
                  {" "}
                  <Typography
                    variant="h5"
                    component="div"
                    gutterBottom
                    sx={{ fontWeight: 600 }}
                  >
                    {" "}
                    Visual Search{" "}
                  </Typography>{" "}
                  <Typography variant="body1" color="text.secondary" paragraph>
                    {" "}
                    Upload an image of clothing you like and our AI will find
                    similar items and suggest complete outfits.{" "}
                  </Typography>{" "}
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate("/recommend/image")}
                    endIcon={<ArrowRightAlt />}
                    sx={{
                      mt: 1,
                      borderRadius: theme.shape.borderRadius * 4,
                      textTransform: "none",
                      px: 3,
                    }}
                  >
                    {" "}
                    Try Visual Search{" "}
                  </Button>{" "}
                </CardContent>{" "}
              </Paper>{" "}
            </Grid>{" "}
          </Grid>{" "}
        </Paper>{" "}
      </Container>

      {/* Featured Products Section */}
      <Container maxWidth="xl" sx={{ mb: 8, px: { xs: 2, sm: 4, md: 6 } }}>
        <Box sx={{ mb: 5, textAlign: "center" }}>
          <Typography
            variant="overline"
            component="div"
            sx={{
              color: theme.palette.primary.main,
              fontWeight: 600,
              letterSpacing: 2,
              mb: 1,
            }}
          >
            {" "}
            CURATED COLLECTION{" "}
          </Typography>
          <Typography
            variant="h3"
            component="h2"
            sx={{
              mb: 2,
              fontWeight: 700,
              fontSize: { xs: "1.8rem", sm: "2.2rem", md: "2.5rem" },
            }}
          >
            {categoryFilter === "all"
              ? "Featured Products"
              : `${categories.find((c) => c.id === categoryFilter)?.name || "Featured"}'s Collection`}
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: 700, mx: "auto", mb: 4 }}
          >
            {" "}
            Discover our handpicked selection of premium products, combining
            elegant design with exceptional quality.{" "}
          </Typography>
          {/* Filter Chips */}
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 1.5,
              mb: 4,
            }}
          >
            <Chip
              label="All"
              clickable
              onClick={() => handleCategoryChange("all")}
              color={categoryFilter === "all" ? "primary" : "default"}
              variant={categoryFilter === "all" ? "filled" : "outlined"}
              sx={{
                fontWeight: 500,
                px: 1.5,
                borderRadius: "16px",
                boxShadow: categoryFilter === "all" ? theme.shadows[1] : "none",
                borderColor:
                  categoryFilter !== "all"
                    ? theme.palette.divider
                    : "transparent",
              }}
            />
            {categories.map((category) => (
              <Chip
                key={category.id}
                label={category.name}
                icon={
                  <span style={{ fontSize: "1rem", marginRight: 0 }}>
                    {category.icon}
                  </span>
                }
                clickable
                onClick={() => handleCategoryChange(category.id)}
                color={categoryFilter === category.id ? "primary" : "default"}
                variant={categoryFilter === category.id ? "filled" : "outlined"}
                sx={{
                  fontWeight: 500,
                  px: 1.5,
                  borderRadius: "16px",
                  boxShadow:
                    categoryFilter === category.id ? theme.shadows[1] : "none",
                  borderColor:
                    categoryFilter !== category.id
                      ? theme.palette.divider
                      : "transparent",
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Product Grid Area */}
        {isLoading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "40vh",
            }}
          >
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" align="center">
            {error}
          </Typography>
        ) : filteredProducts.length === 0 ? (
          <Typography
            color="text.secondary"
            align="center"
            sx={{
              minHeight: "20vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            No products found in this category.
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {filteredProducts.map((product) => (
              <Grid item key={product.id} xs={6} sm={4} md={3}>
                <ProductCard onClick={() => viewProductDetails(product.id)}>
                  <Box
                    sx={{
                      position: "relative",
                      overflow: "hidden",
                      bgcolor:
                        theme.palette.mode === "dark"
                          ? theme.palette.grey[800]
                          : theme.palette.grey[100],
                    }}
                  >
                    <CardMedia
                      component="img"
                      image={product.image_url} // Use full URL
                      alt={product.productDisplayName}
                      sx={{
                        height: 300,
                        transition: "transform 0.6s ease, opacity 0.3s ease",
                        opacity: 1,
                        "&:hover": { transform: "scale(1.05)", opacity: 0.9 },
                      }}
                    />
                    <ProductImageOverlay className="hover-content" />
                    <QuickViewButton
                      size="small"
                      className="product-actions"
                      onClick={(e) => {
                        e.stopPropagation();
                        viewProductDetails(product.id);
                      }}
                    >
                      Quick View
                    </QuickViewButton>
                  </Box>
                  <CardContent sx={{ p: 2, pt: 2.5 }}>
                    <Box sx={{ mb: 0.5 }}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        component="div"
                        noWrap
                      >
                        {product.masterCategory} / {product.subCategory}
                      </Typography>
                    </Box>
                    <Typography
                      variant="subtitle1"
                      component="div"
                      noWrap
                      sx={{ fontWeight: 500, mb: 1 }}
                    >
                      {product.productDisplayName}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mt: 1.5,
                      }}
                    >
                      <Box>
                        <Typography
                          variant="h6"
                          color="text.primary"
                          sx={{ fontWeight: 600 }}
                        >
                          ₹{product.price ? product.price.toFixed(2) : "N/A"}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex" }}>
                        <Tooltip title="Add to Wishlist">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={(e) => addToWishlist(e, product.id)}
                            sx={{
                              mr: 0.5,
                              transition: "all 0.2s",
                              "&:hover": {
                                transform: "scale(1.1)",
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                              },
                            }}
                          >
                            <FavoriteBorder fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Add to Cart">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => {
                              console.log("ASS"); 
                              handleAddToCart(product.id);
                            }}
                            sx={{
                              transition: "all 0.2s",
                              "&:hover": {
                                transform: "scale(1.1)",
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                              },
                            }}
                          >
                            <AddShoppingCart fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </CardContent>
                </ProductCard>
              </Grid>
            ))}
          </Grid>
        )}

        {/* View All Button */}
        <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
          {" "}
          <Button
            variant="outlined"
            size="large"
            endIcon={<ArrowRightAlt />}
            onClick={() => navigate("/all-products")}
            sx={{
              borderRadius: theme.shape.borderRadius * 4,
              px: 4,
              py: 1.5,
              textTransform: "none",
              fontWeight: 500,
              fontSize: "1rem",
            }}
          >
            {" "}
            View All Products{" "}
          </Button>{" "}
        </Box>
      </Container>

      {/* Email Subscription */}
      <Box
        sx={{
          py: 8,
          mb: 0,
          background:
            theme.palette.mode === "dark"
              ? `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.3)} 0%, ${alpha(theme.palette.primary.main, 0.5)} 100%)`
              : `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.2)} 0%, ${alpha(theme.palette.primary.main, 0.4)} 100%)`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {" "}
        <Container maxWidth="md" sx={{ position: "relative", zIndex: 1 }}>
          {" "}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 5 },
              borderRadius: 4,
              backgroundColor: alpha(theme.palette.background.paper, 0.9),
              backdropFilter: "blur(8px)",
              boxShadow: theme.shadows[3],
              textAlign: "center",
            }}
          >
            {" "}
            <Typography variant="h4" gutterBottom fontWeight={600}>
              {" "}
              Join Our Fashion Community{" "}
            </Typography>{" "}
            <Typography
              variant="subtitle1"
              color="text.secondary"
              paragraph
              sx={{ mb: 4, maxWidth: "600px", mx: "auto" }}
            >
              {" "}
              Subscribe to our newsletter to receive updates on new arrivals,
              exclusive offers, and AI-powered style tips tailored just for
              you.{" "}
            </Typography>{" "}
            <Box
              component="form"
              noValidate
              sx={{
                mt: 1,
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
              }}
            >
              {" "}
              <TextField
                variant="outlined"
                required
                placeholder="Enter your email address"
                name="email"
                autoComplete="email"
                type="email"
                sx={{
                  width: { xs: "100%", sm: "60%" },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: theme.shape.borderRadius * 3,
                  },
                }}
              />{" "}
              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{
                  height: 56,
                  width: { xs: "100%", sm: "auto" },
                  borderRadius: theme.shape.borderRadius * 3,
                  px: 4,
                  fontWeight: 500,
                  textTransform: "none",
                  fontSize: "1rem",
                }}
              >
                {" "}
                Subscribe{" "}
              </Button>{" "}
            </Box>{" "}
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 2 }}
            >
              {" "}
              We respect your privacy and will never share your
              information.{" "}
            </Typography>{" "}
          </Paper>{" "}
        </Container>{" "}
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          bgcolor: theme.palette.background.paper,
          borderTop: `1px solid ${theme.palette.divider}`,
          py: 6,
        }}
      >
        {" "}
        <Container maxWidth="lg">
          {" "}
          <Grid container spacing={4} justifyContent="space-between">
            {" "}
            <Grid item xs={12} sm={6} md={4}>
              {" "}
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                {" "}
                <ShoppingBag
                  sx={{
                    color: theme.palette.primary.main,
                    mr: 1,
                    fontSize: "2rem",
                  }}
                />{" "}
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: theme.palette.primary.main }}
                >
                  {" "}
                  LUXE{" "}
                </Typography>{" "}
              </Box>{" "}
              <Typography variant="body2" color="text.secondary" paragraph>
                {" "}
                Your premium AI-powered fashion discovery platform. We combine
                cutting-edge technology with curated fashion to create a
                personalized shopping experience.{" "}
              </Typography>{" "}
              <Box sx={{ display: "flex", gap: 1, mt: 3 }}>
                {" "}
                <IconButton
                  size="small"
                  sx={{
                    color: "#3b5998",
                    bgcolor: alpha(theme.palette.text.primary, 0.05),
                    "&:hover": {
                      bgcolor: alpha(theme.palette.text.primary, 0.1),
                    },
                  }}
                >
                  {" "}
                  <Facebook fontSize="small" />{" "}
                </IconButton>{" "}
                <IconButton
                  size="small"
                  sx={{
                    color: "#1da1f2",
                    bgcolor: alpha(theme.palette.text.primary, 0.05),
                    "&:hover": {
                      bgcolor: alpha(theme.palette.text.primary, 0.1),
                    },
                  }}
                >
                  {" "}
                  <Twitter fontSize="small" />{" "}
                </IconButton>{" "}
                <IconButton
                  size="small"
                  sx={{
                    color: "#c32aa3",
                    bgcolor: alpha(theme.palette.text.primary, 0.05),
                    "&:hover": {
                      bgcolor: alpha(theme.palette.text.primary, 0.1),
                    },
                  }}
                >
                  {" "}
                  <Instagram fontSize="small" />{" "}
                </IconButton>{" "}
                <IconButton
                  size="small"
                  sx={{
                    color: "#bd081c",
                    bgcolor: alpha(theme.palette.text.primary, 0.05),
                    "&:hover": {
                      bgcolor: alpha(theme.palette.text.primary, 0.1),
                    },
                  }}
                >
                  {" "}
                  <Pinterest fontSize="small" />{" "}
                </IconButton>{" "}
              </Box>{" "}
            </Grid>{" "}
            <Grid item xs={6} sm={3} md={2}>
              {" "}
              <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                {" "}
                Shop{" "}
              </Typography>{" "}
              <Typography
                variant="body2"
                component="div"
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  "& > *": { mb: 1.5 },
                }}
              >
                {" "}
                <RouterLink
                  to="/products/women"
                  style={{
                    textDecoration: "none",
                    color: theme.palette.text.secondary,
                  }}
                >
                  Women
                </RouterLink>{" "}
                <RouterLink
                  to="/products/men"
                  style={{
                    textDecoration: "none",
                    color: theme.palette.text.secondary,
                  }}
                >
                  Men
                </RouterLink>{" "}
                <RouterLink
                  to="/products/kids"
                  style={{
                    textDecoration: "none",
                    color: theme.palette.text.secondary,
                  }}
                >
                  Kids
                </RouterLink>{" "}
                <RouterLink
                  to="/products/accessories"
                  style={{
                    textDecoration: "none",
                    color: theme.palette.text.secondary,
                  }}
                >
                  Accessories
                </RouterLink>{" "}
                <RouterLink
                  to="/products/new"
                  style={{
                    textDecoration: "none",
                    color: theme.palette.text.secondary,
                  }}
                >
                  New Arrivals
                </RouterLink>{" "}
              </Typography>{" "}
            </Grid>{" "}
            <Grid item xs={6} sm={3} md={2}>
              {" "}
              <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                Help
              </Typography>{" "}
              <Typography
                variant="body2"
                component="div"
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  "& > *": { mb: 1.5 },
                }}
              >
                {" "}
                <RouterLink
                  to="/help/service"
                  style={{
                    textDecoration: "none",
                    color: theme.palette.text.secondary,
                  }}
                >
                  Customer Service
                </RouterLink>{" "}
                <RouterLink
                  to="/user/profile"
                  style={{
                    textDecoration: "none",
                    color: theme.palette.text.secondary,
                  }}
                >
                  My Account
                </RouterLink>{" "}
                <RouterLink
                  to="/help/stores"
                  style={{
                    textDecoration: "none",
                    color: theme.palette.text.secondary,
                  }}
                >
                  Find a Store
                </RouterLink>{" "}
                <RouterLink
                  to="/help/size-guide"
                  style={{
                    textDecoration: "none",
                    color: theme.palette.text.secondary,
                  }}
                >
                  Size Guide
                </RouterLink>{" "}
                <RouterLink
                  to="/help/faq"
                  style={{
                    textDecoration: "none",
                    color: theme.palette.text.secondary,
                  }}
                >
                  FAQ
                </RouterLink>{" "}
              </Typography>{" "}
            </Grid>{" "}
            <Grid item xs={6} sm={3} md={2}>
              {" "}
              <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                About
              </Typography>{" "}
              <Typography
                variant="body2"
                component="div"
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  "& > *": { mb: 1.5 },
                }}
              >
                {" "}
                <RouterLink
                  to="/about/story"
                  style={{
                    textDecoration: "none",
                    color: theme.palette.text.secondary,
                  }}
                >
                  Our Story
                </RouterLink>{" "}
                <RouterLink
                  to="/about/careers"
                  style={{
                    textDecoration: "none",
                    color: theme.palette.text.secondary,
                  }}
                >
                  Careers
                </RouterLink>{" "}
                <RouterLink
                  to="/about/news"
                  style={{
                    textDecoration: "none",
                    color: theme.palette.text.secondary,
                  }}
                >
                  Corporate News
                </RouterLink>{" "}
                <RouterLink
                  to="/about/sustainability"
                  style={{
                    textDecoration: "none",
                    color: theme.palette.text.secondary,
                  }}
                >
                  Sustainability
                </RouterLink>{" "}
                <RouterLink
                  to="/about/investors"
                  style={{
                    textDecoration: "none",
                    color: theme.palette.text.secondary,
                  }}
                >
                  Investors
                </RouterLink>{" "}
              </Typography>{" "}
            </Grid>{" "}
          </Grid>{" "}
          <Divider sx={{ my: 4, borderColor: theme.palette.divider }} />{" "}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {" "}
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: { xs: 2, sm: 0 },
                textAlign: { xs: "center", sm: "left" },
              }}
            >
              {" "}
              © {new Date().getFullYear()} LUXE. All rights reserved.{" "}
            </Typography>{" "}
            <Box
              sx={{
                display: "flex",
                gap: 3,
                flexWrap: "wrap",
                justifyContent: { xs: "center", sm: "flex-end" },
              }}
            >
              {" "}
              <RouterLink
                to="/legal/privacy"
                style={{
                  textDecoration: "none",
                  color: theme.palette.text.secondary,
                }}
              >
                {" "}
                <Typography variant="body2">Privacy Policy</Typography>{" "}
              </RouterLink>{" "}
              <RouterLink
                to="/legal/terms"
                style={{
                  textDecoration: "none",
                  color: theme.palette.text.secondary,
                }}
              >
                {" "}
                <Typography variant="body2">Terms of Service</Typography>{" "}
              </RouterLink>{" "}
              <RouterLink
                to="/legal/cookies"
                style={{
                  textDecoration: "none",
                  color: theme.palette.text.secondary,
                }}
              >
                {" "}
                <Typography variant="body2">Cookies</Typography>{" "}
              </RouterLink>{" "}
            </Box>{" "}
          </Box>{" "}
        </Container>{" "}
      </Box>

      {/* Floating Chat Button */}
      <Fab
        color="primary"
        aria-label="chat with ai"
        onClick={handleOpenChat}
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: (theme) => theme.zIndex.drawer + 1,
          boxShadow: theme.shadows[6],
          "&:hover": { transform: "scale(1.05)" },
          transition: "transform 0.2s ease",
        }}
      >
        {" "}
        <Chat />{" "}
      </Fab>

      {/* AI Chatbot Dialog */}
      <ImageRecommenderChat
        open={chatOpen}
        onClose={handleCloseChat}
        username={username}
      />
    </Box>
  );
};

export default UserDashboard;
