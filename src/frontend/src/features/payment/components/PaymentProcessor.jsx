import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Alert,
  Divider,
  Collapse,
  Grid,
  useTheme,
  alpha,
  styled,
} from '@mui/material';
import {
  CreditCard,
  AccountBalanceWallet,
  Payment,
  CheckCircle,
  ArrowForward,
} from '@mui/icons-material';
import paymentService from '../services/paymentService';
import { createOrder, selectOrderCreationSuccess } from '../../orders/orderSlice';
import { selectUser } from '../../auth/authSlice';
import { selectCartItems, selectCartTotalPrice, selectShippingInfo } from '../../cart/cartSlice';

// Styled components
const PaymentMethodsContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

const PaymentOption = styled(Paper)(({ theme, selected }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  border: selected 
    ? `2px solid ${theme.palette.primary.main}` 
    : `1px solid ${theme.palette.divider}`,
  backgroundColor: selected 
    ? alpha(theme.palette.primary.main, 0.05) 
    : theme.palette.background.paper,
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    borderColor: selected ? theme.palette.primary.main : theme.palette.primary.light,
    boxShadow: theme.shadows[1],
  },
}));

const PaymentLogo = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 48,
  height: 48,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.action.hover,
  marginRight: theme.spacing(2),
}));

const PaymentSummary = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(3),
  backgroundColor: theme.palette.background.paper,
}));

const SummaryRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(1.5),
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

const PaymentProcessor = ({ onBack, onNext }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const cartItems = useSelector(selectCartItems);
  const cartTotal = useSelector(selectCartTotalPrice);
  const shippingInfo = useSelector(selectShippingInfo);
  const user = useSelector(selectUser);
  const orderCreationSuccess = useSelector(selectOrderCreationSuccess);
  
  // Calculate order summary values
  const subtotal = cartTotal;
  const shippingCost = 99; // Could be dynamic based on shipping method
  const tax = subtotal * 0.05; // 5% tax rate - could be dynamic
  const totalAmount = subtotal + shippingCost + tax;
  
  const handlePaymentMethodChange = (event) => {
    setPaymentMethod(event.target.value);
    setError(null); // Clear any previous errors
  };
  
  const handlePayment = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First create the order in your system
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
          size: item.size,
          color: item.baseColour,
        })),
        shippingInfo,
        paymentMethod,
        subtotal,
        shippingCost,
        tax,
        total: totalAmount,
      };
      
      // Dispatch order creation first
      const orderResult = await dispatch(createOrder(orderData)).unwrap();
      
      if (!orderResult || !orderResult.order) {
        throw new Error('Failed to create order');
      }
      
      // For COD, we're done
      if (paymentMethod === 'cod') {
        // Navigate to success page
        onNext();
        return;
      }
      
      // For card/wallet, initiate Razorpay payment
      const paymentData = await paymentService.initiatePayment(totalAmount);
      
      if (!paymentData || !paymentData.order_id || !paymentData.key_id) {
        throw new Error('Failed to initiate payment');
      }
      
      // Process payment with Razorpay
      const paymentResult = await paymentService.processPayment({
        order_id: paymentData.order_id,
        amount: totalAmount,
        currency: 'INR',
        key_id: paymentData.key_id,
        prefill: {
          name: shippingInfo?.fullName || user?.name || '',
          email: shippingInfo?.email || user?.email || '',
          phone: shippingInfo?.phone || '',
          address: shippingInfo?.address || '',
        },
      });
      
      // Verify payment with server
      await paymentService.verifyPayment({
        orderId: orderResult.order.id,
        paymentId: paymentResult.razorpay_payment_id,
        signature: paymentResult.razorpay_signature,
      });
      
      // Payment successful, navigate to success page
      onNext();
      
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'An error occurred during payment processing');
    } finally {
      setLoading(false);
    }
  };
  
  // If order creation succeeded but something went wrong with payment
  React.useEffect(() => {
    if (orderCreationSuccess) {
      if (!loading && !error) {
        // If we created the order successfully and not waiting on payment
        // and no errors, proceed to next step
        onNext();
      }
    }
  }, [orderCreationSuccess, loading, error, onNext]);
  
  return (
    <Grid container spacing={4}>
      <Grid item xs={12} md={8}>
        <Typography variant="h5" gutterBottom>
          Payment Method
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <PaymentMethodsContainer>
          <FormControl component="fieldset" fullWidth>
            <RadioGroup
              aria-label="payment-method"
              name="payment-method"
              value={paymentMethod}
              onChange={handlePaymentMethodChange}
            >
              <PaymentOption selected={paymentMethod === 'card'} onClick={() => setPaymentMethod('card')}>
                <FormControlLabel
                  value="card"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PaymentLogo>
                        <CreditCard color="primary" />
                      </PaymentLogo>
                      <Box>
                        <Typography variant="subtitle2">
                          Credit/Debit Card
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Pay securely with your card
                        </Typography>
                      </Box>
                    </Box>
                  }
                  sx={{ width: '100%', m: 0 }}
                />
              </PaymentOption>
              
              <PaymentOption selected={paymentMethod === 'wallet'} onClick={() => setPaymentMethod('wallet')}>
                <FormControlLabel
                  value="wallet"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PaymentLogo>
                        <AccountBalanceWallet color="primary" />
                      </PaymentLogo>
                      <Box>
                        <Typography variant="subtitle2">
                          UPI / Wallets
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Pay using PhonePe, Google Pay, Paytm & more
                        </Typography>
                      </Box>
                    </Box>
                  }
                  sx={{ width: '100%', m: 0 }}
                />
              </PaymentOption>
              
              <PaymentOption selected={paymentMethod === 'cod'} onClick={() => setPaymentMethod('cod')}>
                <FormControlLabel
                  value="cod"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PaymentLogo>
                        <Payment color="primary" />
                      </PaymentLogo>
                      <Box>
                        <Typography variant="subtitle2">
                          Cash on Delivery
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Pay when you receive your order
                        </Typography>
                      </Box>
                    </Box>
                  }
                  sx={{ width: '100%', m: 0 }}
                />
              </PaymentOption>
            </RadioGroup>
          </FormControl>
        </PaymentMethodsContainer>
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="h6" gutterBottom>
          Shipping Information
        </Typography>
        
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: theme.shape.borderRadius,
          }}
        >
          <Typography variant="body1">{shippingInfo?.fullName}</Typography>
          <Typography variant="body2" color="text.secondary">
            {shippingInfo?.address}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {shippingInfo?.city}, {shippingInfo?.state} {shippingInfo?.pincode}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Phone: {shippingInfo?.phone}
          </Typography>
        </Paper>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            onClick={onBack}
            disabled={loading}
            sx={{ textTransform: 'none' }}
          >
            Back
          </Button>
        </Box>
      </Grid>
      
      <Grid item xs={12} md={4}>
        <PaymentSummary elevation={0}>
          <Typography variant="h6" gutterBottom>Order Summary</Typography>
          <Divider sx={{ mb: 2 }} />
          
          <SummaryRow>
            <Typography variant="body2">Subtotal</Typography>
            <Typography variant="body2" fontWeight={500}>₹{subtotal.toFixed(2)}</Typography>
          </SummaryRow>
          
          <SummaryRow>
            <Typography variant="body2">Shipping</Typography>
            <Typography variant="body2" fontWeight={500}>₹{shippingCost.toFixed(2)}</Typography>
          </SummaryRow>
          
          <SummaryRow>
            <Typography variant="body2">Estimated Tax</Typography>
            <Typography variant="body2" fontWeight={500}>₹{tax.toFixed(2)}</Typography>
          </SummaryRow>
          
          <Box sx={{ mt: 3, mb: 2 }}>
            <Divider />
          </Box>
          
          <SummaryRow>
            <Typography variant="subtitle1" fontWeight={600}>Total</Typography>
            <Typography variant="subtitle1" fontWeight={600} color="secondary.main">
              ₹{totalAmount.toFixed(2)}
            </Typography>
          </SummaryRow>
          
          <Box sx={{ mt: 3 }}>
            <ProceedButton
              endIcon={loading ? <CircularProgress size={24} color="inherit" /> : <ArrowForward />}
              onClick={handlePayment}
              disabled={loading}
            >
              {loading ? 'Processing...' : `Pay ₹${totalAmount.toFixed(2)}`}
            </ProceedButton>
            
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
              By proceeding, you agree to our Terms of Service and Privacy Policy
            </Typography>
          </Box>
        </PaymentSummary>
        
        <Paper 
          elevation={0} 
          sx={{ 
            p: 2, 
            bgcolor: alpha(theme.palette.success.main, 0.05), 
            border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
            borderRadius: theme.shape.borderRadius,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <CheckCircle sx={{ color: 'success.main', mr: 1.5, fontSize: 20 }} />
          <Typography variant="body2">
            Your transaction is secure. We use industry-standard encryption to protect your data.
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default PaymentProcessor;