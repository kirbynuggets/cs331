import React from "react";
import { Container, Typography } from "@mui/material";
import ProductOrders from "../components/orders";

function FullOrdersPage() {
  return (
    <Container>
      <Typography variant="h4" gutterBottom>All Orders</Typography>
      <ProductOrders limit={100} /> {/* Show all items */}
    </Container>
  );
}

export default FullOrdersPage;
