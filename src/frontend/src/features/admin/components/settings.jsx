import React from "react";
import { Box, Typography, Paper, Grid, Switch, FormControlLabel, Divider, TextField, Button } from "@mui/material";

const SettingsPage = () => {
  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 500, color: "#333" }}>
        Settings
      </Typography>
      
      <Paper sx={{ p: 3, mb: 4, borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 500, color: "#424242" }}>
          General Settings
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={<Switch defaultChecked color="primary" />}
              label="Enable dark mode"
              sx={{ mb: 2, display: "block" }}
            />
            <FormControlLabel
              control={<Switch defaultChecked color="primary" />}
              label="Email notifications"
              sx={{ mb: 2, display: "block" }}
            />
            <FormControlLabel
              control={<Switch color="primary" />}
              label="SMS notifications"
              sx={{ mb: 2, display: "block" }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={<Switch defaultChecked color="primary" />}
              label="Show stock warnings"
              sx={{ mb: 2, display: "block" }}
            />
            <FormControlLabel
              control={<Switch defaultChecked color="primary" />}
              label="Auto refresh dashboard"
              sx={{ mb: 2, display: "block" }}
            />
            <FormControlLabel
              control={<Switch color="primary" />}
              label="Enable analytics tracking"
              sx={{ mb: 2, display: "block" }}
            />
          </Grid>
        </Grid>
      </Paper>
      
      <Paper sx={{ p: 3, mb: 4, borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 500, color: "#424242" }}>
          Profile Information
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Full Name"
              defaultValue="Admin User"
              fullWidth
              variant="outlined"
              sx={{ mb: 3 }}
              size="small"
            />
            <TextField
              label="Email Address"
              defaultValue="admin@thebear.com"
              fullWidth
              variant="outlined"
              sx={{ mb: 3 }}
              size="small"
            />
            <TextField
              label="Phone Number"
              defaultValue="+1 (555) 123-4567"
              fullWidth
              variant="outlined"
              sx={{ mb: 3 }}
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              label="Current Password"
              type="password"
              fullWidth
              variant="outlined"
              sx={{ mb: 3 }}
              size="small"
            />
            <TextField
              label="New Password"
              type="password"
              fullWidth
              variant="outlined"
              sx={{ mb: 3 }}
              size="small"
            />
            <TextField
              label="Confirm New Password"
              type="password"
              fullWidth
              variant="outlined"
              sx={{ mb: 3 }}
              size="small"
            />
          </Grid>
        </Grid>
        
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button variant="outlined" color="inherit" sx={{ mr: 2 }}>
            Cancel
          </Button>
          <Button variant="contained" color="primary">
            Save Changes
          </Button>
        </Box>
      </Paper>
      
      <Paper sx={{ p: 3, borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 500, color: "#424242" }}>
          Store Settings
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Store Name"
              defaultValue="TheBear"
              fullWidth
              variant="outlined"
              sx={{ mb: 3 }}
              size="small"
            />
            <TextField
              label="Store Address"
              defaultValue="123 Commerce St, New York, NY 10001"
              fullWidth
              variant="outlined"
              sx={{ mb: 3 }}
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              label="Support Email"
              defaultValue="support@thebear.com"
              fullWidth
              variant="outlined"
              sx={{ mb: 3 }}
              size="small"
            />
            <TextField
              label="Support Phone"
              defaultValue="+1 (800) 123-4567"
              fullWidth
              variant="outlined"
              sx={{ mb: 3 }}
              size="small"
            />
          </Grid>
        </Grid>
        
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button variant="outlined" color="inherit" sx={{ mr: 2 }}>
            Cancel
          </Button>
          <Button variant="contained" color="primary">
            Save Changes
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default SettingsPage;