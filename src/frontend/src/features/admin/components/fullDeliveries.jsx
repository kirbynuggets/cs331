import React from "react";
import { Box, Typography, Paper, Breadcrumbs, Link } from "@mui/material";
import ProductDelivery from "../components/delivery";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import HomeIcon from "@mui/icons-material/Home";

function FullDeliveriesPage() {
  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", py: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs 
        separator={<NavigateNextIcon fontSize="small" />} 
        aria-label="breadcrumb"
        sx={{ mb: 3 }}
      >
        <Link 
          color="inherit" 
          href="/admin/dashboard" 
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
          Dashboard
        </Link>
        <Typography color="text.primary">Deliveries</Typography>
      </Breadcrumbs>
      
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 500, color: "#333" }}>
          All Deliveries
        </Typography>
      </Box>
      
      <Paper sx={{ borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
        <ProductDelivery limit={100} />
      </Paper>
    </Box>
  );
}

export default FullDeliveriesPage;