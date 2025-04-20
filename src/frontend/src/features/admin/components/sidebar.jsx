import React from "react";
import { Box, Typography, Divider, List, ListItem, ListItemButton, ListItemText } from "@mui/material";
import { NavLink, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { label: "Dashboard", path: "/admin/dashboard" },
    { label: "Products", path: "/admin/dashboard/products" },
    { label: "Analytics", path: "/admin/dashboard/analytics" },
    { label: "Settings", path: "/admin/dashboard/settings" },
  ];

  return (
    <Box
      sx={{
        width: 240,
        height: "100vh",
        flexShrink: 0,
        borderRight: "1px solid #eaeaea",
        bgcolor: "#fff",
        position: "fixed",
        top: 0,
        left: 0,
        overflowY: "auto",
      }}
    >
      <Box sx={{ p: 4, pt: 5, pb: 3 }}>
        <Typography variant="h6" sx={{ 
          fontWeight: 400, 
          letterSpacing: "1px", 
          fontSize: "1rem" 
        }}>
          ADMIN DASHBOARD
        </Typography>
      </Box>
      <Divider sx={{ borderColor: "#eaeaea" }} />
      <List component="nav" sx={{ pt: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              component={NavLink}
              to={item.path}
              sx={{
                py: 1.5,
                px: 4,
                color: location.pathname === item.path ? "#000" : "#767676",
                borderLeft: location.pathname === item.path ? '3px solid #000' : '3px solid transparent',
                '&:hover': {
                  bgcolor: 'transparent',
                  color: '#000',
                },
              }}
            >
              <ListItemText 
                primary={item.label} 
                primaryTypographyProps={{ 
                  fontSize: "0.85rem", 
                  letterSpacing: "0.5px",
                  fontWeight: location.pathname === item.path ? 500 : 400
                }} 
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Sidebar;