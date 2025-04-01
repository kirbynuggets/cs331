import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Container,
  Typography,
  Grid,
  Box,
  CircularProgress,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Button,
} from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

// Simple theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
  },
});

const SimplifiedProductCatalog = () => {
  // State management
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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

        // Process products to ensure all have required fields
        const processedProducts = data.products.map((product) => ({
          ...product,
          price: product.price || Math.floor(Math.random() * 100) + 20, // Fallback price generator
          image_url: product.image_url || "/images/placeholder.jpg",
          productDisplayName: product.productDisplayName || "Untitled Product",
          subCategory: product.subCategory || "Uncategorized",
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

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ mb: 4, textAlign: "center" }}>
          Our Products
        </Typography>

        {loading ? (
          // Loading state
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          // Error state
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography color="error" gutterBottom>
              Error: {error}
            </Typography>
            <Button
              variant="contained"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </Box>
        ) : (
          // Product grid
          <Grid container spacing={3}>
            {products.map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <CardActionArea>
                    <CardMedia
                      component="img"
                      height="200"
                      image={`http://localhost:8000${product.image_url}`}
                      alt={product.productDisplayName}
                      sx={{ objectFit: "cover" }}
                      onClick={() => {
                        navigate(`/product/${product.id}`);
                      }}
                    />
                    <CardContent>
                      <Typography variant="h6" noWrap>
                        {product.productDisplayName}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                      >
                        {product.subCategory}
                      </Typography>
                      <Typography variant="h6" color="primary">
                        ${product.price?.toFixed(2)}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </ThemeProvider>
  );
};

export default SimplifiedProductCatalog;
