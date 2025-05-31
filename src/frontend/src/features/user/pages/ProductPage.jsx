import React, { useState, useEffect } from "react";
import { useParams, Link as RouterLink, useNavigate } from "react-router-dom"; // Use RouterLink
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
  Badge,
  Snackbar,
  Alert,
  Grow,
  useTheme,
} from "@mui/material";

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
  AddShoppingCart,
  CheckCircle,
  ZoomIn,
  ZoomOut,
  ArrowForward,
  ArrowBack,
} from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import { useSelector, useDispatch } from "react-redux";
import { addItemToCart } from "../../cart/cartSlice.js";
import {
  addToWishlist,
  removeFromWishlist,
  selectIsInWishlist,
  fetchWishlist, // Import fetchWishlist if needed here
} from "../../wishlist/wishlistSlice.js"; // <-- Adjust path as needed

const ProductImageContainer = styled(Box)(({ theme }) => ({
  position: "relative",
  overflow: "hidden",
  height: "600px",
  backgroundColor:
    theme.palette.mode === "dark"
      ? theme.palette.grey[900]
      : theme.palette.grey[100],
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: theme.shape.borderRadius,
}));

const ProductImage = styled("img")(({ theme, zoomed }) => ({
  maxWidth: "100%",
  maxHeight: "100%",
  objectFit: "contain",
  transition: "transform 0.5s ease-in-out",
  transform: zoomed ? "scale(1.5)" : "scale(1)",
  cursor: zoomed ? "zoom-out" : "zoom-in",
}));

const ThumbnailContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(1),
  marginTop: theme.spacing(2),
}));

const Thumbnail = styled(Box)(({ theme, active }) => ({
  width: "60px",
  height: "60px",
  border: active
    ? `2px solid ${theme.palette.secondary.main}`
    : `1px solid ${theme.palette.divider}`,
  padding: "2px",
  cursor: "pointer",
  transition: "all 0.2s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: theme.shadows[2],
  },
  "& img": {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
}));

const ImageNavButton = styled(IconButton)(({ theme, direction }) => ({
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  backgroundColor: alpha(theme.palette.background.paper, 0.8),
  color: theme.palette.text.primary,
  boxShadow: theme.shadows[2],
  left: direction === "prev" ? "10px" : "auto",
  right: direction === "next" ? "10px" : "auto",
  zIndex: 2,
  "&:hover": {
    backgroundColor: alpha(theme.palette.background.paper, 0.95),
  },
}));

const ZoomButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  bottom: "10px",
  right: "10px",
  backgroundColor: alpha(theme.palette.background.paper, 0.8),
  color: theme.palette.text.primary,
  boxShadow: theme.shadows[2],
  zIndex: 2,
  "&:hover": {
    backgroundColor: alpha(theme.palette.background.paper, 0.95),
  },
}));

const DetailItemContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.5), // Slightly reduced gap
  marginBottom: theme.spacing(1.5), // Slightly reduced margin
  transition: "transform 0.3s ease",
  //   '&:hover': { // Optional hover effect
  //     transform: 'translateX(3px)',
  //   },
}));

const DetailIconContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: "24px", // Ensure icon has space
  "& svg": {
    color: theme.palette.secondary.main,
    fontSize: "18px", // Slightly smaller icon
  },
}));

const AddToCartButton = styled(Button)(({ theme }) => ({
  width: "100%",
  height: "48px",
  position: "relative",
  overflow: "hidden",
  transition: "all 0.3s ease",
  background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
  color: theme.palette.primary.contrastText,
  borderRadius: theme.shape.borderRadius * 4,
  "&::after": {
    content: '""',
    position: "absolute",
    top: 0,
    left: -100,
    width: "100%",
    height: "100%",
    background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.primary.contrastText, 0.15)}, transparent)`,
    transition: "0.5s",
  },
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.9),
    boxShadow: theme.shadows[4],
  },
  "&:hover::after": {
    left: "120%",
  },
}));

const FavoriteButton = styled(IconButton)(({ theme, isFavorite }) => ({
  backgroundColor: isFavorite
    ? alpha(theme.palette.error.main, 0.1)
    : "transparent",
  transition: "all 0.3s ease",
  "&:hover": {
    backgroundColor: isFavorite
      ? alpha(theme.palette.error.main, 0.2)
      : theme.palette.action.hover,
    transform: "scale(1.1)",
  },
  color: isFavorite ? theme.palette.error.main : theme.palette.action.active,
}));

const ProductInfoContainer = styled(Box)(({ theme }) => ({
  paddingLeft: theme.spacing(4),
  [theme.breakpoints.down("md")]: {
    paddingLeft: 0,
    marginTop: theme.spacing(4),
  },
}));

const SizeButton = styled(Button)(({ theme, selected }) => ({
  minWidth: "48px",
  height: "48px",
  margin: theme.spacing(0.5),
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  transition: "all 0.3s ease",
  backgroundColor: selected ? theme.palette.primary.main : "transparent",
  color: selected
    ? theme.palette.primary.contrastText
    : theme.palette.text.primary,
  "&:hover": {
    backgroundColor: selected
      ? theme.palette.primary.light
      : theme.palette.action.hover,
    transform: "translateY(-2px)",
    boxShadow: theme.shadows[1],
    borderColor: selected ? theme.palette.primary.light : theme.palette.divider,
  },
}));

// ColorCircle - kept for potential future use but commented out in render
const ColorCircle = styled(Box)(({ bgcolor, selected, theme }) => ({
  width: "32px",
  height: "32px",
  borderRadius: "50%",
  backgroundColor: bgcolor || theme.palette.action.disabledBackground,
  margin: "4px",
  cursor: "pointer",
  border: selected
    ? `2px solid ${theme.palette.secondary.main}`
    : `1px solid ${theme.palette.divider}`,
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "scale(1.1)",
    boxShadow: theme.shadows[2],
  },
}));

const AccordionRoot = styled(Accordion)(({ theme }) => ({
  transition: "all 0.3s ease",
  backgroundColor: "transparent",
  boxShadow: "none",
  "&::before": {
    backgroundColor: theme.palette.divider,
    opacity: 1,
  },
  "&.Mui-expanded": {
    boxShadow: "none",
    backgroundColor: "transparent",
    margin: 0,
  },
  "&:first-of-type": { "&::before": { display: "none" } },
  "&.Mui-expanded:last-of-type": {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  position: "relative",
  display: "inline-block",
  marginBottom: theme.spacing(4),
  textAlign: "center",
  color: theme.palette.text.primary,
  "&:after": {
    content: '""',
    position: "absolute",
    bottom: "-12px",
    left: "50%",
    width: "40px",
    height: "2px",
    backgroundColor: theme.palette.secondary.main,
    transform: "translateX(-50%)",
  },
}));

const RecommendationCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
  border: `1px solid transparent`,
  overflow: "hidden",
  backgroundColor: theme.palette.background.paper,
  "&:hover": {
    transform: "translateY(-8px)",
    borderColor: theme.palette.divider,
    boxShadow: theme.shadows[3],
  },
}));

const RecommendationMedia = styled(CardMedia)(({ theme }) => ({
  height: 320, // Adjust height as needed
  backgroundSize: "cover",
  transition: "transform 0.5s ease",
  "&:hover": {
    transform: "scale(1.03)",
  },
}));

const QuickInfo = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(3),
  marginBottom: theme.spacing(3),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.action.hover,
  borderRadius: theme.shape.borderRadius,
}));

const QuickInfoItem = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
}));

const BreadcrumbLink = styled(RouterLink)(({ theme }) => ({
  textDecoration: "none",
  color: theme.palette.text.secondary,
  display: "flex",
  alignItems: "center",
  transition: "color 0.2s ease",
  "&:hover": {
    color: theme.palette.secondary.main,
  },
}));

const DetailItem = ({ icon, title, value }) => {
  const theme = useTheme();
  return (
    <DetailItemContainer>
      <DetailIconContainer>{icon}</DetailIconContainer>
      <Box>
        <Typography
          variant="caption"
          color="textSecondary"
          sx={{ textTransform: "uppercase" }}
        >
          {title}
        </Typography>
        <Typography variant="body2" fontWeight="500">
          {value || "N/A"}
        </Typography>
      </Box>
    </DetailItemContainer>
  );
};

// --- Main Product Page Component ---

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [recommendations, setRecommendations] = useState({}); // Store the recommendations object { Category: [items] }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  // const [selectedColor, setSelectedColor] = useState(null); // State for color if needed later
  const [zoomed, setZoomed] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const theme = useTheme();
  const navigate = useNavigate(); // Import and use navigate for recommendations
  const dispatch = useDispatch();

  // --- ADD THESE LINES ---
  // Get wishlist status from Redux
  // Check product?.id exists before calling selector
  const isCurrentlyInWishlist = useSelector((state) =>
    product?.id ? selectIsInWishlist(state, product.id) : false,
  );
  const wishlistStatus = useSelector((state) => state.wishlist.status); // To disable button while loading
  // ----------------------

  // Available sizes (assuming static for now)
  const sizes = ["XS", "S", "M", "L", "XL"]; // Adjust if API provides sizes

  // Function to generate "additional" images (demo only - uses same image)
  const generateAdditionalImages = (mainImageUrl) => {
    const baseUrl = "http://localhost:8000";
    if (!mainImageUrl) return [`${baseUrl}/static/images/placeholder.jpg`]; // Provide a placeholder

    const imagePath = mainImageUrl.startsWith(baseUrl)
      ? mainImageUrl.substring(baseUrl.length)
      : mainImageUrl;
    const fullUrl = `${baseUrl}${imagePath}`;

    // Return array with the main image duplicated (replace with actual logic if API provides more)
    return [fullUrl, fullUrl, fullUrl];
  };

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      setError(null);
      setProduct(null);
      setRecommendations({});
      setCurrentImageIndex(0);
      setZoomed(false);
      setSelectedSize("");

      const baseUrl = "http://localhost:8000";

      try {
        const response = await fetch(`${baseUrl}/api/product/${id}`);
        if (!response.ok) {
          throw new Error(
            `API error: ${response.status} ${response.statusText}`,
          );
        }
        const data = await response.json();

        if (!data || !data.product) {
          throw new Error(`Product with ID ${id} not found.`);
        }

        // Process main product
        const productWithFullUrl = {
          ...data.product,
          image_url: data.product.image_url?.startsWith("http")
            ? data.product.image_url
            : `${baseUrl}${data.product.image_url}`,
        };
        setProduct(productWithFullUrl);

        // Process recommendations
        const rawRecommendations = data.recommendations?.recommendations; // Access nested object
        const processedRecommendations = {};
        if (rawRecommendations && typeof rawRecommendations === "object") {
          for (const category in rawRecommendations) {
            processedRecommendations[category] = (
              rawRecommendations[category] || []
            ).map((item) => ({
              ...item,
              image_url: item.image_url?.startsWith("http")
                ? item.image_url
                : `${baseUrl}${item.image_url}`,
            }));
          }
        }
        setRecommendations(processedRecommendations);
      } catch (err) {
        console.error("Error fetching product details:", err);
        setError(err.message || "Failed to load product details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]); // Re-fetch when ID changes

  useEffect(() => {
    // Only fetch if status is 'idle' to prevent refetching unnecessarily
    if (wishlistStatus === "idle") {
      console.log("Fetching initial wishlist...");
      dispatch(fetchWishlist());
    }
  }, [dispatch, wishlistStatus]); // Depend on dispatch and status

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
  };

  const handleQuantityChange = (event) => {
    const value = parseInt(event.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setQuantity(value);
    }
  };

  const handleToggleFavorite = () => {
    // Prevent action if product ID is missing or wishlist is updating
    if (!product?.id || wishlistStatus === "loading") {
      console.warn(
        "Cannot toggle favorite: Missing product ID or wishlist is loading.",
      );
      return;
    }

    const idToAdd = product.id;

    // Decide action based on current Redux state
    if (isCurrentlyInWishlist) {
      // Dispatch REMOVE action
      console.log(
        `Dispatching removeFromWishlist for productId: ${product.id}`,
      );
      dispatch(removeFromWishlist(idToAdd));
      setSnackbarMessage("Removed from Wishlist"); // Keep snackbar logic
    } else {
      // Dispatch ADD action
      console.log(`Dispatching addToWishlist for productId: ${product.id}`);
      dispatch(addToWishlist(idToAdd));
      setSnackbarMessage("Added to Wishlist"); // Keep snackbar logic
    }

    // Show snackbar immediately for feedback
    setShowSnackbar(true); // Keep snackbar logic
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      setSnackbarMessage("Please select a size");
      setShowSnackbar(true);
      return;
    }

    const itemToAdd = {
      productId: product.id,
      quantity: quantity,
      price: product.price, // Make sure product.price has a value here
      size: selectedSize,
      color: product.baseColour || null,
    };

    console.log("Dispatching addItemToCart with:", itemToAdd); // <-- ADD THIS LOG
    dispatch(addItemToCart(itemToAdd));

    console.log(
      `Added ${quantity} x ${product.productDisplayName} (Size: ${selectedSize}) to cart`,
    );
    setSnackbarMessage(`Added ${quantity} item(s) to your bag`);
    setShowSnackbar(true);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;
    setShowSnackbar(false);
  };

  const handleToggleZoom = () => setZoomed(!zoomed);

  const handlePrevImage = () => {
    if (!product || !product.image_url) return;
    const images = generateAdditionalImages(product.image_url);
    if (images.length <= 1) return;
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1,
    );
    setZoomed(false);
  };

  const handleNextImage = () => {
    if (!product || !product.image_url) return;
    const images = generateAdditionalImages(product.image_url);
    if (images.length <= 1) return;
    setCurrentImageIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1,
    );
    setZoomed(false);
  };

  const handleThumbnailClick = (index) => {
    setCurrentImageIndex(index);
    setZoomed(false);
  };

  // --- Loading State ---
  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 6 }}>
        <Grid container spacing={6}>
          <Grid item xs={12} md={6}>
            <Skeleton
              variant="rectangular"
              height={600}
              animation="wave"
              sx={{ borderRadius: theme.shape.borderRadius }}
            />
            <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
              {[1, 2, 3].map((item) => (
                <Skeleton
                  key={item}
                  variant="rectangular"
                  width={60}
                  height={60}
                  animation="wave"
                  sx={{ borderRadius: theme.shape.borderRadius }}
                />
              ))}
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            {/* Changed Skeleton height/width to match new h4 expectation */}
            <Skeleton variant="text" height={40} width="80%" animation="wave" />
            <Skeleton
              variant="text"
              height={30}
              width="40%"
              animation="wave"
              sx={{ mb: 2 }}
            />
            <Skeleton
              variant="text"
              height={40}
              width="30%"
              animation="wave"
              sx={{ mb: 3 }}
            />
            <Skeleton
              variant="rectangular"
              height={1}
              width="100%"
              sx={{ my: 3 }}
              animation="wave"
            />
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              {" "}
              <Skeleton width={100} animation="wave" />{" "}
            </Typography>
            <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
              {" "}
              {[1, 2, 3, 4, 5].map((item) => (
                <Skeleton
                  key={item}
                  variant="rectangular"
                  width={48}
                  height={48}
                  animation="wave"
                  sx={{ borderRadius: theme.shape.borderRadius }}
                />
              ))}{" "}
            </Box>
            <Skeleton
              variant="rectangular"
              height={48}
              width="100%"
              sx={{ mt: 4, borderRadius: theme.shape.borderRadius * 4 }}
              animation="wave"
            />
          </Grid>
        </Grid>
      </Container>
    );
  }

  // --- Error State ---
  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 6 }}>
        <Alert severity="error" sx={{ borderRadius: theme.shape.borderRadius }}>
          {" "}
          Error: {error}{" "}
        </Alert>
      </Container>
    );
  }

  // --- Product Not Found State ---
  if (!product) {
    return (
      <Container maxWidth="xl" sx={{ py: 6 }}>
        <Alert severity="info" sx={{ borderRadius: theme.shape.borderRadius }}>
          {" "}
          Product not found.{" "}
        </Alert>
      </Container>
    );
  }

  const productImages = generateAdditionalImages(product.image_url);
  const currentImage =
    productImages.length > 0 ? productImages[currentImageIndex] : "";
  const price = product.price ? product.price.toFixed(2) : "N/A";
  const recommendationCategories = Object.keys(recommendations);

  // --- Render Product Page ---
  return (
    <>
      <Container maxWidth="xl" sx={{ py: { xs: 3, md: 6 } }}>
        {/* Breadcrumbs */}
        <Fade in={true} timeout={800}>
          <Breadcrumbs
            separator={<NavigateNext fontSize="small" />}
            aria-label="breadcrumb"
            sx={{ mb: 4 }}
          >
            <BreadcrumbLink to="/">
              {" "}
              <Typography variant="body2">Home</Typography>{" "}
            </BreadcrumbLink>
            <BreadcrumbLink to={`/products?category=${product.masterCategory}`}>
              {" "}
              <Typography variant="body2">
                {product.masterCategory}
              </Typography>{" "}
            </BreadcrumbLink>
            <BreadcrumbLink to={`/products?subCategory=${product.subCategory}`}>
              {" "}
              <Typography variant="body2">
                {product.subCategory}
              </Typography>{" "}
            </BreadcrumbLink>
            <Typography variant="body2" color="text.primary">
              {product.productDisplayName}
            </Typography>
          </Breadcrumbs>
        </Fade>

        <Grid container spacing={{ xs: 3, md: 6 }}>
          {/* Product Image Section */}
          <Grid item xs={12} md={6}>
            <Fade in={true} timeout={800}>
              <Box>
                <ProductImageContainer>
                  {productImages.length > 1 && (
                    <ImageNavButton direction="prev" onClick={handlePrevImage}>
                      {" "}
                      <ArrowBack fontSize="small" />{" "}
                    </ImageNavButton>
                  )}
                  <ProductImage
                    src={currentImage}
                    alt={product.productDisplayName}
                    zoomed={zoomed}
                    onClick={handleToggleZoom}
                  />
                  {productImages.length > 1 && (
                    <ImageNavButton direction="next" onClick={handleNextImage}>
                      {" "}
                      <ArrowForward fontSize="small" />{" "}
                    </ImageNavButton>
                  )}
                  <ZoomButton onClick={handleToggleZoom}>
                    {" "}
                    {zoomed ? <ZoomOut /> : <ZoomIn />}{" "}
                  </ZoomButton>
                </ProductImageContainer>

                {productImages.length > 1 && (
                  <ThumbnailContainer>
                    {" "}
                    {productImages.map((img, index) => (
                      <Thumbnail
                        key={index}
                        active={index === currentImageIndex}
                        onClick={() => handleThumbnailClick(index)}
                      >
                        {" "}
                        <img
                          src={img}
                          alt={`${product.productDisplayName} thumbnail ${index + 1}`}
                        />{" "}
                      </Thumbnail>
                    ))}{" "}
                  </ThumbnailContainer>
                )}
              </Box>
            </Fade>
          </Grid>

          {/* Product Details Section */}
          <Grid item xs={12} md={6}>
            <Fade in={true} timeout={1000}>
              <ProductInfoContainer>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 2,
                  }}
                >
                  <Box>
                    {/* ===== (A) CHANGED VARIANT HERE ===== */}
                    <Typography
                      variant="h4" // Changed from h1 to h4
                      sx={{ mb: 1, color: "text.primary" }}
                    >
                      {" "}
                      {product.productDisplayName}{" "}
                    </Typography>
                    {/* Removed Rating */}
                    <Typography
                      variant="h4" // Keep price prominent
                      color="secondary.main"
                      sx={{ fontWeight: 600 }}
                      gutterBottom
                    >
                      {" "}
                      ₹{price}{" "}
                    </Typography>
                  </Box>
                  <Box>
                    <Tooltip
                      // Update tooltip based on Redux state
                      title={
                        isCurrentlyInWishlist
                          ? "Remove from Wishlist"
                          : "Add to Wishlist"
                      }
                    >
                      {/* Wrap in span to ensure tooltip shows even when button is disabled */}
                      <span>
                        <FavoriteButton
                          aria-label="add to wishlist"
                          onClick={handleToggleFavorite}
                          // Use Redux state for appearance
                          isFavorite={isCurrentlyInWishlist}
                          // Disable button while wishlist status is loading
                          disabled={wishlistStatus === "loading"}
                        >
                          {/* Update icon based on Redux state */}
                          {isCurrentlyInWishlist ? (
                            <Favorite />
                          ) : (
                            <FavoriteBorder />
                          )}
                        </FavoriteButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Share">
                      {" "}
                      <IconButton aria-label="share" color="inherit">
                        {" "}
                        <Share />{" "}
                      </IconButton>{" "}
                    </Tooltip>
                  </Box>
                </Box>
                <Divider sx={{ borderColor: "divider" }} />
                <QuickInfo>
                  {" "}
                  <QuickInfoItem>
                    {" "}
                    <LocalShipping
                      sx={{ fontSize: 20, color: "text.secondary", mb: 0.5 }}
                    />{" "}
                    <Typography variant="caption">
                      Free Shipping
                    </Typography>{" "}
                  </QuickInfoItem>{" "}
                  <QuickInfoItem>
                    {" "}
                    <Loop
                      sx={{ fontSize: 20, color: "text.secondary", mb: 0.5 }}
                    />{" "}
                    <Typography variant="caption">
                      30 Day Returns
                    </Typography>{" "}
                  </QuickInfoItem>{" "}
                  <QuickInfoItem>
                    {" "}
                    <Loyalty
                      sx={{ fontSize: 20, color: "text.secondary", mb: 0.5 }}
                    />{" "}
                    <Typography variant="caption">
                      Loyalty Points
                    </Typography>{" "}
                  </QuickInfoItem>{" "}
                </QuickInfo>

                {/* Size Selection */}
                <Box sx={{ my: 3 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      mb: 1,
                      display: "flex",
                      alignItems: "center",
                      color: "text.secondary",
                    }}
                  >
                    {" "}
                    SIZE:{" "}
                    <Typography
                      component="span"
                      sx={{ ml: 1, fontWeight: "bold", color: "text.primary" }}
                    >
                      {selectedSize || "Select Size"}
                    </Typography>{" "}
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap" }}>
                    {" "}
                    {sizes.map((size) => (
                      <SizeButton
                        key={size}
                        variant="outlined"
                        selected={selectedSize === size}
                        onClick={() => handleSizeSelect(size)}
                      >
                        {" "}
                        {size}{" "}
                      </SizeButton>
                    ))}{" "}
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{ mt: 1, display: "block" }}
                  >
                    {" "}
                    <RouterLink
                      to="/size-guide"
                      style={{
                        color: theme.palette.text.secondary,
                        textDecoration: "none",
                        borderBottom: `1px solid ${theme.palette.divider}`,
                      }}
                    >
                      {" "}
                      Size Guide{" "}
                    </RouterLink>{" "}
                  </Typography>
                </Box>

                {/* Quantity */}
                <Box sx={{ my: 3 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 1, color: "text.secondary" }}
                  >
                    {" "}
                    QUANTITY{" "}
                  </Typography>
                  <RadioGroup
                    row
                    value={quantity}
                    onChange={handleQuantityChange}
                  >
                    {" "}
                    {[1, 2, 3, 4, 5].map((value) => (
                      <FormControlLabel
                        key={value}
                        value={value}
                        control={
                          <Radio
                            size="small"
                            sx={{
                              color: theme.palette.text.secondary,
                              "&.Mui-checked": {
                                color: theme.palette.secondary.main,
                              },
                            }}
                          />
                        }
                        label={<Typography variant="body2">{value}</Typography>}
                      />
                    ))}{" "}
                  </RadioGroup>
                </Box>

                {/* Add to Cart */}
                <Box sx={{ my: 3 }}>
                  <AddToCartButton
                    startIcon={<AddShoppingCart />}
                    onClick={handleAddToCart}
                    disabled={!selectedSize}
                  >
                    {" "}
                    Add to Bag{" "}
                  </AddToCartButton>
                  {!selectedSize && (
                    <Typography
                      variant="caption"
                      color="error"
                      sx={{ display: "block", mt: 1, textAlign: "center" }}
                    >
                      {" "}
                      Please select a size{" "}
                    </Typography>
                  )}
                </Box>

                {/* Accordions */}
                <Box sx={{ mt: 4 }}>
                  <AccordionRoot defaultExpanded>
                    <AccordionSummary
                      expandIcon={<ExpandMore />}
                      aria-controls="product-details-content"
                      id="product-details-header"
                    >
                      {" "}
                      <Typography variant="subtitle1">
                        Product Details
                      </Typography>{" "}
                    </AccordionSummary>
                    <AccordionDetails>
                      {" "}
                      <Grid container spacing={2}>
                        {" "}
                        <Grid item xs={12} sm={6}>
                          {" "}
                          <DetailItem
                            icon={<ColorLens />}
                            title="COLOR"
                            value={product.baseColour}
                          />{" "}
                        </Grid>{" "}
                        <Grid item xs={12} sm={6}>
                          {" "}
                          <DetailItem
                            icon={<Category />}
                            title="CATEGORY"
                            value={product.subCategory}
                          />{" "}
                        </Grid>{" "}
                        <Grid item xs={12} sm={6}>
                          {" "}
                          <DetailItem
                            icon={<CalendarToday />}
                            title="SEASON"
                            value={product.season}
                          />{" "}
                        </Grid>{" "}
                        <Grid item xs={12} sm={6}>
                          {" "}
                          <DetailItem
                            icon={<AccessTime />}
                            title="USAGE"
                            value={product.usage}
                          />{" "}
                        </Grid>{" "}
                      </Grid>{" "}
                    </AccordionDetails>
                  </AccordionRoot>
                  <AccordionRoot>
                    <AccordionSummary
                      expandIcon={<ExpandMore />}
                      aria-controls="shipping-returns-content"
                      id="shipping-returns-header"
                    >
                      {" "}
                      <Typography variant="subtitle1">
                        Shipping & Returns
                      </Typography>{" "}
                    </AccordionSummary>
                    <AccordionDetails>
                      {" "}
                      <Grid container spacing={2}>
                        {" "}
                        <Grid item xs={12}>
                          {" "}
                          <DetailItem
                            icon={<LocalShipping />}
                            title="SHIPPING"
                            value="Free standard shipping"
                          />{" "}
                        </Grid>{" "}
                        <Grid item xs={12}>
                          {" "}
                          <DetailItem
                            icon={<Loop />}
                            title="RETURNS"
                            value="Easy 30-day returns"
                          />{" "}
                        </Grid>{" "}
                      </Grid>{" "}
                    </AccordionDetails>
                  </AccordionRoot>
                </Box>
              </ProductInfoContainer>
            </Fade>
          </Grid>
        </Grid>

        {/* Recommendations Section */}
        {recommendationCategories.length > 0 && (
          <Box sx={{ mt: 8, mb: 4, pb: 8, pt: 9 }}>
            <Fade in={true} timeout={1200}>
              <div>
                <SectionTitle
                  variant="h2"
                  sx={{ width: "100%", mb: 6, textAlign: "center" }}
                >
                  {" "}
                  Complete Your Look{" "}
                </SectionTitle>
                {/* ===== (B) MODIFIED TABS HERE ===== */}
                <Tabs
                  value={selectedTab}
                  onChange={handleTabChange}
                  variant="scrollable" // Added for horizontal scroll
                  scrollButtons="auto" // Show buttons automatically
                  // centered // Removed centered prop
                  sx={{
                    mb: 4,
                    // Optional: Add borderBottom for visual separation if needed
                    // borderBottom: 1,
                    // borderColor: 'divider',
                    // Add some padding around the tabs container if buttons overlap content below
                    // pb: 1,
                  }}
                  TabIndicatorProps={{
                    sx: {
                      backgroundColor: "secondary.main",
                      transition: "all 0.3s ease",
                    },
                  }}
                  textColor="inherit"
                >
                  {recommendationCategories.map((category, index) => (
                    <Tab
                      key={category}
                      label={category.toUpperCase()}
                      id={`category-tab-${index}`}
                      sx={{
                        "&.Mui-selected": { color: "secondary.main" },
                        "&:hover": { bgcolor: "action.hover" },
                      }}
                    />
                  ))}
                </Tabs>
              </div>
            </Fade>

            {recommendationCategories.map((category, index) => (
              <Box
                key={category}
                role="tabpanel"
                hidden={selectedTab !== index}
                id={`tabpanel-${index}`}
              >
                {selectedTab === index && (
                  <Grid container spacing={3}>
                    {(recommendations[category] || []).map(
                      (item, itemIndex) => (
                        <Grid
                          item
                          xs={6}
                          sm={4}
                          md={3}
                          key={item.id || itemIndex}
                        >
                          <Grow
                            in={true}
                            style={{ transformOrigin: "0 0 0" }}
                            timeout={500 + itemIndex * 100}
                          >
                            <RecommendationCard>
                              <CardActionArea
                                component={RouterLink}
                                to={`/product/${item.id}`}
                              >
                                <Box
                                  sx={{
                                    position: "relative",
                                    overflow: "hidden",
                                  }}
                                >
                                  <RecommendationMedia
                                    component="img"
                                    image={item.image_url}
                                    alt={item.productDisplayName}
                                  />
                                  <IconButton
                                    sx={{
                                      position: "absolute",
                                      top: 10,
                                      right: 10,
                                      backgroundColor: alpha(
                                        theme.palette.background.paper,
                                        0.8,
                                      ),
                                      color: theme.palette.text.secondary,
                                      "&:hover": {
                                        backgroundColor: alpha(
                                          theme.palette.background.paper,
                                          0.95,
                                        ),
                                      },
                                    }}
                                  >
                                    {" "}
                                    <FavoriteBorder fontSize="small" />{" "}
                                  </IconButton>
                                </Box>
                                <Box sx={{ p: 2 }}>
                                  <Typography
                                    variant="body2"
                                    fontWeight="600"
                                    gutterBottom
                                    noWrap
                                  >
                                    {" "}
                                    {item.productDisplayName}{" "}
                                  </Typography>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                      mt: 1,
                                    }}
                                  >
                                    <Typography
                                      variant="subtitle2"
                                      color="secondary"
                                    >
                                      {" "}
                                      ₹
                                      {item.price
                                        ? item.price.toFixed(2)
                                        : "N/A"}{" "}
                                    </Typography>
                                    <Chip
                                      label="View"
                                      size="small"
                                      color="primary"
                                      sx={{
                                        minWidth: "60px",
                                        transition: "all 0.2s ease",
                                        borderRadius: 16,
                                        "&:hover": {
                                          transform: "translateY(-2px)",
                                          boxShadow: theme.shadows[1],
                                        },
                                      }}
                                    />
                                  </Box>
                                </Box>
                              </CardActionArea>
                            </RecommendationCard>
                          </Grow>
                        </Grid>
                      ),
                    )}
                  </Grid>
                )}
              </Box>
            ))}
          </Box>
        )}

        {/* Snackbar */}
        <Snackbar
          open={showSnackbar}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          TransitionComponent={Grow}
        >
          <Alert
            elevation={6}
            variant="filled"
            onClose={handleCloseSnackbar}
            severity="success"
            sx={{
              borderRadius: theme.shape.borderRadius,
              alignItems: "center",
            }}
            icon={<CheckCircle />}
          >
            {" "}
            {snackbarMessage}{" "}
          </Alert>
        </Snackbar>
      </Container>
    </>
  );
};

export default ProductPage;
