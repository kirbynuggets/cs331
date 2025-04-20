// src/theme/index.js
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: { main: '#242424' }, // Dark charcoal instead of teal
    secondary: { main: '#767676' }, // Subtle gray
    background: { default: '#f8f8f8', paper: '#FFFFFF' },
    text: { primary: '#242424', secondary: '#767676' },
    success: { main: '#5e7052' }, // Olive green for success
    error: { main: '#a05252' }, // Muted red for error
  },
  typography: {
    fontFamily: "'Montserrat', 'Arial', sans-serif",
    h4: { fontWeight: 400, letterSpacing: '0.5px' },
    h5: { fontWeight: 400, letterSpacing: '0.5px' },
    h6: { fontWeight: 400, letterSpacing: '0.5px' },
    body1: { fontSize: "0.95rem" },
    button: { textTransform: "none", fontWeight: 400, letterSpacing: '0.5px' },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0, // Square buttons
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 0, // Square cards
          boxShadow: 'none',
          border: '1px solid #eaeaea',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        elevation1: {
          boxShadow: 'none',
          border: '1px solid #eaeaea',
        },
      },
    },
  },
});

export default theme;