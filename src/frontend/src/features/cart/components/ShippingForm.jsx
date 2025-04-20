import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  Paper,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Checkbox,
  FormControlLabel,
  Card,
  Radio,
  RadioGroup,
  useTheme,
  alpha,
  styled,
} from '@mui/material';
import { 
  NavigateBefore, 
  ArrowForward, 
  LocationOn,
  Home,
  Apartment,
  BusinessCenter
} from '@mui/icons-material';
import { saveShippingInfo, selectCart } from '../cartSlice';
import { selectUser } from '../../auth/authSlice';

// Styled components
const AddressCard = styled(Card)(({ theme, selected }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  cursor: 'pointer',
  border: selected ? `2px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: selected ? alpha(theme.palette.primary.light, 0.05) : theme.palette.background.paper,
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: selected ? theme.palette.primary.main : theme.palette.primary.light,
    boxShadow: theme.shadows[1],
  },
}));

const DeliveryOption = styled(Box)(({ theme, selected }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  cursor: 'pointer',
  border: selected ? `2px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: selected ? alpha(theme.palette.primary.light, 0.05) : theme.palette.background.paper,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: selected ? theme.palette.primary.main : theme.palette.primary.light,
    boxShadow: theme.shadows[1],
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  borderRadius: theme.shape.borderRadius * 4,
  fontWeight: 500,
}));

const ProceedButton = styled(Button)(({ theme }) => ({
  width: '100%',
  height: '48px',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
  color: theme.palette.primary.contrastText,
  borderRadius: theme.shape.borderRadius * 4,
  textTransform: 'none',
  fontWeight: 600,
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: -100,
    width: '100%',
    height: '100%',
    background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.primary.contrastText, 0.15)}, transparent)`,
    transition: '0.5s',
  },
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.9),
    boxShadow: theme.shadows[4],
  },
  '&:hover::after': {
    left: '120%',
  },
}));

const OrderSummaryCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  position: 'sticky',
  top: theme.spacing(2),
}));

const SummaryRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(1.5),
}));

// Form validation
const validateShippingForm = (values) => {
  const errors = {};

  if (!values.fullName.trim()) {
    errors.fullName = 'Full name is required';
  }

  if (!values.address.trim()) {
    errors.address = 'Address is required';
  }

  if (!values.city.trim()) {
    errors.city = 'City is required';
  }

  if (!values.state.trim()) {
    errors.state = 'State is required';
  }

  if (!values.pincode.trim()) {
    errors.pincode = 'PIN code is required';
  } else if (!/^[0-9]{6}$/.test(values.pincode)) {
    errors.pincode = 'PIN code must be 6 digits';
  }

  if (!values.phone.trim()) {
    errors.phone = 'Phone number is required';
  } else if (!/^[0-9]{10}$/.test(values.phone)) {
    errors.phone = 'Phone number must be 10 digits';
  }

  if (!values.email.trim()) {
    errors.email = 'Email is required';
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
    errors.email = 'Invalid email address';
  }

  return errors;
};

// Shipping Form Component
const ShippingForm = ({ onBack, onNext }) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  
  const { totalPrice, items, shippingInfo } = useSelector(selectCart);
  const user = useSelector(selectUser);
  
  // Sample saved addresses (in a real app, these would come from the user profile)
  const savedAddresses = [
    {
      id: 1,
      type: 'home',
      fullName: 'Rahul Kumar',
      address: '123 Main Street, Apartment 4B',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      phone: '9876543210',
      email: 'rahul@example.com',
      isDefault: true
    },
    {
      id: 2,
      type: 'work',
      fullName: 'Rahul Kumar',
      address: '456 Business Park, Block C',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400051',
      phone: '9876543210',
      email: 'rahul@example.com',
      isDefault: false
    }
  ];
  
  // Delivery options
  const deliveryOptions = [
    {
      id: 'standard',
      name: 'Standard Delivery',
      price: 99,
      description: 'Estimated delivery in 4-6 business days',
      isDefault: true
    },
    {
      id: 'express',
      name: 'Express Delivery',
      price: 199,
      description: 'Estimated delivery in 2-3 business days',
      isDefault: false
    },
    {
      id: 'same_day',
      name: 'Same Day Delivery',
      price: 299,
      description: 'Get it today! Order before 2 PM',
      isDefault: false,
      available: true
    }
  ];
  
  // Initial form state
  const initialFormState = {
    fullName: user?.name || '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: user?.phone || '',
    email: user?.email || '',
    addressType: 'home',
  };
  
  const [formValues, setFormValues] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState({});
  const [formTouched, setFormTouched] = useState({});
  const [selectedAddress, setSelectedAddress] = useState(savedAddresses[0]?.id || null);
  const [deliveryOption, setDeliveryOption] = useState('standard');
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [saveAddress, setSaveAddress] = useState(true);
  
  // Shipping cost based on selected delivery option
  const selectedDeliveryOption = deliveryOptions.find(option => option.id === deliveryOption);
  const shippingCost = selectedDeliveryOption?.price || 99;
  
  // Calculate totals
  const estimatedTax = totalPrice * 0.05; // 5% tax
  const totalPayable = totalPrice + shippingCost + estimatedTax;
  
  // Load existing shipping info if available
  useEffect(() => {
    if (shippingInfo) {
      setFormValues(shippingInfo.address || initialFormState);
      setDeliveryOption(shippingInfo.deliveryOption || 'standard');
    }
  }, [shippingInfo]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
    
    // Mark field as touched
    setFormTouched({
      ...formTouched,
      [name]: true,
    });
    
    // Validate this field
    const errors = validateShippingForm({
      ...formValues,
      [name]: value,
    });
    
    setFormErrors({
      ...formErrors,
      [name]: errors[name],
    });
  };
  
  const handleBlur = (e) => {
    const { name } = e.target;
    setFormTouched({
      ...formTouched,
      [name]: true,
    });
    
    // Validate all fields
    const errors = validateShippingForm(formValues);
    setFormErrors(errors);
  };
  
  const handleSavedAddressSelect = (addressId) => {
    setSelectedAddress(addressId);
    setShowNewAddressForm(false);
    
    // Populate form with selected address data
    const selectedAddressData = savedAddresses.find(addr => addr.id === addressId);
    if (selectedAddressData) {
      setFormValues({
        fullName: selectedAddressData.fullName,
        address: selectedAddressData.address,
        city: selectedAddressData.city,
        state: selectedAddressData.state,
        pincode: selectedAddressData.pincode,
        phone: selectedAddressData.phone,
        email: selectedAddressData.email,
        addressType: selectedAddressData.type,
      });
      
      // Clear errors for populated fields
      setFormErrors({});
    }
  };
  
  const handleDeliveryOptionChange = (optionId) => {
    setDeliveryOption(optionId);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate all fields
    const errors = validateShippingForm(formValues);
    setFormErrors(errors);
    
    // Mark all fields as touched
    const touchedFields = {};
    Object.keys(formValues).forEach(key => {
      touchedFields[key] = true;
    });
    setFormTouched(touchedFields);
    
    // If no errors, proceed
    if (Object.keys(errors).length === 0) {
      // Save shipping info to redux store
      dispatch(saveShippingInfo({
        address: formValues,
        deliveryOption,
        saveAddress,
      }));
      
      // Proceed to next step
      onNext();
    }
  };
  
  const getAddressIcon = (type) => {
    switch (type) {
      case 'home':
        return <Home sx={{ color: theme.palette.secondary.main }} />;
      case 'work':
        return <BusinessCenter sx={{ color: theme.palette.secondary.main }} />;
      default:
        return <Apartment sx={{ color: theme.palette.secondary.main }} />;
    }
  };
  
  return (
    <Grid container spacing={4}>
      <Grid item xs={12} md={8}>
        <Typography variant="h5" gutterBottom>Shipping Information</Typography>
        
        {/* Saved Addresses */}
        {savedAddresses.length > 0 && !showNewAddressForm && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>Select a saved address:</Typography>
            <Grid container spacing={2}>
              {savedAddresses.map((address) => (
                <Grid item xs={12} key={address.id}>
                  <AddressCard 
                    selected={selectedAddress === address.id}
                    onClick={() => handleSavedAddressSelect(address.id)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                      <Radio
                        checked={selectedAddress === address.id}
                        onChange={() => handleSavedAddressSelect(address.id)}
                        name="saved-address-radio"
                        color="primary"
                      />
                      <Box sx={{ ml: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          {getAddressIcon(address.type)}
                          <Typography variant="subtitle1" sx={{ ml: 1, textTransform: 'capitalize' }}>
                            {address.type} {address.isDefault && <Typography component="span" variant="caption" sx={{ ml: 1, bgcolor: 'primary.main', color: 'white', px: 1, py: 0.5, borderRadius: 1 }}>Default</Typography>}
                          </Typography>
                        </Box>
                        <Typography variant="body1">{address.fullName}</Typography>
                        <Typography variant="body2" color="text.secondary">{address.address}</Typography>
                        <Typography variant="body2" color="text.secondary">{address.city}, {address.state}, {address.pincode}</Typography>
                        <Typography variant="body2" color="text.secondary">Phone: {address.phone}</Typography>
                      </Box>
                    </Box>
                  </AddressCard>
                </Grid>
              ))}
            </Grid>
            
            <Button 
              variant="outlined" 
              color="primary"
              onClick={() => {
                setShowNewAddressForm(true);
                setSelectedAddress(null);
                setFormValues(initialFormState);
              }}
              sx={{ mt: 2, textTransform: 'none', borderRadius: theme.shape.borderRadius * 2 }}
            >
              + Add a New Address
            </Button>
          </Box>
        )}
        
        {/* New Address Form */}
        {(showNewAddressForm || savedAddresses.length === 0) && (
          <form onSubmit={handleSubmit}>
            <Paper sx={{ p: 3, mb: 4, borderRadius: theme.shape.borderRadius }}>
              <Typography variant="subtitle1" gutterBottom>
                {savedAddresses.length > 0 ? 'Add a New Address' : 'Enter Shipping Address'}
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Full Name"
                    name="fullName"
                    value={formValues.fullName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={formTouched.fullName && Boolean(formErrors.fullName)}
                    helperText={formTouched.fullName && formErrors.fullName}
                    fullWidth
                    margin="normal"
                    size="small"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="Address"
                    name="address"
                    value={formValues.address}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={formTouched.address && Boolean(formErrors.address)}
                    helperText={formTouched.address && formErrors.address}
                    fullWidth
                    margin="normal"
                    size="small"
                    multiline
                    rows={2}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="City"
                    name="city"
                    value={formValues.city}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={formTouched.city && Boolean(formErrors.city)}
                    helperText={formTouched.city && formErrors.city}
                    fullWidth
                    margin="normal"
                    size="small"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl 
                    fullWidth 
                    margin="normal" 
                    size="small"
                    error={formTouched.state && Boolean(formErrors.state)}
                  >
                    <InputLabel>State</InputLabel>
                    <Select
                      name="state"
                      value={formValues.state}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      label="State"
                    >
                      <MenuItem value="">Select State</MenuItem>
                      <MenuItem value="Andhra Pradesh">Andhra Pradesh</MenuItem>
                      <MenuItem value="Delhi">Delhi</MenuItem>
                      <MenuItem value="Gujarat">Gujarat</MenuItem>
                      <MenuItem value="Karnataka">Karnataka</MenuItem>
                      <MenuItem value="Maharashtra">Maharashtra</MenuItem>
                      <MenuItem value="Tamil Nadu">Tamil Nadu</MenuItem>
                      <MenuItem value="Telangana">Telangana</MenuItem>
                      <MenuItem value="Uttar Pradesh">Uttar Pradesh</MenuItem>
                      <MenuItem value="West Bengal">West Bengal</MenuItem>
                      {/* Add other states */}
                    </Select>
                    {formTouched.state && formErrors.state && (
                      <FormHelperText>{formErrors.state}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="PIN Code"
                    name="pincode"
                    value={formValues.pincode}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={formTouched.pincode && Boolean(formErrors.pincode)}
                    helperText={formTouched.pincode && formErrors.pincode}
                    fullWidth
                    margin="normal"
                    size="small"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Phone Number"
                    name="phone"
                    value={formValues.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={formTouched.phone && Boolean(formErrors.phone)}
                    helperText={formTouched.phone && formErrors.phone}
                    fullWidth
                    margin="normal"
                    size="small"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="Email"
                    name="email"
                    type="email"
                    value={formValues.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={formTouched.email && Boolean(formErrors.email)}
                    helperText={formTouched.email && formErrors.email}
                    fullWidth
                    margin="normal"
                    size="small"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControl component="fieldset" margin="normal">
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Address Type
                    </Typography>
                    <RadioGroup
                      row
                      name="addressType"
                      value={formValues.addressType}
                      onChange={handleChange}
                    >
                      <FormControlLabel value="home" control={<Radio color="primary" />} label="Home" />
                      <FormControlLabel value="work" control={<Radio color="primary" />} label="Work" />
                      <FormControlLabel value="other" control={<Radio color="primary" />} label="Other" />
                    </RadioGroup>
                  </FormControl>
                </Grid>
                
                {savedAddresses.length > 0 && (
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={saveAddress}
                          onChange={(e) => setSaveAddress(e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Save this address for future orders"
                    />
                  </Grid>
                )}
                
                {showNewAddressForm && savedAddresses.length > 0 && (
                  <Grid item xs={12}>
                    <Button
                      variant="text"
                      onClick={() => {
                        setShowNewAddressForm(false);
                        setSelectedAddress(savedAddresses[0].id);
                      }}
                      sx={{ textTransform: 'none' }}
                    >
                      Cancel and use a saved address
                    </Button>
                  </Grid>
                )}
              </Grid>
            </Paper>
            
            {/* Delivery Options */}
            <Paper sx={{ p: 3, mb: 4, borderRadius: theme.shape.borderRadius }}>
              <Typography variant="subtitle1" gutterBottom>Delivery Options</Typography>
              
              {deliveryOptions.map((option) => (
                <DeliveryOption
                  key={option.id}
                  selected={deliveryOption === option.id}
                  onClick={() => handleDeliveryOptionChange(option.id)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Radio
                      checked={deliveryOption === option.id}
                      onChange={() => handleDeliveryOptionChange(option.id)}
                      name="delivery-option-radio"
                      color="primary"
                    />
                    <Box sx={{ ml: 1 }}>
                      <Typography variant="subtitle2">{option.name}</Typography>
                      <Typography variant="body2" color="text.secondary">{option.description}</Typography>
                    </Box>
                  </Box>
                  <Typography variant="subtitle2" color="secondary.main">₹{option.price}</Typography>
                </DeliveryOption>
              ))}
            </Paper>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button
                onClick={onBack}
                startIcon={<NavigateBefore />}
                sx={{ textTransform: 'none', fontWeight: 500 }}
              >
                Back to Shopping Bag
              </Button>
            </Box>
          </form>
        )}
      </Grid>
      
      {/* Order Summary */}
      <Grid item xs={12} md={4}>
        <OrderSummaryCard elevation={0}>
          <Typography variant="h6" gutterBottom>Order Summary</Typography>
          <Divider sx={{ mb: 2 }} />
          
          <SummaryRow>
            <Typography variant="body2">Subtotal ({items.length} {items.length === 1 ? 'item' : 'items'})</Typography>
            <Typography variant="body2" fontWeight={500}>₹{totalPrice.toFixed(2)}</Typography>
          </SummaryRow>
          
          <SummaryRow>
            <Typography variant="body2">Shipping</Typography>
            <Typography variant="body2" fontWeight={500}>₹{shippingCost.toFixed(2)}</Typography>
          </SummaryRow>
          
          <SummaryRow>
            <Typography variant="body2">Estimated Tax</Typography>
            <Typography variant="body2" fontWeight={500}>₹{estimatedTax.toFixed(2)}</Typography>
          </SummaryRow>
          
          <Box sx={{ mt: 3, mb: 2 }}>
            <Divider />
          </Box>
          
          <SummaryRow>
            <Typography variant="subtitle1" fontWeight={600}>Total</Typography>
            <Typography variant="subtitle1" fontWeight={600} color="secondary.main">
              ₹{totalPayable.toFixed(2)}
            </Typography>
          </SummaryRow>
          
          <Box sx={{ mt: 3 }}>
            <ProceedButton
              endIcon={<ArrowForward />}
              onClick={handleSubmit}
            >
              Proceed to Payment
            </ProceedButton>
          </Box>
        </OrderSummaryCard>
      </Grid>
    </Grid>
  );
};

export default ShippingForm;