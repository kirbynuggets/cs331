// src/theme/index.js
import { createTheme } from '@mui/material/styles';

// Extract current theme values from AdminDashboard.jsx, ProductPage.jsx, etc.
export const theme = createTheme({
  palette: {
    primary: { main: '#26A69A' },
    secondary: { main: '#90A4AE' },
    background: { default: '#F5E1C8', paper: '#FFFFFF' },
    text: { primary: '#3E2723', secondary: '#5D4037' },
    success: { main: '#4CAF50' },
    error: { main: '#F44336' },
  },
  typography: {
    fontFamily: "'Montserrat', 'Poppins', sans-serif",
    h5: { fontWeight: 600 },
    h6: { fontWeight: 500 },
    body1: { fontSize: "0.95rem" },
    button: { textTransform: "none", fontWeight: 500 },
  },
});

export default theme;