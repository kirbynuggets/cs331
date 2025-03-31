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
  useTheme,
  Rating,
  Tooltip,
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
} from "@mui/icons-material";
import { styled, alpha } from "@mui/material/styles";
import { useNavigate, Link } from "react-router-dom";
import { KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";

// Mock data for featured products
const featuredProducts = [
  {
    id: 1,
    name: "Women's Summer Dress",
    price: "$49.99",
    originalPrice: "$69.99",
    image: "/assets/all-items/image1.png",
    category: "women",
    rating: 4.5,
    reviews: 128,
    isNew: true,
  },
  {
    id: 2,
    name: "Men's Casual Shirt",
    price: "$39.99",
    originalPrice: "$49.99",
    image: "/assets/all-items/image2.png",
    category: "men",
    rating: 4.2,
    reviews: 84,
    isSale: true,
  },
  {
    id: 3,
    name: "Kids' Playsuit",
    price: "$29.99",
    image: "/assets/all-items/image3.png",
    category: "kids",
    rating: 4.7,
    reviews: 56,
  },
  {
    id: 4,
    name: "Designer Handbag",
    price: "$79.99",
    originalPrice: "$99.99",
    image: "/assets/all-items/image4.png",
    category: "accessories",
    rating: 4.8,
    reviews: 210,
    isSale: true,
  },
  {
    id: 5,
    name: "Floral Print Blouse",
    price: "$45.99",
    image: "/assets/all-items/image5.png",
    category: "women",
    rating: 4.3,
    reviews: 67,
    isNew: true,
  },
  {
    id: 6,
    name: "Slim Fit Jeans",
    price: "$59.99",
    image: "/assets/all-items/image6.png",
    category: "men",
    rating: 4.4,
    reviews: 142,
  },
  {
    id: 7,
    name: "Home Decor Cushion",
    price: "$24.99",
    image: "/assets/all-items/image7.png",
    category: "home",
    rating: 4.1,
    reviews: 32,
  },
  {
    id: 8,
    name: "Statement Necklace",
    price: "$34.99",
    image: "/assets/all-items/image8.png",
    category: "accessories",
    rating: 4.6,
    reviews: 95,
    isNew: true,
  },
];

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

// Categories with icons for visual navigation
const categories = [
  { id: "women", name: "Women", icon: "👗" },
  { id: "men", name: "Men", icon: "👔" },
  { id: "kids", name: "Kids", icon: "🧸" },
  { id: "accessories", name: "Accessories", icon: "👜" },
  { id: "home", name: "Home", icon: "🏠" },
];

// Styled components for search bar
const SearchBar = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius * 3,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(3),
    width: "auto",
  },
  border: `1px solid ${alpha(theme.palette.common.black, 0.1)}`,
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: alpha(theme.palette.common.black, 0.6),
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
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

// Transition for dialog
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// Styled components for enhanced visuals
const CategoryButton = styled(Button)(({ theme, selected }) => ({
  borderRadius: theme.shape.borderRadius * 3,
  padding: "8px 16px",
  marginRight: theme.spacing(1),
  textTransform: "none",
  fontWeight: 500,
  color: selected ? theme.palette.primary.contrastText : theme.palette.text.primary,
  backgroundColor: selected ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.05),
  "&:hover": {
    backgroundColor: selected 
      ? alpha(theme.palette.primary.main, 0.9) 
      : alpha(theme.palette.primary.main, 0.15),
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
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: "0 12px 20px rgba(0,0,0,0.1)",
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
  backgroundColor: alpha(theme.palette.common.white, 0.9),
  color: theme.palette.common.black,
  "&:hover": {
    backgroundColor: theme.palette.common.white,
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
  background: "linear-gradient(to bottom, rgba(0,0,0,0) 60%, rgba(0,0,0,0.4) 100%)",
  opacity: 0,
  transition: "all 0.3s ease",
}));

const StatusChip = styled(Chip)(({ theme, variant }) => ({
  position: "absolute",
  top: 12,
  left: 12,
  borderRadius: theme.shape.borderRadius * 2,
  fontWeight: 500,
  fontSize: "0.75rem",
  letterSpacing: "0.5px",
  ...(variant === "sale" && {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
  }),
  ...(variant === "new" && {
    backgroundColor: theme.palette.success.main,
    color: theme.palette.success.contrastText,
  }),
}));

// Image Recommender Chatbot Component
const ImageRecommenderChat = ({ open, onClose, username = "Guest" }) => {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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
    setError(null);

    // Add user message to chat history
    const newChatHistory = [...chatHistory, { type: "user", message: query }];
    setChatHistory(newChatHistory);

    try {
      const response = await fetch("http://localhost:8000/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `query=${encodeURIComponent(query)}`,
      });

      const data = await response.json();

      console.log("Response:", data); // DEBUG

      if (data.error) {
        setError(data.error);
        setChatHistory([
          ...newChatHistory,
          { type: "bot", message: `Error: ${data.error}` },
        ]);
      } else if (data.images && data.images.length > 0) {
        setProducts(data.images);
        setChatHistory([
          ...newChatHistory,
          {
            type: "bot",
            message: "Here are some recommendations based on your search:",
            products: data.images,
          },
        ]);
      } else {
        setProducts([]);
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
      console.error("Error:", err);
      setError("An error occurred while fetching results.");
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
    if (e.key === "Enter") {
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
        elevation: 24,
        sx: {
          borderRadius: theme.shape.borderRadius * 2,
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #e0e0e0",
          bgcolor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          pb: 2,
        }}
      >
        <Box display="flex" alignItems="center">
          <Chat sx={{ mr: 1 }} />
          <Typography variant="h6" fontWeight={600}>AI Style Assistant</Typography>
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
        {/* Chat messages area */}
        <Box
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            p: 3,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            bgcolor: alpha(theme.palette.background.default, 0.7),
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
                  p: 2,
                  borderRadius: theme.shape.borderRadius * 2,
                  ...(chat.type === "user" 
                    ? { 
                        bgcolor: theme.palette.primary.main, 
                        color: theme.palette.primary.contrastText,
                        borderBottomRightRadius: "4px",
                      } 
                    : { 
                        bgcolor: theme.palette.grey[100],
                        color: theme.palette.text.primary,
                        borderBottomLeftRadius: "4px",
                      }),
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                <Typography variant="body1">{chat.message}</Typography>

                {chat.products && (
                  <Grid container spacing={1} sx={{ mt: 2 }}>
                    {chat.products.map((product, prodIndex) => (
                      <Grid item xs={6} key={prodIndex}>
                        <Card
                          sx={{ 
                            position: "relative", 
                            cursor: "pointer",
                            overflow: "hidden",
                            borderRadius: 2,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                            transition: "transform 0.2s ease",
                            "&:hover": {
                              transform: "scale(1.03)",
                            },
                          }}
                          onClick={() => navigate(`/product/${product.id}`)}
                        >
                          <CardMedia
                            component="img"
                            image={`http://localhost:8000${product.image_url}`}
                            alt={product.productDisplayName}
                            sx={{ height: 120, objectFit: "cover" }}
                          />
                          <Box
                            sx={{
                              position: "absolute",
                              bottom: 0,
                              left: 0,
                              right: 0,
                              bgcolor: "rgba(0, 0, 0, 0.7)",
                              color: "white",
                              p: 0.75,
                              fontSize: "0.75rem",
                              textAlign: "center",
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
                  {username.charAt(0).toUpperCase()}
                </Avatar>
              )}
            </Box>
          ))}

          {loading && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 2 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: theme.palette.primary.main,
                  animation: "pulse 1s infinite",
                }}
              ></Box>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: theme.palette.primary.main,
                  animation: "pulse 1s infinite 0.2s",
                }}
              ></Box>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: theme.palette.primary.main,
                  animation: "pulse 1s infinite 0.4s",
                }}
              ></Box>
              <style jsx>{`
                @keyframes pulse {
                  0%, 100% {
                    opacity: 0.5;
                  }
                  50% {
                    opacity: 1;
                  }
                }
              `}</style>
            </Box>
          )}
        </Box>

        {/* Input area */}
        <Box
          sx={{
            p: 2,
            borderTop: "1px solid #e0e0e0",
            display: "flex",
            alignItems: "center",
            gap: 1,
            bgcolor: "white",
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
                  <IconButton
                    onClick={performSearch}
                    disabled={!query.trim() || loading}
                    color="primary"
                    sx={{
                      bgcolor: theme.palette.primary.main,
                      color: "white",
                      "&:hover": {
                        bgcolor: theme.palette.primary.dark,
                      },
                      "&.Mui-disabled": {
                        bgcolor: theme.palette.grey[300],
                        color: theme.palette.grey[500],
                      },
                    }}
                  >
                    <Send />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

// Carousel Component with enhanced styling (text overlays removed)
const Carousel = ({ carouselItems }) => {
  const [activeStep, setActiveStep] = useState(0);
  const maxSteps = carouselItems.length;
  const theme = useTheme();

  // Auto-rotate carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prevActiveStep) =>
        prevActiveStep === maxSteps - 1 ? 0 : prevActiveStep + 1
      );
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, [maxSteps]);

  const handleNext = () => {
    setActiveStep((prevActiveStep) =>
      prevActiveStep === maxSteps - 1 ? 0 : prevActiveStep + 1
    );
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) =>
      prevActiveStep === 0 ? maxSteps - 1 : prevActiveStep - 1
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
      }}
    >
      {/* Hero Banner Carousel */}
      <Box 
        sx={{ 
          position: "relative", 
          overflow: "hidden", 
          height: { xs: 400, sm: 500, md: 600 } 
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
            />
            {/* Text overlay removed as requested */}
          </Box>
        ))}
      </Box>

      {/* Navigation arrows */}
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "space-between",
          transform: "translateY(-50%)",
          px: { xs: 2, sm: 4 },
          zIndex: 2,
        }}
      >
        <IconButton
          onClick={handleBack}
          sx={{
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            color: theme.palette.common.black,
            "&:hover": { 
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              transform: "scale(1.1)",
            },
            transition: "all 0.3s ease",
            width: { xs: 40, md: 48 },
            height: { xs: 40, md: 48 },
          }}
          size="large"
        >
          <KeyboardArrowLeft />
        </IconButton>
        <IconButton
          onClick={handleNext}
          sx={{
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            color: theme.palette.common.black,
            "&:hover": { 
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              transform: "scale(1.1)",
            },
            transition: "all 0.3s ease",
            width: { xs: 40, md: 48 },
            height: { xs: 40, md: 48 },
          }}
          size="large"
        >
          <KeyboardArrowRight />
        </IconButton>
      </Box>

      {/* Carousel indicators */}
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
                  : "rgba(255, 255, 255, 0.5)",
              transition: "all 0.3s ease",
              "&:hover": {
                backgroundColor:
                  index === activeStep
                    ? theme.palette.primary.dark
                    : "rgba(255, 255, 255, 0.8)",
              },
            }}
            onClick={() => handleStepChange(index)}
          />
        ))}
      </Box>
    </Box>
  );
};

// Main UserDashboard component with enhanced styling
const UserDashboard = ({ username = "Guest" }) => {
  const [cartItems, setCartItems] = useState(0);
  const [wishlistItems, setWishlistItems] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [chatOpen, setChatOpen] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);

  // User menu handling
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationOpen = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleLogout = () => {
    console.log("Logged out");
    navigate("/", { replace: true });
  };

  // Drawer handling
  const toggleDrawer = (open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  // Chat dialog handling
  const handleOpenChat = () => {
    setChatOpen(true);
  };

  const handleCloseChat = () => {
    setChatOpen(false);
  };

  // Filter products by category
  const handleCategoryChange = (category) => {
    setCategoryFilter(category);
    setDrawerOpen(false);
  };

  const filteredProducts =
    categoryFilter === "all"
      ? featuredProducts
      : featuredProducts.filter(
          (product) => product.category === categoryFilter
        );

  // Product actions
  const addToCart = (e, productId) => {
    e.stopPropagation();
    setCartItems(cartItems + 1);
    console.log(`Added product ${productId} to cart`);
  };

  const addToWishlist = (e, productId) => {
    e.stopPropagation();
    setWishlistItems(wishlistItems + 1);
    console.log(`Added product ${productId} to wishlist`);
  };

  const viewProductDetails = (productId) => {
    console.log(`Viewing product ${productId}`);
    navigate(`/product/${productId}`);
  };

  return (
    <Box sx={{ bgcolor: "#FBFBFD" }}>
      {/* Navigation Bar - Enhanced with better styling */}
      <AppBar 
        position="static" 
        color="default" 
        elevation={0} 
        sx={{ 
          borderBottom: "1px solid #e0e0e0",
          bgcolor: "white", 
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ py: 0.5 }}>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer(true)}
              sx={{ mr: 2, display: { xs: "flex", md: "none" } }}
            >
              <MenuIcon />
            </IconButton>

            <Box 
              sx={{ 
                display: "flex", 
                alignItems: "center",
                mr: { xs: 1, md: 4 } 
              }}
            >
              <ShoppingBag 
                sx={{ 
                  color: theme.palette.primary.main, 
                  mr: 1,
                  fontSize: "2rem" 
                }} 
              />
              <Typography
                variant="h5"
                noWrap
                component="div"
                sx={{
                  display: { xs: "none", sm: "block" },
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  color: theme.palette.primary.main,
                }}
              >
                LUXE
              </Typography>
            </Box>

            <Box sx={{ display: { xs: "none", md: "flex" }, flexGrow: 1 }}>
              {categories.map((category) => (
                <CategoryButton
                  key={category.id}
                  color="inherit"
                  onClick={() => handleCategoryChange(category.id)}
                  selected={categoryFilter === category.id}
                >
                  <span style={{ marginRight: 8 }}>{category.icon}</span>
                  {category.name}
                </CategoryButton>
              ))}
            </Box>

            <SearchBar sx={{ flexGrow: { xs: 1, md: 0 }, mr: { xs: 2, md: 0 } }}>
              <SearchIconWrapper>
                <Search />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Search products, brands…"
                inputProps={{ "aria-label": "search" }}
              />
            </SearchBar>

            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Tooltip title="Notifications">
                <IconButton 
                  color="inherit" 
                  sx={{ ml: 1 }}
                  onClick={handleNotificationOpen}
                >
                  <Badge badgeContent={3} color="error">
                    <Notifications />
                  </Badge>
                </IconButton>
              </Tooltip>
              <Tooltip title="Wishlist">
                <IconButton 
                  color="inherit" 
                  sx={{ ml: { xs: 0.5, sm: 1 } }}
                >
                  <Badge badgeContent={wishlistItems} color="error">
                    <Favorite />
                  </Badge>
                </IconButton>
              </Tooltip>
              <Tooltip title="Cart">
                <IconButton 
                  color="inherit" 
                  sx={{ ml: { xs: 0.5, sm: 1 } }}
                  onClick={() => navigate("/user/cart")}
                >
                  <Badge badgeContent={cartItems} color="error">
                    <ShoppingCart />
                  </Badge>
                </IconButton>
              </Tooltip>
              <Tooltip title="Account">
                <IconButton
                  edge="end"
                  aria-label="account"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleMenuOpen}
                  color="inherit"
                  sx={{ ml: { xs: 0.5, sm: 1 } }}
                >
                  <Avatar 
                    sx={{ 
                      width: 32, 
                      height: 32, 
                      bgcolor: theme.palette.primary.main,
                      fontSize: "0.875rem",
                    }}
                  >
                    {username.charAt(0).toUpperCase()}
                  </Avatar>
                </IconButton>
              </Tooltip>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Notifications Menu */}
      <Menu
        id="notifications-menu"
        anchorEl={notificationAnchorEl}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        keepMounted
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        open={Boolean(notificationAnchorEl)}
        onClose={handleNotificationClose}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1.5,
            width: 320,
            borderRadius: 2,
            overflow: "hidden",
          },
        }}
      >
        <Box sx={{ bgcolor: theme.palette.primary.main, p: 2, color: "white" }}>
          <Typography variant="subtitle1" fontWeight={600}>Notifications</Typography>
        </Box>
        <MenuItem onClick={handleNotificationClose} sx={{ py: 1.5 }}>
          <Box>
            <Typography variant="body2" fontWeight={500}>New arrivals from your favorite brands</Typography>
            <Typography variant="caption" color="text.secondary">2 hours ago</Typography>
          </Box>
        </MenuItem>
        <MenuItem onClick={handleNotificationClose} sx={{ py: 1.5 }}>
          <Box>
            <Typography variant="body2" fontWeight={500}>Your order #5789 has been shipped</Typography>
            <Typography variant="caption" color="text.secondary">Yesterday</Typography>
          </Box>
        </MenuItem>
        <MenuItem onClick={handleNotificationClose} sx={{ py: 1.5 }}>
          <Box>
            <Typography variant="body2" fontWeight={500}>Flash sale: 30% off all summer items</Typography>
            <Typography variant="caption" color="text.secondary">2 days ago</Typography>
          </Box>
        </MenuItem>
        <Divider />
        <Box sx={{ p: 1, textAlign: "center" }}>
          <Button size="small" endIcon={<ChevronRight />}>
            View all notifications
          </Button>
        </Box>
      </Menu>

      {/* User Menu - Enhanced with better styling */}
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        keepMounted
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1.5,
            borderRadius: 2,
            minWidth: 180,
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" fontWeight={600}>
            Welcome, {username}!
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Member since January 2024
          </Typography>
        </Box>
        <Divider />
        <MenuItem onClick={handleMenuClose} sx={{ py: 1.5 }}>
          <Person fontSize="small" sx={{ mr: 1.5, color: "text.secondary" }} />
          <Typography variant="body2">My Profile</Typography>
        </MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ py: 1.5 }}>
          <ShoppingBag fontSize="small" sx={{ mr: 1.5, color: "text.secondary" }} />
          <Typography variant="body2">My Orders</Typography>
        </MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ py: 1.5 }}>
          <Favorite fontSize="small" sx={{ mr: 1.5, color: "text.secondary" }} />
          <Typography variant="body2">Wishlist</Typography>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ py: 1.5 }}>
          <Typography variant="body2" color="error">Logout</Typography>
        </MenuItem>
      </Menu>

      {/* Mobile Navigation Drawer - Enhanced with better styling */}
      <Drawer 
        anchor="left" 
        open={drawerOpen} 
        onClose={toggleDrawer(false)}
        PaperProps={{
          sx: {
            width: 280,
            borderRadius: "0 16px 16px 0",
          },
        }}
      >
        <Box sx={{ width: 280 }} role="presentation">
          <Box sx={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            p: 2,
            bgcolor: theme.palette.primary.main,
            color: "white",
          }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <ShoppingBag sx={{ mr: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                LUXE
              </Typography>
            </Box>
            <IconButton onClick={toggleDrawer(false)} sx={{ color: "white" }}>
              <Close />
            </IconButton>
          </Box>
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Hello, {username}
            </Typography>
          </Box>
          <Divider />
          <List>
            <Typography variant="subtitle2" sx={{ px: 2, py: 1, color: "text.secondary" }}>
              CATEGORIES
            </Typography>
            {categories.map((category) => (
              <ListItem
                button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                selected={categoryFilter === category.id}
                sx={{
                  pl: 3,
                  borderLeft: categoryFilter === category.id 
                    ? `4px solid ${theme.palette.primary.main}` 
                    : "4px solid transparent",
                  bgcolor: categoryFilter === category.id 
                    ? alpha(theme.palette.primary.main, 0.1)
                    : "transparent",
                }}
              >
                <Box sx={{ mr: 2, fontSize: "1.25rem" }}>{category.icon}</Box>
                <ListItemText 
                  primary={category.name} 
                  primaryTypographyProps={{ 
                    fontWeight: categoryFilter === category.id ? 600 : 400 
                  }}
                />
              </ListItem>
            ))}
          </List>
          <Divider />
          <List>
            <Typography variant="subtitle2" sx={{ px: 2, py: 1, color: "text.secondary" }}>
              MY ACCOUNT
            </Typography>
            <ListItem button onClick={() => { navigate("/user/profile"); setDrawerOpen(false); }}>
              <ListItemText primary="My Profile" />
            </ListItem>
            <ListItem button onClick={() => { navigate("/user/orders"); setDrawerOpen(false); }}>
              <ListItemText primary="My Orders" />
            </ListItem>
            <ListItem button onClick={() => { navigate("/user/wishlist"); setDrawerOpen(false); }}>
              <ListItemText primary="Wishlist" />
            </ListItem>
            <ListItem button onClick={() => { navigate("/user/cart"); setDrawerOpen(false); }}>
              <ListItemText primary="Shopping Cart" />
            </ListItem>
          </List>
          <Divider />
          <Box sx={{ p: 2 }}>
            <Button 
              fullWidth 
              variant="outlined" 
              color="primary" 
              onClick={handleLogout}
              sx={{ 
                textTransform: "none", 
                borderRadius: theme.shape.borderRadius * 2 
              }}
            >
              Logout
            </Button>
          </Box>
        </Box>
      </Drawer>

      {/* Hero Banner Carousel - Enhanced with better styling */}
      <Box sx={{ p: { xs: 0, md: 4 }, pt: { xs: 0, md: 4 }, pb: { xs: 4, md: 6 } }}>
        <Container maxWidth="xl" disableGutters={isMobile}>
          <Carousel carouselItems={carouselItems} />
        </Container>
      </Box>

      {/* AI Feature Highlight - Enhanced with better styling */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Paper
          elevation={0}
          sx={{
            backgroundColor: "#f8f9fa",
            p: { xs: 3, sm: 4, md: 5 },
            borderRadius: 4,
            textAlign: "center",
            mb: 4,
            backgroundImage: "linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 100%)",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.05)",
            border: "1px solid rgba(200, 200, 200, 0.2)",
          }}
        >
          <Typography
            variant="h3"
            component="h2"
            gutterBottom
            sx={{
              fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem" },
              fontWeight: 650,
              mb: 2,
              background: "#2196F3",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              display: "inline-block", 
            }}
          >
            AI-Powered Style Recommendations
          </Typography>
          <Typography
            variant="h6"
            sx={{
              mb: 4,
              maxWidth: "800px",
              mx: "auto",
              color: alpha(theme.palette.text.primary, 0.7),
              fontWeight: 400,
            }}
          >
            Discover your perfect style with our intelligent fashion assistant. Personalized outfits based on your preferences and the latest trends.
          </Typography>

          <Grid
            container
            spacing={{ xs: 3, sm: 4, md: 5 }}
            justifyContent="center"
            sx={{ mt: 2 }}
          >
            <Grid item xs={12} sm={6}>
              <Paper
                elevation={2}
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  borderRadius: 4,
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 12px 30px rgba(0, 0, 0, 0.12)",
                  },
                }}
              >
                <CardMedia
                  component="img"
                  image="/assets/ai-feature/image-left.png"
                  alt="AI Recommendation Example"
                  sx={{
                    height: { xs: 240, sm: 280, md: 320 },
                    objectFit: "cover",
                  }}
                />
                <CardContent sx={{ p: 3, flexGrow: 1 }}>
                  <Typography
                    variant="h5"
                    component="div"
                    gutterBottom
                    sx={{
                      fontWeight: 600,
                    }}
                  >
                    Fashion AI Assistant
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    Our AI stylist analyzes your preferences and helps you discover items that perfectly complement your style.
                  </Typography>
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
                    Chat with AI Stylist
                  </Button>
                </CardContent>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Paper
                elevation={2}
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  borderRadius: 4,
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 12px 30px rgba(0, 0, 0, 0.12)",
                  },
                }}
              >
                <CardMedia
                  component="img"
                  image="/assets/ai-feature/image-right.png"
                  alt="Image Upload Feature"
                  sx={{
                    height: { xs: 240, sm: 280, md: 320 },
                    objectFit: "cover",
                  }}
                />
                <CardContent sx={{ p: 3, flexGrow: 1 }}>
                  <Typography
                    variant="h5"
                    component="div"
                    gutterBottom
                    sx={{
                      fontWeight: 600,
                    }}
                  >
                    Visual Search
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    Upload an image of clothing you like and our AI will find similar items and suggest complete outfits.
                  </Typography>
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
                    Try Visual Search
                  </Button>
                </CardContent>
              </Paper>
            </Grid>
          </Grid>
        </Paper>
      </Container>

      {/* Featured Products - Enhanced with better styling */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
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
            CURATED COLLECTION
          </Typography>
          <Typography
            variant="h3"
            component="h2"
            sx={{ 
              mb: 2, 
              fontWeight: 700,
              fontSize: { xs: "2rem", sm: "2.5rem" },
            }}
          >
            {categoryFilter === "all"
              ? "Featured Products"
              : `${
                  categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1)
                }'s Collection`}
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ 
              maxWidth: 700, 
              mx: "auto",
              mb: 4,
            }}
          >
            Discover our handpicked selection of premium products, combining elegant design with exceptional quality.
          </Typography>

          {/* Category filter chips for desktop */}
          <Box 
            sx={{ 
              display: "flex", 
              flexWrap: "wrap", 
              justifyContent: "center", 
              gap: 1,
              mb: 4,
            }}
          >
            <Chip 
              label="All"
              clickable
              onClick={() => handleCategoryChange("all")}
              color={categoryFilter === "all" ? "primary" : "default"}
              sx={{ 
                fontWeight: 500,
                px: 1,
                borderRadius: "16px",
                '&.MuiChip-colorPrimary': {
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                },
              }}
            />
            {categories.map((category) => (
              <Chip
                key={category.id}
                label={category.name}
                icon={<span style={{ fontSize: "1rem", marginRight: 0 }}>{category.icon}</span>}
                clickable
                onClick={() => handleCategoryChange(category.id)}
                color={categoryFilter === category.id ? "primary" : "default"}
                sx={{ 
                  fontWeight: 500,
                  px: 1,
                  borderRadius: "16px",
                  '&.MuiChip-colorPrimary': {
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  },
                }}
              />
            ))}
          </Box>
        </Box>

        <Grid container spacing={3}>
          {filteredProducts.map((product) => (
            <Grid item key={product.id} xs={6} sm={4} md={3}>
              <ProductCard onClick={() => viewProductDetails(product.id)}>
                <Box sx={{ position: "relative", overflow: "hidden" }}>
                  {product.isSale && (
                    <StatusChip 
                      label="SALE" 
                      size="small" 
                      variant="sale"
                    />
                  )}
                  {product.isNew && (
                    <StatusChip 
                      label="NEW" 
                      size="small"
                      variant="new"
                    />
                  )}
                  <CardMedia
                    component="img"
                    image={product.image}
                    alt={product.name}
                    sx={{
                      height: 300,
                      transition: "transform 0.6s ease",
                      "&:hover": {
                        transform: "scale(1.05)",
                      },
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
                <CardContent sx={{ p: 2, pt: 3 }}>
                  <Box sx={{ mb: 0.5 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      component="div"
                      noWrap
                    >
                      {product.category.toUpperCase()}
                    </Typography>
                  </Box>
                  <Typography
                    variant="subtitle1"
                    component="div"
                    noWrap
                    sx={{ fontWeight: 500, mb: 1 }}
                  >
                    {product.name}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <Rating
                      value={product.rating}
                      precision={0.5}
                      size="small"
                      readOnly
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                      ({product.reviews})
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
                        color="text.primary"
                        sx={{ fontWeight: 600 }}
                      >
                        {product.price}
                      </Typography>
                      {product.originalPrice && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ 
                            textDecoration: "line-through",
                            ml: 1,
                          }}
                        >
                          {product.originalPrice}
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{ display: "flex" }}>
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={(e) => addToWishlist(e, product.id)}
                        sx={{ 
                          mr: 0.5,
                          transition: "all 0.2s",
                          "&:hover": { transform: "scale(1.1)" },
                        }}
                      >
                        <FavoriteBorder fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={(e) => addToCart(e, product.id)}
                        sx={{ 
                          transition: "all 0.2s",
                          "&:hover": { transform: "scale(1.1)" },
                        }}
                      >
                        <AddShoppingCart fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </ProductCard>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
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
            View All Products
          </Button>
        </Box>
      </Container>

      {/* Email Subscription - Enhanced with better styling */}
      <Box 
        sx={{ 
          py: 8, 
          mb: 6,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.2)} 0%, ${alpha(theme.palette.primary.main, 0.4)} 100%)`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Container maxWidth="md" sx={{ position: "relative", zIndex: 1 }}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: { xs: 3, md: 5 }, 
              borderRadius: 4,
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(10px)",
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
              textAlign: "center",
            }}
          >
            <Typography variant="h4" gutterBottom fontWeight={600}>
              Join Our Fashion Community
            </Typography>
            <Typography
              variant="subtitle1"
              color="text.secondary"
              paragraph
              sx={{ mb: 4, maxWidth: "600px", mx: "auto" }}
            >
              Subscribe to our newsletter to receive updates on new arrivals, exclusive offers, and AI-powered style tips tailored just for you.
            </Typography>
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
              <TextField
                variant="outlined"
                required
                placeholder="Enter your email address"
                name="email"
                autoComplete="email"
                sx={{ 
                  width: { xs: "100%", sm: "60%" },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: theme.shape.borderRadius * 3,
                  },
                }}
              />
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
                Subscribe
              </Button>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2 }}>
              We respect your privacy and will never share your information.
            </Typography>
          </Paper>
        </Container>
      </Box>

      {/* Footer - Enhanced with better styling */}
      <Box 
        component="footer" 
        sx={{ 
          bgcolor: "#f8f9fa",
          borderTop: "1px solid #e0e0e0",
          py: 6 
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} justifyContent="space-between">
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <ShoppingBag 
                  sx={{ 
                    color: theme.palette.primary.main, 
                    mr: 1,
                    fontSize: "2rem" 
                  }} 
                />
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 700,
                    color: theme.palette.primary.main,
                  }}
                >
                  LUXE
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                Your premium AI-powered fashion discovery platform. We combine cutting-edge technology with curated fashion to create a personalized shopping experience.
              </Typography>
              <Box sx={{ display: "flex", gap: 1, mt: 3 }}>
                <IconButton 
                  size="small" 
                  sx={{ 
                    color: "#3b5998",
                    bgcolor: alpha("#3b5998", 0.1),
                    "&:hover": { bgcolor: alpha("#3b5998", 0.2) },
                  }}
                >
                  <Facebook fontSize="small" />
                </IconButton>
                <IconButton 
                  size="small" 
                  sx={{ 
                    color: "#1da1f2",
                    bgcolor: alpha("#1da1f2", 0.1),
                    "&:hover": { bgcolor: alpha("#1da1f2", 0.2) },
                  }}
                >
                  <Twitter fontSize="small" />
                </IconButton>
                <IconButton 
                  size="small" 
                  sx={{ 
                    color: "#c32aa3",
                    bgcolor: alpha("#c32aa3", 0.1),
                    "&:hover": { bgcolor: alpha("#c32aa3", 0.2) },
                  }}
                >
                  <Instagram fontSize="small" />
                </IconButton>
                <IconButton 
                  size="small" 
                  sx={{ 
                    color: "#bd081c",
                    bgcolor: alpha("#bd081c", 0.1),
                    "&:hover": { bgcolor: alpha("#bd081c", 0.2) },
                  }}
                >
                  <Pinterest fontSize="small" />
                </IconButton>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                Shop
              </Typography>
              <Typography 
                variant="body2" 
                component="div" 
                sx={{ 
                  display: "flex",
                  flexDirection: "column",
                  "& > *": { mb: 1.5 },
                }}
              >
                <Link 
                  href="#" 
                  color="inherit" 
                  underline="hover"
                  sx={{ color: "text.secondary" }}
                >
                  Women
                </Link>
                <Link 
                  href="#" 
                  color="inherit" 
                  underline="hover"
                  sx={{ color: "text.secondary" }}
                >
                  Men
                </Link>
                <Link 
                  href="#" 
                  color="inherit" 
                  underline="hover"
                  sx={{ color: "text.secondary" }}
                >
                  Kids
                </Link>
                <Link 
                  href="#" 
                  color="inherit" 
                  underline="hover"
                  sx={{ color: "text.secondary" }}
                >
                  Accessories
                </Link>
                <Link 
                  href="#" 
                  color="inherit" 
                  underline="hover"
                  sx={{ color: "text.secondary" }}
                >
                  New Arrivals
                </Link>
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                Help
              </Typography>
              <Typography 
                variant="body2" 
                component="div" 
                sx={{ 
                  display: "flex",
                  flexDirection: "column",
                  "& > *": { mb: 1.5 },
                }}
              >
                <Link 
                  href="#" 
                  color="inherit" 
                  underline="hover"
                  sx={{ color: "text.secondary" }}
                >
                  Customer Service
                </Link>
                <Link 
                  href="#" 
                  color="inherit" 
                  underline="hover"
                  sx={{ color: "text.secondary" }}
                >
                  My Account
                </Link>
                <Link 
                  href="#" 
                  color="inherit" 
                  underline="hover"
                  sx={{ color: "text.secondary" }}
                >
                  Find a Store
                </Link>
                <Link 
                  href="#" 
                  color="inherit" 
                  underline="hover"
                  sx={{ color: "text.secondary" }}
                >
                  Size Guide
                </Link>
                <Link 
                  href="#" 
                  color="inherit" 
                  underline="hover"
                  sx={{ color: "text.secondary" }}
                >
                  FAQ
                </Link>
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                About
              </Typography>
              <Typography 
                variant="body2" 
                component="div" 
                sx={{ 
                  display: "flex",
                  flexDirection: "column",
                  "& > *": { mb: 1.5 },
                }}
              >
                <Link 
                  href="#" 
                  color="inherit" 
                  underline="hover"
                  sx={{ color: "text.secondary" }}
                >
                  Our Story
                </Link>
                <Link 
                  href="#" 
                  color="inherit" 
                  underline="hover"
                  sx={{ color: "text.secondary" }}
                >
                  Careers
                </Link>
                <Link 
                  href="#" 
                  color="inherit" 
                  underline="hover"
                  sx={{ color: "text.secondary" }}
                >
                  Corporate News
                </Link>
                <Link 
                  href="#" 
                  color="inherit" 
                  underline="hover"
                  sx={{ color: "text.secondary" }}
                >
                  Sustainability
                </Link>
                <Link 
                  href="#" 
                  color="inherit" 
                  underline="hover"
                  sx={{ color: "text.secondary" }}
                >
                  Investors
                </Link>
              </Typography>
            </Grid>
          </Grid>
          <Divider sx={{ my: 4 }} />
          <Box 
            sx={{ 
              display: "flex", 
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary" 
              sx={{ 
                mb: { xs: 2, sm: 0 },
                textAlign: { xs: "center", sm: "left" },
              }}
            >
              © {new Date().getFullYear()} LUXE. All rights reserved.
            </Typography>
            <Box 
              sx={{ 
                display: "flex", 
                gap: 3,
                flexWrap: "wrap",
                justifyContent: { xs: "center", sm: "flex-end" },
              }}
            >
              <Link 
                href="#" 
                color="inherit" 
                underline="hover" 
                variant="body2"
                sx={{ color: "text.secondary" }}
              >
                Privacy Policy
              </Link>
              <Link 
                href="#" 
                color="inherit" 
                underline="hover" 
                variant="body2"
                sx={{ color: "text.secondary" }}
              >
                Terms of Service
              </Link>
              <Link 
                href="#" 
                color="inherit" 
                underline="hover" 
                variant="body2"
                sx={{ color: "text.secondary" }}
              >
                Cookies
              </Link>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Floating Chat Button - Enhanced with better styling */}
      <Fab
        color="primary"
        aria-label="chat with ai"
        onClick={handleOpenChat}
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 1000,
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
          "&:hover": {
            transform: "scale(1.05)",
          },
          transition: "transform 0.2s ease",
        }}
      >
        <Chat />
      </Fab>

      {/* AI Chatbot Dialog - Now passing username */}
      <ImageRecommenderChat open={chatOpen} onClose={handleCloseChat} username={username} />
    </Box>
  );
};

export default UserDashboard;