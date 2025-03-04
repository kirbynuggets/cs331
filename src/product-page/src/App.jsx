// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProductPage from './ProductPage';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import RecommendFromImage from './RecommendFromImage';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#9c27b0',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/recommend-from-image" element={<RecommendFromImage />} />
          {/* Add other routes as needed */}
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
