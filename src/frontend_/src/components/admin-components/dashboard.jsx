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
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
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
      <AppBar position="static" color="default" elevation={0} sx={{ borderBottom: "1px solid #e0e0e0" }}>
        <Toolbar sx={{ justifyContent: "space-between", padding: "0.5rem 2rem" }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 700, letterSpacing: "1px" }}>
            TheBear
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", bgcolor: "#f5f5f5", borderRadius: "4px", padding: "0.25rem 1rem", width: "30%" }}>
            <SearchIcon sx={{ color: "#757575", mr: 1 }} />
            <InputBase placeholder="Search for products..." sx={{ flex: 1 }} />
          </Box>
          <Box sx={{ display: "flex", gap: 3 }}>
            <IconButton color="inherit"><FavoriteBorderOutlinedIcon /></IconButton>
            <IconButton color="inherit"><PersonOutlineOutlinedIcon /></IconButton>
            {/* <IconButton color="inherit"><Badge badgeContent={3} color="primary"><ShoppingBagOutlinedIcon /></Badge></IconButton> */}
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: "flex", flex: 1 }}>

        <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: "#f8f8f8" }}>
          <Container maxWidth={false}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              {/* <Typography variant="h5" sx={{ fontWeight: 500 }}>Dashboard Overview</Typography> */}
              <Box sx={{ display: "flex", gap: 1 }}>
                <Avatar sx={{ bgcolor: "#fff", color: "#000", width: 32, height: 32, fontSize: "0.875rem" }}>T</Avatar>
                <Typography variant="body2" sx={{ alignSelf: "center" }}>Admin</Typography>
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
