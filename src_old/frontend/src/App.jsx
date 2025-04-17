// src/App.jsx
import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './features/auth';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './AppRoutes'; // We'll create this next
import CustomThemeProvider from './components/common/CustomThemeProvider';

function App() {
  return (
    <CustomThemeProvider >
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </CustomThemeProvider>
  );
}

export default App;