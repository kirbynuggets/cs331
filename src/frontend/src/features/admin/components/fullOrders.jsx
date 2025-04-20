import React from "react";
import { Container, Typography, Box, Breadcrumbs, Link } from "@mui/material";
import ProductOrders from "../components/orders";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

function FullOrdersPage() {
  return (
    <Container sx={{ py: 4 }}>
      <Breadcrumbs 
        separator={<NavigateNextIcon fontSize="small" />} 
        aria-label="breadcrumb"
        sx={{ mb: 3, '& .MuiBreadcrumbs-separator': { mx: 1 } }}
      >
        <Link 
          underline="hover" 
          color="inherit" 
          href="/admin/dashboard"
          sx={{ 
            fontSize: "0.85rem", 
            color: "#666",
            '&:hover': { color: "#6f7d5d" }
          }}
        >
          Dashboard
        </Link>
        <Typography 
          color="text.primary" 
          sx={{ 
            fontSize: "0.85rem", 
            color: "#333" 
          }}
        >
          Orders
        </Typography>
      </Breadcrumbs>
      
      <Typography 
        variant="h4" 
        gutterBottom
        sx={{ 
          fontWeight: 400, 
          fontSize: "1.5rem", 
          letterSpacing: "0.5px", 
          textTransform: "uppercase",
          color: "#333",
          mb: 3
        }}
      >
        All Orders
      </Typography>
      
      <Box sx={{ bgcolor: "#fff", borderRadius: "4px", overflow: "hidden" }}>
        <ProductOrders limit={100} />
      </Box>
    </Container>
  );
}

export default FullOrdersPage;