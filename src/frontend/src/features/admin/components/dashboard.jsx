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
  Avatar,
  Card,
  CardContent,
  useTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import DashboardCustomizeIcon from "@mui/icons-material/DashboardCustomize";
import GroupIcon from "@mui/icons-material/Group";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { useNavigate } from "react-router-dom";
import ProductInventory from "./products";

// New dashboard highlight component
const DashboardHighlights = () => {
  const theme = useTheme();
  
  const highlights = [
    {
      title: "Visitors Today",
      value: "1,842",
      icon: <GroupIcon sx={{ fontSize: 40, color: "#fff" }} />,
      increase: "+12%",
      bgColor: "#7E57C2", // purple
      description: "Total daily visits"
    },
    {
      title: "Daily Sales",
      value: "$8,459",
      icon: <TrendingUpIcon sx={{ fontSize: 40, color: "#fff" }} />,
      increase: "+23%",
      bgColor: "#26A69A", // teal
      description: "Average daily revenue"
    },
    {
      title: "Conversion",
      value: "24%",
      icon: <ShowChartIcon sx={{ fontSize: 40, color: "#fff" }} />,
      increase: "+5%",
      bgColor: "#42A5F5", // blue
      description: "From visitors to sales"
    },
    {
      title: "Active Users",
      value: "328",
      icon: <DashboardCustomizeIcon sx={{ fontSize: 40, color: "#fff" }} />,
      increase: "+18%",
      bgColor: "#EF5350", // red
      description: "Currently browsing"
    }
  ];

  return (
    <Box
      sx={{
        bgcolor: "#fff",
        borderRadius: "8px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        mb: 3,
        overflow: "hidden",
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          padding: "1rem 1.5rem",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Dashboard Highlights</Typography>
      </Box>

      {/* Highlights Grid */}
      <Grid container spacing={3} sx={{ p: 2 }}>
        {highlights.map((item, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              sx={{ 
                bgcolor: "#fff", 
                height: "100%",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 6px 16px rgba(0,0,0,0.1)",
                }
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">{item.title}</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, my: 1 }}>{item.value}</Typography>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: "success.main", 
                          bgcolor: "success.light", 
                          px: 1, 
                          py: 0.5, 
                          borderRadius: 1,
                          fontWeight: 500
                        }}
                      >
                        {item.increase}
                      </Typography>
                      <Typography variant="caption" sx={{ ml: 1, color: "text.secondary" }}>
                        {item.description}
                      </Typography>
                    </Box>
                  </Box>
                  <Avatar 
                    sx={{ 
                      bgcolor: item.bgColor, 
                      width: 56, 
                      height: 56,
                      boxShadow: `0 4px 12px ${item.bgColor}80`
                    }}
                  >
                    {item.icon}
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

function Dashboard() {
  const navigate = useNavigate();

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
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: "flex", flex: 1 }}>
        <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: "#f8f8f8" }}>
          <Container maxWidth={false}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Avatar sx={{ bgcolor: "#fff", color: "#000", width: 32, height: 32, fontSize: "0.875rem" }}>T</Avatar>
                <Typography variant="body2" sx={{ alignSelf: "center" }}>Admin</Typography>
              </Box>
            </Box>

            <ProductInventory showViewMore={true} />
            
            {/* Replace Analytics with Dashboard Highlights */}
            <DashboardHighlights />

          </Container>
        </Box>
      </Box>
    </Box>
  );
}

export default Dashboard;