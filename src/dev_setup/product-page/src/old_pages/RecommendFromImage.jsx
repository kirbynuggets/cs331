import React, { useState } from 'react';
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
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Upload as UploadIcon } from '@mui/icons-material';

// Reuse the same theme as ProductPage
const theme = createTheme({
  palette: {
    primary: {
      main: '#2A2F4F', // Dark blue/purple
    },
    secondary: {
      main: '#917FB3', // Lighter purple
    },
    background: {
      default: '#FDE2F3', // Light pinkish background
      paper: '#FFFFFF', // White for cards and paper
    },
    text: {
      primary: '#2A2F4F', // Use primary color for main text
      secondary: '#4A5568', // Slightly muted text color
    },
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
    subtitle2: {
      // For subtitles
      color: '#4A5568',
      fontSize: '0.875rem',
    },
    caption: {
      fontSize: '0.75rem', // Smaller font for captions.
      color: '#718096', // Lighter text color for captions.
    },
    body2: {
      // Added for the recommendation product names
      fontSize: '0.875rem',
      fontWeight: 600,
      color: '#2A2F4F',
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
          padding: '4px 8px', // Consistent padding
          textTransform: 'uppercase', // Make chip text uppercase
          fontSize: '0.75rem', // Slightly smaller font size
          fontWeight: 600, // Bold font weight
        },
      },
    },
  },
});

// Styled component for the upload area
const UploadArea = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.primary.main}`,
  borderRadius: '16px',
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  cursor: 'pointer',
  backgroundColor: theme.palette.background.paper,
  transition: 'background-color 0.2s',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const RecommendFromImage = () => {
  const [file, setFile] = useState(null);
  const [recommendations, setRecommendations] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select an image to upload.');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/recommend-from-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }

      const data = await response.json();
      setRecommendations(data.recommendations || {});
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Paper elevation={0} sx={{ p: 4, borderRadius: 4, backgroundColor: 'background.paper' }}>
          <Typography variant="h1" sx={{ mb: 4 }}>
            Recommend From Image
          </Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <UploadArea>
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="upload-image"
                  onChange={handleFileChange}
                />
                <label htmlFor="upload-image">
                  <Button
                    variant="contained"
                    component="span"
                    startIcon={<UploadIcon />}
                    sx={{ mb: 2 }}
                  >
                    Upload Image
                  </Button>
                </label>
                <Typography variant="body1" color="textSecondary">
                  {file ? file.name : 'No file selected'}
                </Typography>
              </UploadArea>
            </Grid>

            <Grid item xs={12} md={6}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleUpload}
                disabled={loading || !file}
                fullWidth
                sx={{ height: '56px' }}
              >
                {loading ? <CircularProgress size={24} /> : 'Get Recommendations'}
              </Button>
            </Grid>
          </Grid>

          {error && (
            <Box sx={{ mt: 4 }}>
              <Typography color="error">{error}</Typography>
            </Box>
          )}

          {/* Display recommendations */}
          {Object.keys(recommendations).length > 0 && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Recommendations
              </Typography>
              {Object.entries(recommendations).map(([category, items]) => (
                <Box key={category} sx={{ mb: 4 }}>
                  <Typography variant="h6" component="h3" sx={{ mb: 2, textTransform: 'capitalize' }}>
                    {category}
                  </Typography>
                  <Grid container spacing={3}>
                    {items.map((item) => (
                      <Grid item xs={6} sm={4} md={3} key={item.id}>
                        <Card>
                          <CardActionArea>
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
        </Paper>
      </Container>
    </ThemeProvider>
  );
};

export default RecommendFromImage;