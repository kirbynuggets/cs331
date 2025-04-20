import React from "react";
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
  { name: "Total Stock", value: totalStock, color: "#6f7d5d" },
  { name: "Total Sales", value: totalSales, color: "#a1a995" },
  { name: "Low Stock Items", value: lowStockItems, color: "#d8b78e" },
];

const AnalyticsOverview = ({ showViewMore = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isFullAnalytics = location.pathname === "/admin/dashboard/analytics"; // Check if user is on analytics page

  return (
    <Box
      sx={{
        bgcolor: "#fff",
        borderRadius: "4px",
        boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
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
          borderBottom: "1px solid #f5f5f5",
        }}
      >
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 400, 
            fontSize: "1.1rem",
            letterSpacing: "0.5px",
            textTransform: "uppercase",
            color: "#333"
          }}
        >
          Analytics Overview
        </Typography>
        {showViewMore && (
          <Button
            variant="text"
            endIcon={<ArrowForwardIcon sx={{ fontSize: 18 }} />}
            onClick={() => navigate("/admin/dashboard/analytics")}
            size="small"
            sx={{ 
              textTransform: "none", 
              color: "#6f7d5d",
              fontSize: "0.85rem",
              '&:hover': {
                backgroundColor: "transparent",
                color: "#464e3b"
              }
            }}
          >
            View Full Analytics
          </Button>
        )}
      </Box>

      {/* Analytics Grid */}
      <Grid container spacing={2} sx={{ p: 2 }}>
        {[
          { icon: <InventoryIcon sx={{ fontSize: 28, color: "#6f7d5d" }} />, label: "Total Inventory", value: totalStock, bgColor: "#f9f9f7", textColor: "#464e3b" },
          { icon: <TrendingUpIcon sx={{ fontSize: 28, color: "#6f7d5d" }} />, label: "Total Sales", value: totalSales, bgColor: "#f9f9f7", textColor: "#464e3b" },
          { icon: <WarningIcon sx={{ fontSize: 28, color: "#d8b78e" }} />, label: "Low Stock Items", value: lowStockItems, bgColor: "#f9f9f7", textColor: "#464e3b" },
        ].map((item, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card sx={{ bgcolor: item.bgColor, boxShadow: "none", textAlign: "center", borderRadius: "4px", border: "1px solid #f0f0f0" }}>
              <CardContent sx={{ padding: "1.5rem 1rem" }}>
                {item.icon}
                <Typography sx={{ fontWeight: 400, mt: 1, fontSize: "0.85rem", letterSpacing: "0.5px", textTransform: "uppercase" }}>{item.label}</Typography>
                <Typography variant="h4" sx={{ color: item.textColor, fontWeight: 300, mt: 1 }}>{item.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Chart Section - Only for Full Analytics Page */}
      {isFullAnalytics && (
        <Box sx={{ height: 300, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", p: 2, mt: 2 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={110}
                paddingAngle={4}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <RechartTooltip formatter={(value, name) => [`${value} units`, name]} />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Box>
  );
};

export default AnalyticsOverview;