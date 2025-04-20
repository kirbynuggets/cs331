// src/App.jsx
import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './features/auth';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './AppRoutes'; // We'll create this next
import CustomThemeProvider from './components/common/CustomThemeProvider';
import { Provider } from 'react-redux';
import { store } from './app/store';

function App() {
  return (
    <Provider store={store}>
      <CustomThemeProvider >
        <CssBaseline />
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </CustomThemeProvider>
    </Provider>
  );
}

export default App;