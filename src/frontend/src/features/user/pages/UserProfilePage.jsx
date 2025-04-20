import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  Divider,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Avatar,
  IconButton,
  Snackbar,
  useTheme,
  alpha,
  styled,
} from '@mui/material';
import {
  Person,
  Lock,
  Edit,
  PhotoCamera,
  Save,
  Close,
  ChevronLeft,
  CheckCircleOutline,
} from '@mui/icons-material';
import { updateUser, updatePassword, selectUser, selectAuthStatus, selectAuthError } from '../../auth/authSlice';

// Styled components
const ProfileContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(6),
}));

const ProfileTabs = styled(Tabs)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderBottom: `1px solid ${theme.palette.divider}`,
  '& .MuiTab-root': {
    textTransform: 'none',
    minWidth: 100,
    fontWeight: 500,
  },
}));

const ProfileSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
}));

const AvatarUpload = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
}));

const LargeAvatar = styled(Avatar)(({ theme }) => ({
  width: 100,
  height: 100,
  fontSize: 40,
  backgroundColor: theme.palette.primary.main,
  marginBottom: theme.spacing(2),
}));

const UploadButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  right: 0,
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  boxShadow: theme.shadows[2],
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
}));

const FieldRow = styled(Grid)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const SaveButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  textTransform: 'none',
  fontWeight: 500,
  padding: theme.spacing(1, 3),
}));

const UserProfilePage = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  
  const user = useSelector(selectUser);
  const authStatus = useSelector(selectAuthStatus);
  const authError = useSelector(selectAuthError);
  
  const [selectedTab, setSelectedTab] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  
  // Form states
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState({
    profile: {},
    password: {},
  });
  
  // Initialize profile data from user
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        pincode: user.pincode || '',
      });
    }
  }, [user]);
  
  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    // Reset edit mode and errors when switching tabs
    setEditMode(false);
    setErrors({
      profile: {},
      password: {},
    });
  };
  
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value,
    });
    
    // Clear error for this field if any
    if (errors.profile[name]) {
      setErrors({
        ...errors,
        profile: {
          ...errors.profile,
          [name]: undefined,
        },
      });
    }
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value,
    });
    
    // Clear error for this field if any
    if (errors.password[name]) {
      setErrors({
        ...errors,
        password: {
          ...errors.password,
          [name]: undefined,
        },
      });
    }
  };
  
  const validateProfileData = () => {
    const profileErrors = {};
    
    if (!profileData.name) {
      profileErrors.name = 'Name is required';
    }
    
    if (!profileData.email) {
      profileErrors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(profileData.email)) {
      profileErrors.email = 'Invalid email address';
    }
    
    if (profileData.phone && !/^\d{10}$/.test(profileData.phone)) {
      profileErrors.phone = 'Phone number must be 10 digits';
    }
    
    if (profileData.pincode && !/^\d{6}$/.test(profileData.pincode)) {
      profileErrors.pincode = 'PIN code must be 6 digits';
    }
    
    setErrors({
      ...errors,
      profile: profileErrors,
    });
    
    return Object.keys(profileErrors).length === 0;
  };
  
  const validatePasswordData = () => {
    const passwordErrors = {};
    
    if (!passwordData.currentPassword) {
      passwordErrors.currentPassword = 'Current password is required';
    }
    
    if (!passwordData.newPassword) {
      passwordErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      passwordErrors.newPassword = 'Password must be at least 6 characters';
    }
    
    if (!passwordData.confirmPassword) {
      passwordErrors.confirmPassword = 'Please confirm your password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      passwordErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors({
      ...errors,
      password: passwordErrors,
    });
    
    return Object.keys(passwordErrors).length === 0;
  };
  
  const handleUpdateProfile = async () => {
    // If not in edit mode, just enable editing
    if (!editMode) {
      setEditMode(true);
      return;
    }
    
    // Validate form data
    if (!validateProfileData()) {
      return;
    }
    
    try {
      await dispatch(updateUser(profileData)).unwrap();
      setEditMode(false);
      setNotification({
        open: true,
        message: 'Profile updated successfully',
        severity: 'success',
      });
    } catch (error) {
      setNotification({
        open: true,
        message: error.message || 'Failed to update profile',
        severity: 'error',
      });
    }
  };
  
  const handleUpdatePassword = async () => {
    if (!validatePasswordData()) {
      return;
    }
    
    try {
      await dispatch(updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })).unwrap();
      
      // Reset password fields
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      setNotification({
        open: true,
        message: 'Password updated successfully',
        severity: 'success',
      });
    } catch (error) {
      setNotification({
        open: true,
        message: error.message || 'Failed to update password',
        severity: 'error',
      });
    }
  };
  
  const handleCancelEdit = () => {
    // Reset profile data to original user data
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        pincode: user.pincode || '',
      });
    }
    setEditMode(false);
    setErrors({
      ...errors,
      profile: {},
    });
  };
  
  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false,
    });
  };
  
  // First letter of name for avatar
  const getInitial = () => {
    return profileData.name ? profileData.name.charAt(0).toUpperCase() : 'U';
  };
  
  const handleImageUpload = (event) => {
    // Handle profile image upload (would need a file upload API endpoint)
    console.log('Image upload:', event.target.files[0]);
    // For now, just show notification
    setNotification({
      open: true,
      message: 'Profile image upload functionality is coming soon',
      severity: 'info',
    });
  };
  
  return (
    <ProfileContainer maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Button 
          component="a"
          href="/user/dashboard"
          startIcon={<ChevronLeft />}
          sx={{ mb: 2, textTransform: 'none' }}
        >
          Back to Dashboard
        </Button>
        <Typography variant="h4" gutterBottom>My Profile</Typography>
      </Box>
      
      <ProfileTabs
        value={selectedTab}
        onChange={handleTabChange}
        indicatorColor="primary"
        textColor="primary"
      >
        <Tab icon={<Person />} label="Personal Info" />
        <Tab icon={<Lock />} label="Change Password" />
      </ProfileTabs>
      
      {/* Tab 1: Personal Info */}
      {selectedTab === 0 && (
        <ProfileSection elevation={0}>
          {authError && selectedTab === 0 && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {authError}
            </Alert>
          )}
          
          <AvatarUpload>
            <Box sx={{ position: 'relative' }}>
              <LargeAvatar>{getInitial()}</LargeAvatar>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="icon-button-file"
                type="file"
                onChange={handleImageUpload}
                disabled={!editMode}
              />
              <label htmlFor="icon-button-file">
                {editMode && (
                  <UploadButton component="span" size="small">
                    <PhotoCamera />
                  </UploadButton>
                )}
              </label>
            </Box>
            <Typography variant="subtitle1" fontWeight={500}>
              {profileData.name || 'User'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {profileData.email || 'email@example.com'}
            </Typography>
          </AvatarUpload>
          
          <Divider sx={{ mb: 3 }} />
          
          <Box component="form" noValidate>
            <Grid container spacing={3}>
              <FieldRow item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={profileData.name}
                  onChange={handleProfileChange}
                  disabled={!editMode}
                  error={!!errors.profile.name}
                  helperText={errors.profile.name}
                  required
                  InputProps={{
                    sx: { borderRadius: theme.shape.borderRadius }
                  }}
                />
              </FieldRow>
              
              <FieldRow item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  disabled={!editMode}
                  error={!!errors.profile.email}
                  helperText={errors.profile.email}
                  required
                  InputProps={{
                    sx: { borderRadius: theme.shape.borderRadius }
                  }}
                />
              </FieldRow>
              
              <FieldRow item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleProfileChange}
                  disabled={!editMode}
                  error={!!errors.profile.phone}
                  helperText={errors.profile.phone}
                  InputProps={{
                    sx: { borderRadius: theme.shape.borderRadius }
                  }}
                />
              </FieldRow>
              
              <FieldRow item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={profileData.address}
                  onChange={handleProfileChange}
                  disabled={!editMode}
                  multiline
                  rows={2}
                  InputProps={{
                    sx: { borderRadius: theme.shape.borderRadius }
                  }}
                />
              </FieldRow>
              
              <FieldRow item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="City"
                  name="city"
                  value={profileData.city}
                  onChange={handleProfileChange}
                  disabled={!editMode}
                  InputProps={{
                    sx: { borderRadius: theme.shape.borderRadius }
                  }}
                />
              </FieldRow>
              
              <FieldRow item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="State"
                  name="state"
                  value={profileData.state}
                  onChange={handleProfileChange}
                  disabled={!editMode}
                  InputProps={{
                    sx: { borderRadius: theme.shape.borderRadius }
                  }}
                />
              </FieldRow>
              
              <FieldRow item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="PIN Code"
                  name="pincode"
                  value={profileData.pincode}
                  onChange={handleProfileChange}
                  disabled={!editMode}
                  error={!!errors.profile.pincode}
                  helperText={errors.profile.pincode}
                  InputProps={{
                    sx: { borderRadius: theme.shape.borderRadius }
                  }}
                />
              </FieldRow>
            </Grid>
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              {editMode ? (
                <>
                  <Button
                    variant="outlined"
                    onClick={handleCancelEdit}
                    startIcon={<Close />}
                    sx={{ mr: 2, textTransform: 'none', borderRadius: theme.shape.borderRadius * 2 }}
                  >
                    Cancel
                  </Button>
                  <SaveButton
                    variant="contained"
                    color="primary"
                    onClick={handleUpdateProfile}
                    startIcon={authStatus === 'loading' ? <CircularProgress size={20} color="inherit" /> : <Save />}
                    disabled={authStatus === 'loading'}
                  >
                    Save Changes
                  </SaveButton>
                </>
              ) : (
                <SaveButton
                  variant="contained"
                  color="primary"
                  onClick={handleUpdateProfile}
                  startIcon={<Edit />}
                >
                  Edit Profile
                </SaveButton>
              )}
            </Box>
          </Box>
        </ProfileSection>
      )}
      
      {/* Tab 2: Change Password */}
      {selectedTab === 1 && (
        <ProfileSection elevation={0}>
          {authError && selectedTab === 1 && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {authError}
            </Alert>
          )}
          
          <Typography variant="h6" gutterBottom>
            Change Password
          </Typography>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            Ensure your account stays secure by using a strong password that you don't use elsewhere.
          </Typography>
          
          <Divider sx={{ mb: 3 }} />
          
          <Box component="form" noValidate>
            <Grid container spacing={3}>
              <FieldRow item xs={12}>
                <TextField
                  fullWidth
                  label="Current Password"
                  name="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  error={!!errors.password.currentPassword}
                  helperText={errors.password.currentPassword}
                  required
                  InputProps={{
                    sx: { borderRadius: theme.shape.borderRadius }
                  }}
                />
              </FieldRow>
              
              <FieldRow item xs={12}>
                <TextField
                  fullWidth
                  label="New Password"
                  name="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  error={!!errors.password.newPassword}
                  helperText={errors.password.newPassword}
                  required
                  InputProps={{
                    sx: { borderRadius: theme.shape.borderRadius }
                  }}
                />
              </FieldRow>
              
              <FieldRow item xs={12}>
                <TextField
                  fullWidth
                  label="Confirm New Password"
                  name="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  error={!!errors.password.confirmPassword}
                  helperText={errors.password.confirmPassword}
                  required
                  InputProps={{
                    sx: { borderRadius: theme.shape.borderRadius }
                  }}
                />
              </FieldRow>
            </Grid>
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <SaveButton
                variant="contained"
                color="primary"
                onClick={handleUpdatePassword}
                startIcon={authStatus === 'loading' ? <CircularProgress size={20} color="inherit" /> : <Save />}
                disabled={authStatus === 'loading'}
              >
                Update Password
              </SaveButton>
            </Box>
          </Box>
        </ProfileSection>
      )}
      
      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          sx={{ width: '100%', borderRadius: theme.shape.borderRadius }}
          icon={notification.severity === 'success' ? <CheckCircleOutline /> : undefined}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </ProfileContainer>
  );
};

export default UserProfilePage;