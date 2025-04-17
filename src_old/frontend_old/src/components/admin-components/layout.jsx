import React from "react";
import { Box } from "@mui/material";
import Sidebar from "./sidebar";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <Box sx={{ display: "flex" }}>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 1, // Reduce padding here if needed
          ml: -2, // Adjust margin-left if there’s unwanted space
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
