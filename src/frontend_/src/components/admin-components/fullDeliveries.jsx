import React from "react";
import { Container, Typography } from "@mui/material";
import ProductDelivery from "../components/delivery";

function FullDeliveriesPage() {
  return (
    <Container>
      <Typography variant="h4" gutterBottom>All Deliveries</Typography>
      <ProductDelivery limit={100} /> {/* Show all items */}
    </Container>
  );
}

export default FullDeliveriesPage;
