import React, { useState } from "react";
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
  Breadcrumbs,
  Link as MuiLink,
  useTheme,
  Skeleton,
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
          "&:hover": {
            boxShadow: "none",
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

// Styled components
const UploadContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(6),
  marginBottom: theme.spacing(4),
  boxShadow: "none",
  border: "1px solid #f0f0f0",
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
  backgroundColor: isDragging ? "#f8f8f8" : "transparent",
  transition: "all 0.3s ease",
  height: "300px",
  position: "relative",
  overflow: "hidden",
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
});

const RemoveButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  top: 0,
  right: 0,
  backgroundColor: "rgba(255, 255, 255, 0.8)",
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
}));

const UploadButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  width: "220px",
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  height: "56px",
}));

const ProductCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
}));

const ProductMedia = styled(CardMedia)(({ theme }) => ({
  height: 320,
  backgroundSize: "cover",
}));

const ProductInfo = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  flexGrow: 1,
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
}));

const ProductPrice = styled(Typography)(({ theme }) => ({
  color: theme.palette.secondary.main,
  fontWeight: 600,
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  position: "relative",
  display: "inline-block",
  marginBottom: theme.spacing(4),
  textAlign: "center",
  "&:after": {
    content: '""',
    position: "absolute",
    bottom: "-10px",
    left: "50%",
    width: "40px",
    height: "2px",
    backgroundColor: theme.palette.primary.main,
    transform: "translateX(-50%)",
  },
}));

const CategoryTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  paddingBottom: theme.spacing(1),
  borderBottom: "1px solid #f0f0f0",
}));

const StyledImageErrorContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "320px",
  backgroundColor: "#f8f8f8",
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
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [recommendations, setRecommendations] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [imageErrors, setImageErrors] = useState({});

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
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
      setFile(droppedFile);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
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

  const handleUpload = async () => {
    if (!file) {
      setError("Please select an image to upload.");
      return;
    }

    setLoading(true);
    setError(null);
    setImageErrors({});

    const formData = new FormData();
    formData.append("file", file);

    try {
      console.log("before fetched");
      const response = await fetch(
        "http://localhost:8000/api/recommend-from-image",
        {
          method: "POST",
          body: formData,
        },
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
        },
      );

      setRecommendations(processedRecommendations);
    } catch (err) {
      setError(
        err.message || "An error occurred while processing your request.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Function to check if recommendations are empty or all categories have no items
  const hasRecommendations = () => {
    if (Object.keys(recommendations).length === 0) return false;

    // Check if at least one category has items
    return Object.values(recommendations).some(
      (items) => items && items.length > 0,
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
          <Link
            to="/user/dashboard"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <Typography variant="body2">Home</Typography>
          </Link>
          <Typography variant="body2" color="text.primary">
            Visual Search
          </Typography>
        </Breadcrumbs>

        <Typography variant="h1" sx={{ mb: 1, textAlign: "center" }}>
          Shop The Look
        </Typography>

        <Typography variant="subtitle2" sx={{ mb: 6, textAlign: "center" }}>
          Upload an image to find similar items in our collection
        </Typography>

        <UploadContainer>
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
                      sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
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
                <Typography variant="h6" gutterBottom>
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
                >
                  {loading ? "Processing..." : "Find Similar Items"}
                </SubmitButton>
              </Box>
            </Grid>
          </Grid>
        </UploadContainer>

        {error && (
          <Box sx={{ mt: 2, mb: 4 }}>
            <Typography color="error">{error}</Typography>
          </Box>
        )}

        {/* Display recommendations */}
        {hasRecommendations() ? (
          <Box sx={{ mt: 8 }}>
            <SectionTitle
              variant="h2"
              sx={{ width: "100%", mb: 6, textAlign: "center" }}
            >
              We Found These For You
            </SectionTitle>

            {Object.entries(recommendations).map(([category, items]) =>
              // Only render categories that have items
              items && items.length > 0 ? (
                <Box key={category} sx={{ mb: 8 }}>
                  <CategoryTitle
                    variant="h6"
                    sx={{ textTransform: "uppercase" }}
                  >
                    {category}
                  </CategoryTitle>

                  <Grid container spacing={3}>
                    {items.map((item) => (
                      <Grid item xs={6} sm={6} md={3} key={item.id}>
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
                              <ProductMedia
                                component="img"
                                image={`http://localhost:8000${item.image_url}`}
                                alt={item.productDisplayName}
                                onError={() => handleImageError(item.id)}
                              />
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
                                  sx={{ minWidth: "60px" }}
                                />
                              </Box>
                            </ProductInfo>
                          </CardActionArea>
                        </ProductCard>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              ) : null,
            )}

            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<ShoppingBag />}
                component={Link}
                to="/shop"
                sx={{ minWidth: "200px" }}
              >
                View All Products
              </Button>
            </Box>
          </Box>
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
                    <Skeleton variant="rectangular" height={320} />
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
        ) : null}
      </Container>
    </ThemeProvider>
  );
};

export default RecommendFromImage;
