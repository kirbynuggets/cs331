// src/features/admin/pages/AdminDashboard.jsx
import React from "react";
import { CssBaseline, ThemeProvider, Box } from "@mui/material";
import { Routes, Route } from "react-router-dom";
import { useAuth } from "../../auth";  // Updated import
import { CategoryProvider } from "../context/CategoryContext";
import theme from "../../../theme";  // Use centralized theme
import Sidebar from "../components/sidebar";
import Dashboard from "../components/dashboard";
import ProductInventory from "../components/products";
import AnalyticsOverview from "../components/analytics";
import Settings from "../components/settings";

function AdminDashboard() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <CategoryProvider>
        <Box sx={{ display: "flex", bgcolor: "background.default", minHeight: "100vh" }}>
          <Sidebar />
          <Box component="main" sx={{ flexGrow: 1, ml: "240px", p: { xs: 2, sm: 3 } }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route
                path="/products"
                element={<ProductInventory showViewMore={false} />}
              />
              <Route
                path="/analytics"
                element={<AnalyticsOverview showViewMore={false} />}
              />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Box>
        </Box>
      </CategoryProvider>
    </ThemeProvider>
  );
}

export default AdminDashboard;