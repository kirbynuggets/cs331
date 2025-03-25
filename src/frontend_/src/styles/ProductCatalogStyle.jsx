import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import { styled } from '@mui/system';
import { Card, CardMedia, Box, Typography, IconButton, Button } from '@mui/material';

// Define the same consistent theme
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
          '&:hover': {
            boxShadow: 'none',
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
    MuiPagination: {
      styleOverrides: {
        ul: {
          justifyContent: 'center',
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
const ProductCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
}));

const ProductMedia = styled(CardMedia)(({ theme }) => ({
  height: 400,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
}));

const ProductInfo = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
}));

const ProductPrice = styled(Typography)(({ theme }) => ({
  color: theme.palette.secondary.main,
  fontWeight: 600,
}));

const WishlistButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  right: theme.spacing(1),
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
}));

const FilterButton = styled(Button)(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    display: 'none',
  },
}));

const PageHeader = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  [theme.breakpoints.up('md')]: {
    marginBottom: theme.spacing(6),
  },
}));

const FiltersContainer = styled(Box)(({ theme }) => ({
  width: 280,
  padding: theme.spacing(2),
  [theme.breakpoints.down('md')]: {
    display: 'none',
  },
}));

const SortContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(3),
  padding: theme.spacing(2, 0),
  borderBottom: '1px solid #f0f0f0',
}));

const ViewToggle = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
}));

const ListProductCard = styled(Card)(({ theme }) => ({
  height: '100%',
  boxShadow: 'none',
  display: 'flex',
  borderRadius: 0,
  transition: 'transform 0.3s, opacity 0.3s',
  '&:hover': {
    transform: 'translateY(-4px)',
    opacity: 0.9,
  },
}));

const ListProductMedia = styled(CardMedia)(({ theme }) => ({
  width: 200,
  height: 250,
  [theme.breakpoints.up('md')]: {
    width: 250,
    height: 300,
  },
}));

const ListProductInfo = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
}));

const SearchContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  width: '100%',
}));

const NoResultsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(6),
  textAlign: 'center',
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
    default: { min: 30, max: 70 }
  };
  
  // Determine category for pricing
  let category = 'default';
  
  // Try to match by category name
  const catLower = (item.masterCategory || '').toLowerCase();
  const subCatLower = (item.subCategory || '').toLowerCase();
  
  // Check if we have a range for this category or subcategory
  if (priceRanges[catLower]) {
    category = catLower;
  } else if (priceRanges[subCatLower]) {
    category = subCatLower;
  }
  
  // Generate a pseudo-random but consistent price for the same item
  const nameValue = item.productDisplayName ? 
    item.productDisplayName.split('').reduce((a, b) => a + b.charCodeAt(0), 0) : 
    item.id || Math.floor(Math.random() * 1000);
  
  const range = priceRanges[category].max - priceRanges[category].min;
  const offset = (nameValue % range);
  const basePrice = priceRanges[category].min + offset;
  
  // Return a price with 2 decimal places between min and max
  return parseFloat(basePrice.toFixed(2));
};

// Export everything
export {
  theme,
  ProductCard,
  ProductMedia,
  ProductInfo,
  ProductPrice,
  WishlistButton,
  FilterButton,
  PageHeader,
  FiltersContainer,
  SortContainer,
  ViewToggle,
  ListProductCard,
  ListProductMedia,
  ListProductInfo,
  SearchContainer,
  NoResultsContainer,
  generatePrice
};