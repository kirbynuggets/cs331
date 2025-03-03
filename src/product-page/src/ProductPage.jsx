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
  CardContent as MuiCardContent,
  styled,
  useTheme
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AccessTime, ColorLens, Category, CalendarToday } from '@mui/icons-material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2A2F4F',
    },
    secondary: {
      main: '#917FB3',
    },
    background: {
      default: '#FDE2F3',
      paper: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      color: '#2A2F4F',
    },
    h6: {
      fontWeight: 600,
      color: '#2A2F4F',
    },
    body1: {
      color: '#4A5568',
    },
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
          padding: '4px 8px',
        },
      },
    },
  },
});

const DetailItem = ({ icon, title, value }) => {
  const theme = useTheme();
  return (
    <Box display="flex" alignItems="center" gap={2} mb={2}>
      <Box
        bgcolor={theme.palette.primary.main}
        p={1}
        borderRadius="50%"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        {React.cloneElement(icon, { style: { color: 'white', fontSize: '20px' } })}
      </Box>
      <div>
        <Typography variant="subtitle2" color="textSecondary">{title}</Typography>
        <Typography variant="body1" fontWeight="500">{value}</Typography>
      </div>
    </Box>
  );
};

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/product/${id}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch product details: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        setProduct(data.product);
        let allRecommendations = [];
        if (data.recommendations) {
          Object.values(data.recommendations).forEach((category) => {
            allRecommendations = allRecommendations.concat(category);
          });
        }
        setRecommendations(allRecommendations);
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  if (loading) {
    return (
      <Container style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error">Error: {error}</Typography>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container>
        <Typography>Product not found.</Typography>
      </Container>
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
              <Card sx={{ height: '500px', p: 2 }}>
                <CardMedia
                  component="img"
                  image={'http://localhost:8000' + product.image_url}
                  alt={product.productDisplayName}
                  sx={{ 
                    height: '100%',
                    width: '100%',
                    objectFit: 'contain',
                    borderRadius: 2
                  }}
                />
              </Card>
            </Grid>
            
            <Grid item xs={12} md={7}>
              <Box sx={{ mb: 4 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Chip
                      label={product.masterCategory}
                      color="secondary"
                      sx={{ width: '100%' }}
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Chip
                      label={product.subCategory}
                      color="primary"
                      sx={{ width: '100%' }}
                    />
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
                  value={product.season}
                />
                <DetailItem
                  icon={<Category />}
                  title="Usage"
                  value={product.usage}
                />
              </Box>

              {recommendations.length > 0 && (
                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" sx={{ mb: 3 }}>
                    Complete Your Look
                  </Typography>
                  <Grid container spacing={3}>
                    {recommendations.map((item) => (
                      <Grid item xs={6} sm={4} md={3} key={item.id}>
                        <Card>
                          <CardActionArea component={Link} to={`/product/${item.id}`}>
                            <CardMedia
                              component="img"
                              image={'http://localhost:8000' + item.image_url}
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
              )}
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </ThemeProvider>
  );
};

export default ProductPage;