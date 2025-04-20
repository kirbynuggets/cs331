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
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useNavigate } from "react-router-dom";
import ProductInventory from "./products";
import AnalysisOverview from "./analytics";

function Dashboard() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);
  const navigate = useNavigate();

  const handleClick = (event, id) => {
    setAnchorEl(event.currentTarget);
    setMenuOpen(id);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setMenuOpen(null);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar 
        position="static" 
        color="default" 
        elevation={0} 
        sx={{ 
          borderBottom: "1px solid #eaeaea",
          backgroundColor: "#fff"
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between", padding: "0.75rem 2rem" }}>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              fontWeight: 400, 
              letterSpacing: "2px",
              fontSize: "1.2rem",
              color: "#333",
              textTransform: "uppercase"
            }}
          >
            TheBear
          </Typography>
          <Box 
            sx={{ 
              display: "flex", 
              alignItems: "center", 
              bgcolor: "#f9f9f7", 
              borderRadius: "2px", 
              padding: "0.25rem 1rem", 
              width: "30%" 
            }}
          >
            <SearchIcon sx={{ color: "#6f7d5d", mr: 1 }} />
            <InputBase 
              placeholder="Search for products..." 
              sx={{ 
                flex: 1,
                fontSize: "0.9rem",
                color: "#333"
              }} 
            />
          </Box>
          <Box sx={{ display: "flex", gap: 2 }}>
            <IconButton color="inherit" sx={{ color: "#6f7d5d" }}>
              <FavoriteBorderOutlinedIcon sx={{ fontSize: 20 }} />
            </IconButton>
            <IconButton color="inherit" sx={{ color: "#6f7d5d" }}>
              <PersonOutlineOutlinedIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: "flex", flex: 1 }}>
        <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: "#fafafa" }}>
          <Container maxWidth={false}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4, mt: 1 }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 400, 
                  letterSpacing: "1px",
                  fontSize: "1.4rem",
                  color: "#333",
                  textTransform: "uppercase"
                }}
              >
                Dashboard
              </Typography>
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <Avatar 
                  sx={{ 
                    bgcolor: "#f9f9f7", 
                    color: "#6f7d5d", 
                    width: 32, 
                    height: 32, 
                    fontSize: "0.875rem",
                    border: "1px solid #e0e0e0"
                  }}
                >
                  T
                </Avatar>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    alignSelf: "center",
                    fontSize: "0.85rem",
                    letterSpacing: "0.5px",
                    color: "#666"
                  }}
                >
                  Admin
                </Typography>
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