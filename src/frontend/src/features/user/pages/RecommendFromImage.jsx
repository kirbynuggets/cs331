import React, { useState, useEffect } from "react";
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
  IconButton,
  Breadcrumbs,
  Link as MuiLink,
  useTheme,
  Skeleton,
  Fade,
  Grow,
  Divider,
  Snackbar,
  Alert,
  Zoom,
  Badge,
} from "@mui/material";
import {
  createTheme,
  ThemeProvider,
  responsiveFontSizes,
} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import {
  Upload as UploadIcon,
  Image as ImageIcon,
  CloudUpload,
  NavigateNext,
  ShoppingBag,
  Delete,
  Visibility,
  ErrorOutline,
  ImageSearch,
  CheckCircleOutline,
  Collections,
  FavoriteBorder,
} from "@mui/icons-material";
import { Link } from "react-router-dom";

// Define the same theme as ProductPage to maintain consistency
let theme = createTheme({
  palette: {
    primary: {
      main: "#000000", // Black for primary
      light: "#333333",
    },
    secondary: {
      main: "#b7846f", // Muted terracotta accent
      light: "#d9b8ac",
    },
    background: {
      default: "#ffffff", // Clean white background
      paper: "#ffffff", // White for cards and paper
    },
    text: {
      primary: "#292929", // Slightly softer black for text
      secondary: "#6e6e6e", // Muted gray for secondary text
    },
  },
  typography: {
    fontFamily: "'Nunito Sans', 'Inter', sans-serif",
    h1: {
      fontSize: "2rem",
      fontWeight: 600,
      letterSpacing: "0.5px",
      textTransform: "uppercase",
      color: "#292929",
    },
    h2: {
      fontSize: "1.75rem",
      fontWeight: 600,
      letterSpacing: "0.5px",
    },
    h6: {
      fontSize: "1.25rem",
      fontWeight: 600,
      letterSpacing: "0.3px",
      textTransform: "uppercase",
      color: "#292929",
    },
    body1: {
      color: "#292929",
      fontSize: "1rem",
      letterSpacing: "0.2px",
    },
    subtitle1: {
      fontSize: "1.1rem",
      fontWeight: 600,
      color: "#292929",
    },
    subtitle2: {
      color: "#6e6e6e",
      fontSize: "0.95rem",
      letterSpacing: "0.1px",
    },
    caption: {
      fontSize: "0.85rem",
      color: "#6e6e6e",
      letterSpacing: "0.5px",
    },
    body2: {
      fontSize: "0.95rem",
      fontWeight: 500,
      color: "#292929",
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          padding: "12px 24px",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "1px",
          boxShadow: "none",
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow: "none",
            transform: "translateY(-2px)",
          },
        },
        containedPrimary: {
          backgroundColor: "#000000",
          color: "#ffffff",
          "&:hover": {
            backgroundColor: "#333333",
          },
        },
        outlinedPrimary: {
          borderColor: "#000000",
          borderWidth: "1px",
          "&:hover": {
            borderWidth: "1px",
            backgroundColor: "rgba(0,0,0,0.04)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          boxShadow: "none",
          transition: "transform 0.3s, opacity 0.3s",
          "&:hover": {
            transform: "translateY(-4px)",
            opacity: 0.9,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          padding: "4px 8px",
          height: "auto",
          backgroundColor: "#f5f5f5",
          color: "#292929",
          fontWeight: 500,
          letterSpacing: "0.5px",
        },
        colorPrimary: {
          backgroundColor: "#000000",
          color: "#ffffff",
        },
        colorSecondary: {
          backgroundColor: "#b7846f",
          color: "#ffffff",
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
const UploadContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(6),
  marginBottom: theme.spacing(4),
  boxShadow: "none",
  border: "1px solid #f0f0f0",
  position: "relative",
  overflow: "hidden",
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    height: "4px",
    background: "linear-gradient(90deg, #b7846f 0%, #d9b8ac 100%)",
    opacity: 0.8,
  },
}));

const UploadArea = styled(Box)(({ theme, isDragging, hasFile }) => ({
  border: hasFile ? "1px solid #e0e0e0" : "1px dashed #a0a0a0",
  borderRadius: 0,
  padding: theme.spacing(5),
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  cursor: "pointer",
  backgroundColor: isDragging ? "rgba(183,132,111,0.05)" : "transparent",
  transition: "all 0.3s ease",
  height: "350px",
  position: "relative",
  overflow: "hidden",
  "&:hover": {
    backgroundColor: hasFile ? "transparent" : "rgba(0,0,0,0.02)",
    borderColor: hasFile ? "#e0e0e0" : "#b7846f",
  },
}));

const PreviewContainer = styled(Box)(({ theme }) => ({
  position: "relative",
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const ImagePreview = styled("img")({
  maxWidth: "100%",
  maxHeight: "100%",
  objectFit: "contain",
  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
});

const RemoveButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  top: 10,
  right: 10,
  backgroundColor: "rgba(255, 255, 255, 0.9)",
  boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 1)",
    transform: "scale(1.1)",
  },
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  height: "56px",
  transition: "all 0.3s ease",
  position: "relative",
  overflow: "hidden",
  "&::after": {
    content: '""',
    position: "absolute",
    top: 0,
    left: -100,
    width: "100%",
    height: "100%",
    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
    transition: "0.5s",
  },
  "&:hover::after": {
    left: 100,
  },
}));

const ProductCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
  border: "1px solid transparent",
  "&:hover": {
    transform: "translateY(-8px)",
    borderColor: "#f0f0f0",
    boxShadow: "0 15px 35px rgba(0,0,0,0.05), 0 5px 15px rgba(0,0,0,0.05)",
  },
}));

const ProductMedia = styled(CardMedia)(({ theme }) => ({
  height: 320,
  backgroundSize: "cover",
  transition: "transform 0.5s ease",
  "&:hover": {
    transform: "scale(1.03)",
  },
}));

const ProductInfo = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  flexGrow: 1,
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  borderTop: "1px solid #f5f5f5",
}));

const ProductPrice = styled(Typography)(({ theme }) => ({
  color: theme.palette.secondary.main,
  fontWeight: 600,
  position: "relative",
  display: "inline-block",
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: "-2px",
    left: 0,
    width: "20px",
    height: "1px",
    backgroundColor: theme.palette.secondary.light,
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  position: "relative",
  display: "inline-block",
  marginBottom: theme.spacing(4),
  textAlign: "center",
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

const CategoryTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  paddingBottom: theme.spacing(1),
  borderBottom: "1px solid #f0f0f0",
  position: "relative",
  "&:after": {
    content: '""',
    position: "absolute",
    bottom: "-1px",
    left: 0,
    width: "40px",
    height: "2px",
    backgroundColor: theme.palette.primary.main,
  },
}));

const StyledImageErrorContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "320px",
  backgroundColor: "#f8f8f8",
  border: "1px dashed #e0e0e0",
}));

const BreadcrumbLink = styled(Link)(({ theme }) => ({
  textDecoration: "none",
  color: "inherit",
  display: "flex",
  alignItems: "center",
  transition: "color 0.2s ease",
  "&:hover": {
    color: theme.palette.secondary.main,
  },
}));

const StyledDivider = styled(Divider)(({ theme }) => ({
  margin: theme.spacing(6, 0),
  position: "relative",
  "&::after": {
    content: '""',
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "50px",
    height: "5px",
    backgroundColor: "#f5f5f5",
  },
}));

const FadeInSection = styled(Box)(({ theme }) => ({
  animation: "fadeIn 0.8s ease-out",
  "@keyframes fadeIn": {
    "0%": {
      opacity: 0,
      transform: "translateY(20px)",
    },
    "100%": {
      opacity: 1,
      transform: "translateY(0)",
    },
  },
}));

const EmptyStateContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(8),
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  backgroundColor: "#fafafa",
  border: "1px dashed #e0e0e0",
  marginTop: theme.spacing(4),
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
    default: { min: 30, max: 70 },
  };

  // Determine category for pricing
  let category = "default";

  // Try to match by category name
  const catLower = (item.category || "").toLowerCase();
  const subCatLower = (item.subCategory || "").toLowerCase();

  // Check if we have a range for this category or subcategory
  if (priceRanges[catLower]) {
    category = catLower;
  } else if (priceRanges[subCatLower]) {
    category = subCatLower;
  }

  // Generate a pseudo-random but consistent price for the same item
  const nameValue = item.productDisplayName
    ? item.productDisplayName.split("").reduce((a, b) => a + b.charCodeAt(0), 0)
    : item.id || Math.floor(Math.random() * 1000);

  const range = priceRanges[category].max - priceRanges[category].min;
  const offset = nameValue % range;
  const basePrice = priceRanges[category].min + offset;

  // Return a price with 2 decimal places between min and max
  return parseFloat(basePrice.toFixed(2));
};

// Default image URL when image_url is missing or invalid
const DEFAULT_IMAGE_URL = "/images/placeholder.jpg";

const RecommendFromImage = () => {
  const theme = useTheme();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [recommendations, setRecommendations] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [imageErrors, setImageErrors] = useState({});
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [loadedItems, setLoadedItems] = useState(0);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        setSnackbarMessage("File size exceeds 5MB limit.");
        setSnackbarSeverity("error");
        setShowSnackbar(true);
        return;
      }
      
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        setSnackbarMessage("Image successfully uploaded!");
        setSnackbarSeverity("success");
        setShowSnackbar(true);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      
      if (droppedFile.size > 5 * 1024 * 1024) {
        setSnackbarMessage("File size exceeds 5MB limit.");
        setSnackbarSeverity("error");
        setShowSnackbar(true);
        return;
      }
      
      setFile(droppedFile);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        setSnackbarMessage("Image successfully uploaded!");
        setSnackbarSeverity("success");
        setShowSnackbar(true);
      };
      reader.readAsDataURL(droppedFile);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
  };

  const handleImageError = (itemId) => {
    setImageErrors((prev) => ({
      ...prev,
      [itemId]: true,
    }));
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setShowSnackbar(false);
  };

  const handleUpload = async () => {
    if (!file) {
      setSnackbarMessage("Please select an image to upload.");
      setSnackbarSeverity("warning");
      setShowSnackbar(true);
      return;
    }

    setLoading(true);
    setError(null);
    setImageErrors({});
    setLoadedItems(0);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        "http://localhost:8000/api/recommend-from-image",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }

      const data = await response.json();

      // Process the recommendations to ensure all needed fields exist
      const processedRecommendations = {};

      Object.entries(data.recommendations || {}).forEach(
        ([category, items]) => {
          // Skip empty categories
          if (!items || items.length === 0) return;

          // Process each item to ensure it has all needed fields
          processedRecommendations[category] = items.map((item) => ({
            id: item.id || `temp-${Math.random().toString(36).substr(2, 9)}`,
            productDisplayName: item.productDisplayName || "Untitled Product",
            subCategory: item.subCategory || category,
            image_url: item.image_url || DEFAULT_IMAGE_URL,
            price: generatePrice(item), // Generate price if not provided
          }));
        }
      );

      setRecommendations(processedRecommendations);
      const totalItems = Object.values(processedRecommendations).flat().length;
      
      if (totalItems > 0) {
        setSnackbarMessage(`Found ${totalItems} items that match your style!`);
        setSnackbarSeverity("success");
      } else {
        setSnackbarMessage("No matching items found. Try a different image.");
        setSnackbarSeverity("info");
      }
      setShowSnackbar(true);
      
    } catch (err) {
      setError(err.message || "An error occurred while processing your request.");
      setSnackbarMessage("Error processing your image. Please try again.");
      setSnackbarSeverity("error");
      setShowSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  // Function to check if recommendations are empty or all categories have no items
  const hasRecommendations = () => {
    if (Object.keys(recommendations).length === 0) return false;

    // Check if at least one category has items
    return Object.values(recommendations).some(
      (items) => items && items.length > 0
    );
  };

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
          <BreadcrumbLink to="/user/dashboard">
            <Typography variant="body2">Home</Typography>
          </BreadcrumbLink>
          <Typography variant="body2" color="text.primary">
            Visual Search
          </Typography>
        </Breadcrumbs>

        <Fade in={true} timeout={800}>
          <Box>
            <Typography variant="h1" sx={{ mb: 1, textAlign: "center" }}>
              Shop The Look
            </Typography>

            <Typography variant="subtitle2" sx={{ mb: 6, textAlign: "center" }}>
              Upload an image to find similar items in our collection
            </Typography>
          </Box>
        </Fade>

        <Grow in={true} timeout={1000}>
          <UploadContainer elevation={0}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={7}>
                <UploadArea
                  isDragging={isDragging}
                  hasFile={Boolean(file)}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {!preview ? (
                    <>
                      <CloudUpload
                        sx={{ 
                          fontSize: 64, 
                          color: isDragging ? theme.palette.secondary.main : "text.secondary", 
                          mb: 2,
                          transition: "all 0.3s ease" 
                        }}
                      />
                      <Typography variant="h6" color="text.primary" gutterBottom>
                        Drag & Drop Your Image Here
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 3 }}
                      >
                        or
                      </Typography>
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        id="upload-image"
                        onChange={handleFileChange}
                      />
                      <label htmlFor="upload-image">
                        <Button
                          variant="outlined"
                          component="span"
                          startIcon={<UploadIcon />}
                          sx={{
                            transition: "all 0.3s ease",
                            "&:hover": {
                              borderColor: theme.palette.secondary.main,
                              backgroundColor: "rgba(183,132,111,0.05)",
                              transform: "translateY(-2px)"
                            }
                          }}
                        >
                          Select File
                        </Button>
                      </label>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 2 }}
                      >
                        Supports JPG, PNG (Max 5MB)
                      </Typography>
                    </>
                  ) : (
                    <Zoom in={true} timeout={500}>
                      <PreviewContainer>
                        <ImagePreview src={preview} alt="Preview" />
                        <RemoveButton
                          size="small"
                          onClick={handleRemoveFile}
                          aria-label="remove image"
                        >
                          <Delete />
                        </RemoveButton>
                      </PreviewContainer>
                    </Zoom>
                  )}
                </UploadArea>
              </Grid>

              <Grid
                item
                xs={12}
                md={5}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ position: "relative", paddingBottom: 1, "&::after": { content: '""', position: "absolute", bottom: 0, left: 0, width: "30px", height: "2px", backgroundColor: theme.palette.secondary.light } }}>
                    Find Your Style Inspiration
                  </Typography>
                  <Typography variant="body1" paragraph>
                    Upload a fashion image you love, and we'll help you discover
                    similar items to recreate the look.
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ mb: 4 }}
                    color="text.secondary"
                  >
                    Perfect for finding alternatives to outfits you've seen online
                    or creating a cohesive look with matching accessories.
                  </Typography>

                  <SubmitButton
                    variant="contained"
                    color="primary"
                    onClick={handleUpload}
                    disabled={loading || !file}
                    fullWidth
                    startIcon={
                      loading ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        <Visibility />
                      )
                    }
                    sx={{
                      background: file ? "linear-gradient(45deg, #000000 30%, #333333 90%)" : undefined,
                    }}
                  >
                    {loading ? "Processing..." : "Find Similar Items"}
                  </SubmitButton>
                </Box>
              </Grid>
            </Grid>
          </UploadContainer>
        </Grow>

        {error && (
          <Fade in={true} timeout={500}>
            <Box sx={{ mt: 2, mb: 4 }}>
              <Alert severity="error" icon={<ErrorOutline />} sx={{ borderRadius: 0 }}>
                {error}
              </Alert>
            </Box>
          </Fade>
        )}

        {/* Display recommendations */}
        {hasRecommendations() ? (
          <FadeInSection sx={{ mt: 8 }}>
            <SectionTitle
              variant="h2"
              sx={{ width: "100%", mb: 6, textAlign: "center" }}
            >
              We Found These For You
            </SectionTitle>

            {Object.entries(recommendations).map(([category, items], categoryIndex) =>
              // Only render categories that have items
              items && items.length > 0 ? (
                <Fade 
                  in={true} 
                  timeout={500 + categoryIndex * 200} 
                  key={category}
                >
                  <Box sx={{ mb: 8 }}>
                    <CategoryTitle
                      variant="h6"
                      sx={{ 
                        textTransform: "uppercase",
                        display: "flex",
                        alignItems: "center",
                        gap: 1
                      }}
                    >
                      {category} 
                      <Chip 
                        label={items.length} 
                        size="small" 
                        color="secondary"
                        sx={{ height: 20, ml: 1 }}
                      />
                    </CategoryTitle>

                    <Grid container spacing={3}>
                      {items.map((item, index) => (
                        <Grid item xs={6} sm={6} md={3} key={item.id}>
                          <Grow
                            in={true}
                            style={{ transformOrigin: '0 0 0' }}
                            timeout={500 + index * 100}
                          >
                            <ProductCard>
                              <CardActionArea
                                component={Link}
                                to={`/product/${item.id}`}
                              >
                                {/* Handle image errors gracefully */}
                                {imageErrors[item.id] ? (
                                  <StyledImageErrorContainer>
                                    <ImageIcon
                                      sx={{
                                        fontSize: 48,
                                        color: "text.secondary",
                                        mb: 2,
                                      }}
                                    />
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      Image not available
                                    </Typography>
                                  </StyledImageErrorContainer>
                                ) : (
                                  <Box sx={{ position: "relative", overflow: "hidden" }}>
                                    <ProductMedia
                                      component="img"
                                      image={`http://localhost:8000${item.image_url}`}
                                      alt={item.productDisplayName}
                                      onError={() => handleImageError(item.id)}
                                    />
                                    <IconButton
                                      sx={{
                                        position: "absolute",
                                        top: 10,
                                        right: 10,
                                        backgroundColor: "rgba(255,255,255,0.8)",
                                        "&:hover": {
                                          backgroundColor: "rgba(255,255,255,0.9)",
                                        },
                                      }}
                                    >
                                      <FavoriteBorder fontSize="small" />
                                    </IconButton>
                                  </Box>
                                )}
                                <ProductInfo>
                                  <Box>
                                    <Typography
                                      variant="body2"
                                      fontWeight="600"
                                      gutterBottom
                                    >
                                      {item.productDisplayName}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      {item.subCategory || category}
                                    </Typography>
                                  </Box>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                      mt: 2,
                                    }}
                                  >
                                    <ProductPrice variant="subtitle2">
                                      ${item.price?.toFixed(2) || "N/A"}
                                    </ProductPrice>
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
                                </ProductInfo>
                              </CardActionArea>
                            </ProductCard>
                          </Grow>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </Fade>
              ) : null
            )}

            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<ShoppingBag />}
                component={Link}
                to="/shop"
                sx={{ 
                  minWidth: "200px",
                  position: "relative",
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    bottom: "-5px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "0",
                    height: "2px",
                    backgroundColor: theme.palette.primary.main,
                    transition: "width 0.3s ease",
                  },
                  "&:hover::after": {
                    width: "80%",
                  }
                }}
              >
                View All Products
              </Button>
            </Box>
          </FadeInSection>
        ) : loading ? (
          // Show skeleton loading state
          <Box sx={{ mt: 8 }}>
            <Typography variant="h2" sx={{ mb: 6, textAlign: "center" }}>
              <Skeleton width="60%" sx={{ mx: "auto" }} />
            </Typography>

            <Box sx={{ mb: 8 }}>
              <Skeleton width="30%" height={40} sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                {[1, 2, 3, 4].map((item) => (
                  <Grid item xs={6} sm={6} md={3} key={item}>
                    <Skeleton variant="rectangular" height={320} sx={{ transform: "scale(1)", transition: "transform 0.5s ease" }} />
                    <Skeleton variant="text" sx={{ mt: 1 }} />
                    <Skeleton variant="text" width="60%" />
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mt: 1,
                      }}
                    >
                      <Skeleton width="30%" />
                      <Skeleton width="20%" />
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Box>
        ) : preview && !loading && !hasRecommendations() ? (
          <Fade in={true} timeout={800}>
            <EmptyStateContainer>
              <Collections sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No Matching Items Found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 600, mb: 3 }}>
                We couldn't find items that match your image. Try uploading a different fashion image or browse our collections.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<ShoppingBag />}
                component={Link}
                to="/shop"
              >
                Browse Collections
              </Button>
            </EmptyStateContainer>
          </Fade>
        ) : null}
      </Container>
      
      <Snackbar 
        open={showSnackbar} 
        autoHideDuration={6000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbarSeverity} 
          sx={{ 
            width: '100%',
            borderRadius: 0,
            alignItems: 'center'
          }}
        >
          {snackbarSeverity === 'success' && <CheckCircleOutline sx={{ mr: 1 }} />}
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
};

export default RecommendFromImage;