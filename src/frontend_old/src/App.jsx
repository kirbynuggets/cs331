import React from 'react';
import CustomThemeProvider from './components/CustomThemeProvider';
import ResponsiveAppBar from './components/ResponsiveAppBar';
import './App.css';

function App() {
  return (
    <CustomThemeProvider>
      <ResponsiveAppBar />
      <h1>React App</h1>
    </CustomThemeProvider>
  );
}

export default App;