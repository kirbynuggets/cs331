import React from "react";
import { Box, Typography, Divider } from "@mui/material";
import { NavLink, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { label: "Dashboard", path: "/admin/dashboard" },
    { label: "Products", path: "/admin/dashboard/products" },
    // Analytics menu item removed
    { label: "Settings", path: "/admin/dashboard/settings" },
  ];

  return (
    <Box
      sx={{
        width: 240,
        height: "100vh",
        flexShrink: 0,
        borderRight: "1px solid #e0e0e0",
        bgcolor: "#fff",
        padding: "2rem 0",
        position: "fixed",
        top: 0,
        left: 0,
        overflowY: "auto",
      }}
    >
      <Typography variant="subtitle1" sx={{ fontWeight: 600, padding: "0 1.5rem", marginBottom: "1rem" }}>
        ADMIN DASHBOARD
      </Typography>
      <Divider />
      <Box component="nav" sx={{ paddingTop: "1rem" }}>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={{
              textDecoration: "none",
              display: "block",
              padding: "0.75rem 1.5rem",
              fontWeight: 500,
              backgroundColor: location.pathname === item.path ? "#f5f5f5" : "transparent",
              color: location.pathname === item.path ? "#26A69A" : "#000",
            }}
          >
            {item.label}
          </NavLink>
        ))}
      </Box>
    </Box>
  );
};

export default Sidebar;