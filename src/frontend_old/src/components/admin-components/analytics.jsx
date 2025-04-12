import React, { useState, useEffect } from "react";
import { Box, Typography, Grid, Card, CardContent, Button } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import InventoryIcon from "@mui/icons-material/Inventory";
import WarningIcon from "@mui/icons-material/Warning";
import { useNavigate, useLocation } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartTooltip, Legend } from "recharts";

// Dummy analytics data
const totalStock = 500;
const totalSales = 120;
const lowStockItems = 8;

const chartData = [
  { name: "Total Stock", value: totalStock, color: "#4CAF50" },
  { name: "Total Sales", value: totalSales, color: "#FF9800" },
  { name: "Low Stock Items", value: lowStockItems, color: "#F44336" },
];

const AnalyticsOverview = ({ showViewMore = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isFullAnalytics = location.pathname === "/admin/dashboard/analytics"; // Check if user is on analytics page

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
      {/* Header */}
      <Box
        sx={{
          padding: "1rem 1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Analytics Overview</Typography>
        {showViewMore && (
          <Button
            variant="text"
            endIcon={<ArrowForwardIcon />}
            onClick={() => navigate("/admin/dashboard/analytics")}
            size="small"
          >
            View Full Analytics
          </Button>
        )}
      </Box>

      {/* Analytics Grid */}
      <Grid container spacing={3} sx={{ p: 2 }}>
        {[
          { icon: <InventoryIcon sx={{ fontSize: 40, color: "#4CAF50" }} />, label: "Total Inventory", value: totalStock, bgColor: "#E8F5E9", textColor: "#2E7D32" },
          { icon: <TrendingUpIcon sx={{ fontSize: 40, color: "#FF9800" }} />, label: "Total Sales", value: totalSales, bgColor: "#FFF3E0", textColor: "#E65100" },
          { icon: <WarningIcon sx={{ fontSize: 40, color: "#F44336" }} />, label: "Low Stock Items", value: lowStockItems, bgColor: "#FFEBEE", textColor: "#B71C1C" },
        ].map((item, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card sx={{ bgcolor: item.bgColor, boxShadow: "none", textAlign: "center", borderRadius: "8px" }}>
              <CardContent>
                {item.icon}
                <Typography sx={{ fontWeight: 600, mt: 1 }}>{item.label}</Typography>
                <Typography variant="h4" sx={{ color: item.textColor }}>{item.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Chart Section - Only for Full Analytics Page */}
      {isFullAnalytics && (
        <Box sx={{ height: 250, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <RechartTooltip formatter={(value, name) => [`${value} units`, name]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Box>
  );
};

export default AnalyticsOverview;
