import React, { useState, useContext } from "react";
import {
  Box,
  Typography,
  Divider,
  Switch,
  TextField,
  Button,
  Paper,
  Grid,
  Avatar,
  IconButton,
  Snackbar,
  Alert,
  FormControlLabel,
  Card,
  CardContent,
  Tabs,
  Tab,
} from "@mui/material";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import SaveIcon from "@mui/icons-material/Save";
import { ThemeContext } from "../context/ThemeContext";

// Tab Panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const SettingsPage = () => {
  // Theme context
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  
  // Tab state
  const [tabValue, setTabValue] = useState(0);
  
  // Profile state
  const [profileData, setProfileData] = useState({
    name: "Admin User",
    email: "admin@example.com",
    phone: "555-123-4567",
    avatar: "/api/placeholder/80/80", // Placeholder avatar
  });
  
  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  
  // Store information state
  const [storeData, setStoreData] = useState({
    storeName: "TheBear",
    storeEmail: "contact@thebear.com",
    storeAddress: "123 Commerce St, New York, NY 10001",
    currency: "USD",
  });
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle profile data change
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value,
    });
  };

  // Handle password change
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value,
    });
  };

  // Handle store data change
  const handleStoreChange = (e) => {
    const { name, value } = e.target;
    setStoreData({
      ...storeData,
      [name]: value,
    });
  };

  // Save profile
  const handleSaveProfile = () => {
    // Here you would typically send this data to your API
    console.log("Saving profile:", profileData);
    setSnackbar({
      open: true,
      message: "Profile updated successfully!",
      severity: "success",
    });
  };

  // Save password
  const handleSavePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setSnackbar({
        open: true,
        message: "New passwords do not match!",
        severity: "error",
      });
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      setSnackbar({
        open: true,
        message: "Password must be at least 8 characters!",
        severity: "error",
      });
      return;
    }
    
    // Here you would typically send this data to your API
    console.log("Saving password:", passwordData);
    setSnackbar({
      open: true,
      message: "Password updated successfully!",
      severity: "success",
    });
    
    // Clear password fields
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  // Save store information
  const handleSaveStore = () => {
    // Here you would typically send this data to your API
    console.log("Saving store info:", storeData);
    setSnackbar({
      open: true,
      message: "Store information updated successfully!",
      severity: "success",
    });
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", mt: 2 }}>
      <Typography variant="h4" color="primary" gutterBottom sx={{ mb: 3 }}>
        Settings
      </Typography>
      
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="General" />
          <Tab label="Profile" />
          <Tab label="Security" />
          <Tab label="Store Info" />
        </Tabs>
        
        {/* General Settings Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ p: 2 }}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Appearance
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={darkMode}
                      onChange={toggleDarkMode}
                      color="primary"
                    />
                  }
                  label="Dark Mode"
                />
                
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Toggle between light and dark theme for the admin dashboard.
                </Typography>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Language & Region
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      select
                      fullWidth
                      label="Language"
                      value="english"
                      SelectProps={{
                        native: true,
                      }}
                      variant="outlined"
                      sx={{ mb: 2 }}
                    >
                      <option value="english">English</option>
                      <option value="spanish">Spanish</option>
                      <option value="french">French</option>
                    </TextField>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      select
                      fullWidth
                      label="Time Zone"
                      value="utc-5"
                      SelectProps={{
                        native: true,
                      }}
                      variant="outlined"
                      sx={{ mb: 2 }}
                    >
                      <option value="utc-8">Pacific Time (UTC-8)</option>
                      <option value="utc-7">Mountain Time (UTC-7)</option>
                      <option value="utc-6">Central Time (UTC-6)</option>
                      <option value="utc-5">Eastern Time (UTC-5)</option>
                    </TextField>
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                  >
                    Save Changes
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </TabPanel>
        
        {/* Profile Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 2 }}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Profile Information
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={3} sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <Avatar
                      src={profileData.avatar}
                      sx={{ width: 100, height: 100, mb: 2 }}
                    />
                    <input
                      accept="image/*"
                      style={{ display: "none" }}
                      id="avatar-upload"
                      type="file"
                    />
                    <label htmlFor="avatar-upload">
                      <IconButton
                        color="primary"
                        aria-label="upload picture"
                        component="span"
                      >
                        <PhotoCamera />
                      </IconButton>
                    </label>
                    <Typography variant="caption" sx={{ mt: 1 }}>
                      Upload new avatar
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={9}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          name="name"
                          label="Full Name"
                          value={profileData.name}
                          onChange={handleProfileChange}
                          variant="outlined"
                          sx={{ mb: 2 }}
                        />
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          name="email"
                          label="Email Address"
                          value={profileData.email}
                          onChange={handleProfileChange}
                          variant="outlined"
                          sx={{ mb: 2 }}
                        />
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          name="phone"
                          label="Phone Number"
                          value={profileData.phone}
                          onChange={handleProfileChange}
                          variant="outlined"
                          sx={{ mb: 2 }}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveProfile}
                  >
                    Save Profile
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </TabPanel>
        
        {/* Security Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ p: 2 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Change Password
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      name="currentPassword"
                      label="Current Password"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      name="newPassword"
                      label="New Password"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      variant="outlined"
                      sx={{ mb: 2 }}
                      helperText="Password must be at least 8 characters"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      name="confirmPassword"
                      label="Confirm New Password"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      variant="outlined"
                      sx={{ mb: 2 }}
                      error={passwordData.newPassword !== passwordData.confirmPassword && passwordData.confirmPassword !== ""}
                      helperText={passwordData.newPassword !== passwordData.confirmPassword && passwordData.confirmPassword !== "" ? "Passwords do not match" : ""}
                    />
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                    onClick={handleSavePassword}
                  >
                    Update Password
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </TabPanel>
        
        {/* Store Info Tab */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ p: 2 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Store Information
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      name="storeName"
                      label="Store Name"
                      value={storeData.storeName}
                      onChange={handleStoreChange}
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      name="storeEmail"
                      label="Store Email"
                      value={storeData.storeEmail}
                      onChange={handleStoreChange}
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      name="storeAddress"
                      label="Store Address"
                      value={storeData.storeAddress}
                      onChange={handleStoreChange}
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      select
                      fullWidth
                      name="currency"
                      label="Currency"
                      value={storeData.currency}
                      onChange={handleStoreChange}
                      SelectProps={{
                        native: true,
                      }}
                      variant="outlined"
                      sx={{ mb: 2 }}
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="JPY">JPY (¥)</option>
                    </TextField>
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveStore}
                  >
                    Save Store Info
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </TabPanel>
      </Paper>
      
      {/* Notification Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SettingsPage;