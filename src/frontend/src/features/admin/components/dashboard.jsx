import React, { useState } from "react";
import {
  Box,
  Container,
  Grid,
  IconButton,
  Typography,
  AppBar,
  Toolbar,
  InputBase,
  Badge,
  Avatar,
  Divider,
  Button,
  Menu,
  MenuItem,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import { useNavigate } from "react-router-dom";
import ProductInventory from "./products";
import AnalysisOverview from "./analytics";

function Dashboard() {
  const navigate = useNavigate();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar position="static" color="default" elevation={0} sx={{ 
        borderBottom: "1px solid #eaeaea",
        bgcolor: "#fff"
      }}>
        <Toolbar sx={{ justifyContent: "space-between", padding: "0.75rem 2rem" }}>
          <Typography variant="h6" component="div" sx={{ 
            fontWeight: 400, 
            letterSpacing: "1.5px",
            fontSize: "1.1rem"
          }}>
            WESTSIDE
          </Typography>
          <Box sx={{ 
            display: "flex", 
            alignItems: "center", 
            border: "1px solid #eaeaea", 
            borderRadius: "0", 
            padding: "0.25rem 1rem", 
            width: "30%" 
          }}>
            <SearchIcon sx={{ color: "#767676", mr: 1 }} />
            <InputBase placeholder="Search for products..." sx={{ flex: 1 }} />
          </Box>
          <Box sx={{ display: "flex", gap: 3 }}>
            <IconButton color="inherit"><FavoriteBorderOutlinedIcon /></IconButton>
            <IconButton color="inherit"><PersonOutlineOutlinedIcon /></IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: "flex", flex: 1 }}>
        <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: "#f8f8f8" }}>
          <Container maxWidth={false}>
            <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", mb: 4, mt: 1 }}>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Typography variant="body2" sx={{ alignSelf: "center" }}>Admin</Typography>
                <Avatar sx={{ 
                  bgcolor: "#242424", 
                  color: "#fff", 
                  width: 32, 
                  height: 32, 
                  fontSize: "0.875rem" 
                }}>A</Avatar>
              </Box>
            </Box>

            <ProductInventory showViewMore={true} />
            <AnalysisOverview showViewMore={true} />
          </Container>
        </Box>
      </Box>
    </Box>
  );
}

export default Dashboard;