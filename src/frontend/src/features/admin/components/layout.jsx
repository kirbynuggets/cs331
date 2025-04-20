import React from "react";
import { Box } from "@mui/material";
import Sidebar from "./sidebar";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <Box sx={{ display: "flex", bgcolor: "#fafafa" }}>
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 2,
          ml: "240px", // Matches sidebar width
          minHeight: "100vh",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;