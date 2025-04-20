import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Button,
  Card,
  CardContent,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Divider,
  Checkbox,
  Alert,
  Fade,
  Slide,
  useTheme,
  alpha,
  styled,
} from '@mui/material';
import {
  Home,
  Business,
  LocationOn,
  Edit,
  Delete,
  Add,
  Close,
  CheckCircle,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { 
  addAddress, 
  updateAddress, 
  deleteAddress, 
  setDefaultAddress,
  selectAddresses,
  selectAddressesStatus,
  selectAddressesError
} from '../userSlice';

// Styled components
const AddressCard = styled(Card)(({ theme, selected, defaultAddress }) => ({
  height: '100%',
  position: 'relative',
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
  borderRadius: theme.shape.borderRadius,
  border: selected 
    ? `2px solid ${theme.palette.primary.main}` 
    : defaultAddress 
      ? `2px solid ${theme.palette.secondary.main}` 
      : `1px solid ${theme.palette.divider}`,
  backgroundColor: selected 
    ? alpha(theme.palette.primary.main, 0.05)
    : defaultAddress && !selected
      ? alpha(theme.palette.secondary.main, 0.03)
      : theme.palette.background.paper,
  '&:hover': {
    boxShadow: theme.shadows[2],
    borderColor: selected 
      ? theme.palette.primary.main 
      : defaultAddress && !selected
        ? theme.palette.secondary.main
        : theme.palette.primary.light,
  },
}));

const AddressTypeIcon = styled(Box)(({ theme, addressType, defaultAddress }) => {
  let bgColor = theme.palette.action.hover;
  let iconColor = theme.palette.text.secondary;
  
  if (defaultAddress) {
    bgColor = alpha(theme.palette.secondary.main, 0.1);
    iconColor = theme.palette.secondary.main;
  }
  
  return {
    position: 'absolute',
    top: theme.spacing(2),
    right: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(0.75),
    borderRadius: '50%',
    backgroundColor: bgColor,
    color: iconColor,
  };
});

const AddressActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  marginTop: theme.spacing(2),
}));

const DefaultChip = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  backgroundColor: alpha(theme.palette.secondary.main, 0.1),
  color: theme.palette.secondary.main,
  borderRadius: theme.shape.borderRadius * 4,
  padding: theme.spacing(0.5, 1.5),
  fontSize: '0.75rem',
  fontWeight: 600,
  marginBottom: theme.spacing(1),
}));

const SlideTransition = (props) => {
  return <Slide {...props} direction="up" />;
};

const AddressBook = ({ selectMode = false, onSelectAddress = null }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  
  const addresses = useSelector(selectAddresses);
  const status = useSelector(selectAddressesStatus);
  const error = useSelector(selectAddressesError);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedForDelivery, setSelectedForDelivery] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  
  // Form state
  const [addressForm, setAddressForm] = useState({
    fullName: '',
    phone: '',
    pincode: '',
    address: '',
    city: '',
    state: '',
    addressType: 'home',
    isDefault: false,
  });
  
  // Form validation errors
  const [formErrors, setFormErrors] = useState({});
  
  // Set initial selected address if in select mode
  useEffect(() => {
    if (selectMode && addresses.length > 0) {
      const defaultAddress = addresses.find(addr => addr.isDefault);
      setSelectedForDelivery(defaultAddress ? defaultAddress.id : addresses[0].id);
    }
  }, [selectMode, addresses]);
  
  const handleOpenDialog = (address = null) => {
    if (address) {
      // Edit mode
      setSelectedAddress(address.id);
      setAddressForm({
        fullName: address.fullName || '',
        phone: address.phone || '',
        pincode: address.pincode || '',
        address: address.address || '',
        city: address.city || '',
        state: address.state || '',
        addressType: address.addressType || 'home',
        isDefault: address.isDefault || false,
      });
    } else {
      // Add mode
      setSelectedAddress(null);
      setAddressForm({
        fullName: '',
        phone: '',
        pincode: '',
        address: '',
        city: '',
        state: '',
        addressType: 'home',
        isDefault: addresses.length === 0, // First address is default
      });
    }
    setFormErrors({});
    setDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedAddress(null);
  };
  
  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setAddressForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field when user types
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!addressForm.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }
    
    if (!addressForm.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(addressForm.phone)) {
      errors.phone = 'Phone number must be 10 digits';
    }
    
    if (!addressForm.pincode.trim()) {
      errors.pincode = 'PIN code is required';
    } else if (!/^\d{6}$/.test(addressForm.pincode)) {
      errors.pincode = 'PIN code must be 6 digits';
    }
    
    if (!addressForm.address.trim()) {
      errors.address = 'Address is required';
    }
    
    if (!addressForm.city.trim()) {
      errors.city = 'City is required';
    }
    
    if (!addressForm.state.trim()) {
      errors.state = 'State is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSaveAddress = () => {
    if (!validateForm()) {
      return;
    }
    
    const addressData = { ...addressForm };
    
    if (selectedAddress) {
      // Update existing address
      dispatch(updateAddress({ id: selectedAddress, addressData }))
        .unwrap()
        .then(() => {
          setNotification({
            open: true,
            message: 'Address updated successfully',
            severity: 'success'
          });
          handleCloseDialog();
        })
        .catch(err => {
          setNotification({
            open: true,
            message: err.message || 'Failed to update address',
            severity: 'error'
          });
        });
    } else {
      // Add new address
      dispatch(addAddress(addressData))
        .unwrap()
        .then(() => {
          setNotification({
            open: true,
            message: 'Address added successfully',
            severity: 'success'
          });
          handleCloseDialog();
        })
        .catch(err => {
          setNotification({
            open: true,
            message: err.message || 'Failed to add address',
            severity: 'error'
          });
        });
    }
  };
  
  const handleDeleteAddress = (addressId) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      dispatch(deleteAddress(addressId))
        .unwrap()
        .then(() => {
          setNotification({
            open: true,
            message: 'Address deleted successfully',
            severity: 'success'
          });
        })
        .catch(err => {
          setNotification({
            open: true,
            message: err.message || 'Failed to delete address',
            severity: 'error'
          });
        });
    }
  };
  
  const handleSetDefaultAddress = (addressId) => {
    dispatch(setDefaultAddress(addressId))
      .unwrap()
      .then(() => {
        setNotification({
          open: true,
          message: 'Default address updated',
          severity: 'success'
        });
      })
      .catch(err => {
        setNotification({
          open: true,
          message: err.message || 'Failed to update default address',
          severity: 'error'
        });
      });
  };
  
  const handleSelectDeliveryAddress = (addressId) => {
    if (selectMode) {
      setSelectedForDelivery(addressId);
      // If there's a callback for address selection, call it with the selected address
      if (onSelectAddress) {
        const selectedAddr = addresses.find(addr => addr.id === addressId);
        onSelectAddress(selectedAddr);
      }
    }
  };
  
  const getAddressIcon = (type) => {
    switch (type) {
      case 'work':
        return <Business />;
      case 'home':
      default:
        return <Home />;
    }
  };
  
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };
  
  return (
    <Box sx={{ py: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {selectMode && addresses.length > 0 && (
        <Typography variant="subtitle1" gutterBottom>
          Select a delivery address
        </Typography>
      )}
      
      <Grid container spacing={3}>
        {addresses.map((address, index) => (
          <Grid item xs={12} sm={6} md={4} key={address.id}>
            <Fade in={true} timeout={300 + index * 100}>
              <AddressCard 
                elevation={0}
                selected={selectMode && selectedForDelivery === address.id}
                defaultAddress={address.isDefault}
                onClick={() => handleSelectDeliveryAddress(address.id)}
              >
                <CardContent>
                  {address.isDefault && (
                    <DefaultChip>
                      <CheckCircle fontSize="small" sx={{ mr: 0.5 }} />
                      Default
                    </DefaultChip>
                  )}
                  
                  <Typography variant="subtitle1" gutterBottom>
                    {address.fullName}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {address.address}, {address.city}, {address.state} - {address.pincode}
                  </Typography>
                  
                  <Typography variant="body2" gutterBottom>
                    Phone: {address.phone}
                  </Typography>
                  
                  <AddressTypeIcon addressType={address.addressType} defaultAddress={address.isDefault}>
                    {getAddressIcon(address.addressType)}
                  </AddressTypeIcon>
                  
                  {!selectMode && (
                    <AddressActions>
                      {!address.isDefault && (
                        <Button 
                          variant="text" 
                          size="small" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSetDefaultAddress(address.id);
                          }}
                          sx={{ mr: 1, textTransform: 'none' }}
                        >
                          Set as Default
                        </Button>
                      )}
                      
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDialog(address);
                        }}
                        sx={{ mr: 1 }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteAddress(address.id);
                        }}
                        disabled={address.isDefault}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </AddressActions>
                  )}
                </CardContent>
              </AddressCard>
            </Fade>
          </Grid>
        ))}
        
        {/* Add New Address Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Fade in={true} timeout={300 + addresses.length * 100}>
            <Card
              elevation={0}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                p: 3,
                border: `1px dashed ${theme.palette.divider}`,
                borderRadius: theme.shape.borderRadius,
                cursor: 'pointer',
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  bgcolor: alpha(theme.palette.primary.main, 0.02),
                },
              }}
              onClick={() => handleOpenDialog()}
            >
              <Add sx={{ fontSize: 40, color: 'text.secondary', mb: 2 }} />
              <Typography variant="subtitle1" align="center">
                Add New Address
              </Typography>
            </Card>
          </Fade>
        </Grid>
      </Grid>
      
      {/* Add/Edit Address Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
        TransitionComponent={SlideTransition}
      >
        <DialogTitle>
          {selectedAddress ? 'Edit Address' : 'Add New Address'}
          <IconButton
            onClick={handleCloseDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Full Name"
                name="fullName"
                value={addressForm.fullName}
                onChange={handleInputChange}
                fullWidth
                required
                error={!!formErrors.fullName}
                helperText={formErrors.fullName}
                InputProps={{
                  sx: { borderRadius: theme.shape.borderRadius }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Phone Number"
                name="phone"
                value={addressForm.phone}
                onChange={handleInputChange}
                fullWidth
                required
                error={!!formErrors.phone}
                helperText={formErrors.phone}
                inputProps={{ maxLength: 10 }}
                InputProps={{
                  sx: { borderRadius: theme.shape.borderRadius }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="PIN Code"
                name="pincode"
                value={addressForm.pincode}
                onChange={handleInputChange}
                fullWidth
                required
                error={!!formErrors.pincode}
                helperText={formErrors.pincode}
                inputProps={{ maxLength: 6 }}
                InputProps={{
                  sx: { borderRadius: theme.shape.borderRadius }
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Address"
                name="address"
                value={addressForm.address}
                onChange={handleInputChange}
                fullWidth
                required
                multiline
                rows={2}
                error={!!formErrors.address}
                helperText={formErrors.address}
                InputProps={{
                  sx: { borderRadius: theme.shape.borderRadius }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="City"
                name="city"
                value={addressForm.city}
                onChange={handleInputChange}
                fullWidth
                required
                error={!!formErrors.city}
                helperText={formErrors.city}
                InputProps={{
                  sx: { borderRadius: theme.shape.borderRadius }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="State"
                name="state"
                value={addressForm.state}
                onChange={handleInputChange}
                fullWidth
                required
                error={!!formErrors.state}
                helperText={formErrors.state}
                InputProps={{
                  sx: { borderRadius: theme.shape.borderRadius }
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Address Type
              </Typography>
              <FormControl component="fieldset">
                <RadioGroup
                  row
                  name="addressType"
                  value={addressForm.addressType}
                  onChange={handleInputChange}
                >
                  <FormControlLabel value="home" control={<Radio color="primary" />} label="Home" />
                  <FormControlLabel value="work" control={<Radio color="primary" />} label="Work" />
                  <FormControlLabel value="other" control={<Radio color="primary" />} label="Other" />
                </RadioGroup>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <FormControlLabel
                control={
                  <Checkbox
                    name="isDefault"
                    checked={addressForm.isDefault}
                    onChange={handleInputChange}
                    color="primary"
                    disabled={selectedAddress && addresses.find(a => a.id === selectedAddress)?.isDefault}
                  />
                }
                label="Set as default address"
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog} color="inherit" sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveAddress}
            variant="contained"
            color="primary"
            disabled={status === 'loading'}
            sx={{ textTransform: 'none', borderRadius: theme.shape.borderRadius * 2 }}
          >
            {status === 'loading' ? 'Saving...' : 'Save Address'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Notification Snackbar - You'd implement this with MUI Snackbar component */}
      {/* We'll use the notification state values (open, message, severity) */}
    </Box>
  );
};

export default AddressBook;