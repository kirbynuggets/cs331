import React from "react";
import { Box, Typography } from "@mui/material";

const SettingsPage = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" color="primary" gutterBottom>
        Settings
      </Typography>
      <Typography variant="body1">
        Configure application settings, preferences, and user profiles.
      </Typography>
    </Box>
  );
};

export default SettingsPage;
