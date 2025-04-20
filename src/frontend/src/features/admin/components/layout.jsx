import React from "react";
import { Box, Container } from "@mui/material";
import Sidebar from "./sidebar";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <Box sx={{ display: "flex", bgcolor: "#f9f9f9", minHeight: "100vh" }}>
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: { xs: 0, md: "240px" },
          p: 3,
          transition: "margin-left 0.3s ease",
        }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 3 } }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;