// src/frontend/src/features/admin/context/ThemeContext.jsx
import React, { createContext, useState, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';

// Create the context
export const ThemeContext = createContext({
  darkMode: false,
  toggleDarkMode: () => {},
});

// Create the provider component
export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);

  // Toggle dark mode function
  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
    // Save preference to localStorage
    localStorage.setItem('darkMode', !darkMode);
  };

  // Create theme based on dark mode state
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? 'dark' : 'light',
          primary: {
            main: '#26A69A',
          },
          secondary: {
            main: '#FF9800',
          },
          background: {
            default: darkMode ? '#121212' : '#f8f8f8',
            paper: darkMode ? '#1E1E1E' : '#fff',
          },
        },
        typography: {
          fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
          h6: {
            fontWeight: 600,
          },
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                scrollbarColor: darkMode ? "#6b6b6b #2b2b2b" : "#6b6b6b #f5f5f5",
                "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
                  backgroundColor: darkMode ? "#2b2b2b" : "#f5f5f5",
                  width: 8,
                },
                "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
                  borderRadius: 8,
                  backgroundColor: darkMode ? "#6b6b6b" : "#cdcdcd",
                  minHeight: 24,
                  border: darkMode ? "3px solid #2b2b2b" : "3px solid #f5f5f5",
                },
              },
            },
          },
        },
      }),
    [darkMode]
  );

  // Load preference from localStorage when component mounts
  React.useEffect(() => {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode !== null) {
      setDarkMode(savedMode === 'true');
    }
  }, []);

  // Context value
  const contextValue = {
    darkMode,
    toggleDarkMode,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
};