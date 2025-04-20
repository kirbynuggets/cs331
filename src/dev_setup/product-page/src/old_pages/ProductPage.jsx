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
  useTheme, // Added for theme access if needed
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AccessTime, ColorLens, Category, CalendarToday } from '@mui/icons-material';

// Define a custom theme (good practice to keep it separate)
const theme = createTheme({
  palette: {
    primary: {
      main: '#2A2F4F',  // Dark blue/purple
    },
    secondary: {
      main: '#917FB3',  // Lighter purple
    },
    background: {
      default: '#FDE2F3',  // Light pinkish background
      paper: '#FFFFFF',    // White for cards and paper
    },
    text: {
      primary: '#2A2F4F', // Use primary color for main text
      secondary: '#4A5568', // Slightly muted text color
    }
  },
  typography: {
    fontFamily: "'Inter', sans-serif", // Use Inter font
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      color: '#2A2F4F',
    },
    h6: {
      fontSize: '1.5rem', // Slightly larger for section headings
      fontWeight: 600,
      color: '#2A2F4F',
    },
    body1: {
      color: '#4A5568',
      fontSize: '1rem', // Ensure readability
    },
    subtitle2: { // For subtitles
      color: '#4A5568',
      fontSize: '0.875rem',
    },
    caption: {
        fontSize: '0.75rem', // Smaller font for captions.
        color: '#718096',   // Lighter text color for captions.
    },
    body2: { // Added for the recommendation product names
        fontSize: '0.875rem',
        fontWeight: 600,
        color: '#2A2F4F',
    }
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          padding: '4px 8px', // Consistent padding
          textTransform: 'uppercase', // Make chip text uppercase
          fontSize: '0.75rem',       // Slightly smaller font size
          fontWeight: 600,         // Bold font weight
        },
      },
    },
  },
});

// Styled component for the detail item container (optional, but cleaner)
const DetailItemContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

const DetailIconContainer = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  padding: theme.spacing(1),
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  // Make icons slightly larger and more prominent
  '& svg': {
    color: 'white',
    fontSize: '24px', // Increased icon size
  },
}));

// Reusable DetailItem component
const DetailItem = ({ icon, title, value }) => {
  return (
    <DetailItemContainer>
      <DetailIconContainer>
        {icon}
      </DetailIconContainer>
      <div>
        <Typography variant="subtitle2" color="textSecondary">{title}</Typography>
        <Typography variant="body1" fontWeight="500">{value}</Typography>
      </div>
    </DetailItemContainer>
  );
};

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [recommendations, setRecommendations] = useState({}); // Changed to an object
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        // Access the nested recommendations correctly
        setRecommendations(data.recommendations.recommendations || {}); // Initialize as empty object if null

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);



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
        <Paper elevation={0} sx={{ p: 4, borderRadius: 4, backgroundColor: 'background.paper' }}>
          <Typography variant="h1" sx={{ mb: 4 }}>
            {product.productDisplayName}
          </Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} md={5}>
              {/* Taller, more prominent image card */}
              <Card sx={{ height: '500px', p: 2 }}>
                <CardMedia
                  component="img"
                  image={`http://localhost:8000${product.image_url}`} // String interpolation for clarity
                  alt={product.productDisplayName}
                  sx={{
                    height: '100%',
                    width: '100%',
                    objectFit: 'contain',
                    borderRadius: 2, // Consistent border radius
                  }}
                />
              </Card>
            </Grid>

            <Grid item xs={12} md={7}>
              <Box sx={{ mb: 4 }}>
                <Grid container spacing={2}>
                   <Grid item xs={6} sm={3}>
                      <Chip label={product.masterCategory} color="secondary" />
                    </Grid>
                  <Grid item xs={6} sm={3}>
                      <Chip label={product.subCategory} color="primary" />
                  </Grid>
                </Grid>
              </Box>

              <Box sx={{ mb: 4 }}>
                <DetailItem
                  icon={<ColorLens />}
                  title="Primary Color"
                  value={product.baseColour || 'N/A'}
                />
                <DetailItem
                  icon={<CalendarToday />}
                  title="Season"
                  value={product.season || 'N/A'} // Handle potential null values
                />
                <DetailItem
                  icon={<Category />}
                  title="Usage"
                  value={product.usage || 'N/A'}
                />
                {/* Add more DetailItems as needed */}
              </Box>

              {/* Check if recommendations object is not empty */}
              {Object.keys(recommendations).length > 0 && (
                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" sx={{ mb: 3 }}>
                    Complete Your Look
                  </Typography>
                  {/* Iterate over recommendation categories */}
                  {Object.entries(recommendations).map(([category, items]) => (
                    <Box key={category} sx={{ mb: 4 }}>
                      <Typography variant="h6" component="h3" sx={{ mb: 2, textTransform: 'capitalize' }}>
                        {category} {/* Display the category name */}
                      </Typography>
                      <Grid container spacing={3}>
                        {items.map((item) => (
                          <Grid item xs={6} sm={4} md={3} key={item.id}>
                            <Card>
                              <CardActionArea component={Link} to={`/product/${item.id}`}>
                                <CardMedia
                                  component="img"
                                  image={`http://localhost:8000${item.image_url}`}
                                  alt={item.productDisplayName}
                                  sx={{ height: 180, objectFit: 'cover' }}
                                />
                                <CardHeader
                                  title={
                                    <Typography variant="body2" fontWeight="600" noWrap>
                                      {item.productDisplayName}
                                    </Typography>
                                  }
                                  subheader={
                                    <Typography variant="caption" color="textSecondary">
                                      {item.subCategory}
                                    </Typography>
                                  }
                                />
                              </CardActionArea>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  ))}
                </Box>
              )}
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </ThemeProvider>
  );
};

export default ProductPage;