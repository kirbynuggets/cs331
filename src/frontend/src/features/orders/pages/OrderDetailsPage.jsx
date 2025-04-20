import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Divider,
  CircularProgress,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Alert,
  useTheme,
  alpha,
  styled,
} from '@mui/material';
import { 
  ReceiptOutlined, 
  CheckCircle, 
  Schedule, 
  LocalShipping, 
  ErrorOutline,
  ChevronLeft,
  Inventory,
  Storefront,
  SupportAgent
} from '@mui/icons-material';
import { 
  getOrderDetails, 
  getPaymentStatus, 
  selectCurrentOrder, 
  selectPaymentStatus,
  selectOrderStatus,
  selectOrderError
} from '../orderSlice';
import { formatDate, formatCurrency } from '../../../utils/formatters';

// Styled components
const DetailContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(6),
}));

const OrderStatusCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.primary.main, 0.05),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
}));

const StatusStepConnector = styled(StepConnector)(({ theme }) => ({
  '& .MuiStepConnector-line': {
    borderColor: theme.palette.divider,
  },
  '&.Mui-active': {
    '& .MuiStepConnector-line': {
      borderColor: theme.palette.primary.main,
    },
  },
  '&.Mui-completed': {
    '& .MuiStepConnector-line': {
      borderColor: theme.palette.primary.main,
    },
  },
}));

const DetailSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
}));

const DetailCard = styled(Card)(({ theme }) => ({
  height: '100%',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  boxShadow: 'none',
}));

const DetailTable = styled(TableContainer)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  marginBottom: theme.spacing(3),
}));

const BackButton = styled(Button)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  textTransform: 'none',
}));

// Helper functions
const getOrderStatusIndex = (status) => {
  const statuses = ['pending', 'processing', 'shipped', 'delivered'];
  const index = statuses.indexOf(status.toLowerCase());
  return index >= 0 ? index : 0;
};

const OrderDetailsPage = () => {
  const { orderId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  
  const currentOrder = useSelector(selectCurrentOrder);
  const paymentStatus = useSelector(selectPaymentStatus);
  const status = useSelector(selectOrderStatus);
  const error = useSelector(selectOrderError);
  
  useEffect(() => {
    if (orderId) {
      dispatch(getOrderDetails(orderId));
      dispatch(getPaymentStatus(orderId));
    }
  }, [dispatch, orderId]);
  
  // Loading state
  if (status === 'loading') {
    return (
      <DetailContainer maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress color="secondary" />
        </Box>
      </DetailContainer>
    );
  }
  
  // Error state
  if (error) {
    return (
      <DetailContainer maxWidth="xl">
        <BackButton 
          component={Link} 
          to="/user/orders"
          startIcon={<ChevronLeft />}
        >
          Back to Orders
        </BackButton>
        
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button 
            variant="contained" 
            component={Link} 
            to="/user/orders"
            sx={{ textTransform: 'none', borderRadius: theme.shape.borderRadius * 2 }}
          >
            View All Orders
          </Button>
        </Box>
      </DetailContainer>
    );
  }
  
  // Not found state
  if (!currentOrder) {
    return (
      <DetailContainer maxWidth="xl">
        <BackButton 
          component={Link} 
          to="/user/orders"
          startIcon={<ChevronLeft />}
        >
          Back to Orders
        </BackButton>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          Order not found. The order may have been deleted or you may not have access to view it.
        </Alert>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button 
            variant="contained" 
            component={Link} 
            to="/user/orders"
            sx={{ textTransform: 'none', borderRadius: theme.shape.borderRadius * 2 }}
          >
            View All Orders
          </Button>
        </Box>
      </DetailContainer>
    );
  }
  
  // Prepare data for view
  const orderDate = formatDate(currentOrder.orderDate);
  const expectedDeliveryDate = currentOrder.expectedDeliveryDate 
    ? formatDate(currentOrder.expectedDeliveryDate)
    : 'Calculating...';
  
  const orderStatus = currentOrder.status || 'pending';
  const activeStep = getOrderStatusIndex(orderStatus);
  
  const steps = [
    { label: 'Order Placed', icon: <ReceiptOutlined /> },
    { label: 'Processing', icon: <Inventory /> },
    { label: 'Shipped', icon: <LocalShipping /> },
    { label: 'Delivered', icon: <CheckCircle /> }
  ];
  
  // If order is cancelled, show different view
  if (orderStatus.toLowerCase() === 'cancelled') {
    return (
      <DetailContainer maxWidth="xl">
        <BackButton 
          component={Link} 
          to="/user/orders"
          startIcon={<ChevronLeft />}
        >
          Back to Orders
        </BackButton>
        
        <Typography variant="h4" gutterBottom>
          Order #{currentOrder.orderNumber || currentOrder.id}
        </Typography>
        
        <Alert 
          severity="error" 
          icon={<ErrorOutline />}
          sx={{ mb: 4 }}
        >
          This order has been cancelled.
        </Alert>
        
        {/* Order Details */}
        <DetailSection>
          <Typography variant="h6" gutterBottom>Order Information</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <DetailCard>
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom color="text.secondary">
                    Order Details
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Order Date:</Typography>
                      <Typography variant="body2">{orderDate}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Order Status:</Typography>
                      <Typography variant="body2" color="error.main">Cancelled</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Payment Method:</Typography>
                      <Typography variant="body2">{currentOrder.paymentMethod || 'Online Payment'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Payment Status:</Typography>
                      <Typography variant="body2">
                        {paymentStatus || (currentOrder.paymentStatus || 'Refunded')}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Cancellation Date:</Typography>
                      <Typography variant="body2">{formatDate(currentOrder.cancelledDate) || 'N/A'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Cancellation Reason:</Typography>
                      <Typography variant="body2">{currentOrder.cancellationReason || 'N/A'}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </DetailCard>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <DetailCard>
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom color="text.secondary">
                    Shipping Address
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Box>
                    <Typography variant="body2">{currentOrder.shippingAddress?.fullName || 'N/A'}</Typography>
                    <Typography variant="body2">{currentOrder.shippingAddress?.address || 'N/A'}</Typography>
                    <Typography variant="body2">
                      {currentOrder.shippingAddress?.city || 'N/A'}, {currentOrder.shippingAddress?.state || 'N/A'} {currentOrder.shippingAddress?.pincode || 'N/A'}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>Phone: {currentOrder.shippingAddress?.phone || 'N/A'}</Typography>
                  </Box>
                </CardContent>
              </DetailCard>
            </Grid>
          </Grid>
        </DetailSection>
        
        {/* Order Items */}
        <DetailSection>
          <Typography variant="h6" gutterBottom>Order Items</Typography>
          <DetailTable component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell align="center">Quantity</TableCell>
                  <TableCell align="right">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentOrder.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box
                          component="img"
                          sx={{
                            width: 50,
                            height: 50,
                            objectFit: 'contain',
                            borderRadius: 1,
                            mr: 2,
                            bgcolor: 'background.default',
                          }}
                          src={item.image_url}
                          alt={item.productDisplayName}
                        />
                        <Box>
                          <Typography variant="body2">{item.productDisplayName}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.size && `Size: ${item.size}`} 
                            {item.color && ` | Color: ${item.color}`}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>₹{item.price.toFixed(2)}</TableCell>
                    <TableCell align="center">{item.quantity}</TableCell>
                    <TableCell align="right">₹{(item.price * item.quantity).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DetailTable>
          
          <Grid container justifyContent="flex-end">
            <Grid item xs={12} sm={6} md={4}>
              <Paper elevation={0} sx={{ p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: theme.shape.borderRadius }}>
                <Typography variant="subtitle2" gutterBottom>Order Summary</Typography>
                <Box sx={{ my: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Subtotal:</Typography>
                    <Typography variant="body2">₹{currentOrder.subtotal.toFixed(2)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Shipping:</Typography>
                    <Typography variant="body2">₹{currentOrder.shippingCost.toFixed(2)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Tax:</Typography>
                    <Typography variant="body2">₹{currentOrder.tax.toFixed(2)}</Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle2">Total:</Typography>
                    <Typography variant="subtitle2" color="secondary.main">₹{currentOrder.total.toFixed(2)}</Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </DetailSection>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button 
            variant="outlined" 
            component={Link} 
            to="/user/orders"
            startIcon={<ChevronLeft />}
            sx={{ textTransform: 'none', borderRadius: theme.shape.borderRadius * 2 }}
          >
            Back to Orders
          </Button>
          
          <Button 
            variant="contained" 
            color="primary"
            component={Link}
            to="/all-products"
            sx={{ textTransform: 'none', borderRadius: theme.shape.borderRadius * 2 }}
          >
            Continue Shopping
          </Button>
        </Box>
      </DetailContainer>
    );
  }
  
  return (
    <DetailContainer maxWidth="xl">
      <BackButton 
        component={Link} 
        to="/user/orders"
        startIcon={<ChevronLeft />}
      >
        Back to Orders
      </BackButton>
      
      <Typography variant="h4" gutterBottom>
        Order #{currentOrder.orderNumber || currentOrder.id}
      </Typography>
      
      {/* Order Status Tracker */}
      <OrderStatusCard elevation={0}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Order Status
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Placed on {orderDate}
            </Typography>
          </Box>
          
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="subtitle1" gutterBottom>
              Expected Delivery
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {expectedDeliveryDate}
            </Typography>
          </Box>
        </Box>
        
        <Stepper activeStep={activeStep} connector={<StatusStepConnector />}>
          {steps.map((step, index) => (
            <Step key={step.label} completed={index <= activeStep}>
              <StepLabel StepIconComponent={() => (
                <Box sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  backgroundColor: index <= activeStep ? 'primary.main' : 'action.disabled',
                  color: index <= activeStep ? 'primary.contrastText' : 'text.disabled',
                }}>
                  {step.icon}
                </Box>
              )}>
                <Typography variant="body2" color={index <= activeStep ? 'text.primary' : 'text.disabled'}>
                  {step.label}
                </Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </OrderStatusCard>
      
      {/* Order Information */}
      <DetailSection>
        <Typography variant="h6" gutterBottom>Order Information</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <DetailCard>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom color="text.secondary">
                  Order Details
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Order Date:</Typography>
                    <Typography variant="body2">{orderDate}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Order Status:</Typography>
                    <Typography variant="body2" sx={{ 
                      color: 
                        orderStatus.toLowerCase() === 'delivered' ? 'success.main' : 
                        orderStatus.toLowerCase() === 'cancelled' ? 'error.main' : 
                        'primary.main'
                    }}>
                      {orderStatus}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Payment Method:</Typography>
                    <Typography variant="body2">{currentOrder.paymentMethod || 'Online Payment'}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Payment Status:</Typography>
                    <Typography variant="body2" sx={{ 
                      color: 
                        (paymentStatus || currentOrder.paymentStatus || '').toLowerCase() === 'paid' ? 'success.main' : 
                        (paymentStatus || currentOrder.paymentStatus || '').toLowerCase() === 'failed' ? 'error.main' : 
                        'warning.main'
                    }}>
                      {paymentStatus || currentOrder.paymentStatus || 'Pending'}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </DetailCard>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <DetailCard>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom color="text.secondary">
                  Shipping Address
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box>
                  <Typography variant="body2">{currentOrder.shippingAddress?.fullName || 'N/A'}</Typography>
                  <Typography variant="body2">{currentOrder.shippingAddress?.address || 'N/A'}</Typography>
                  <Typography variant="body2">
                    {currentOrder.shippingAddress?.city || 'N/A'}, {currentOrder.shippingAddress?.state || 'N/A'} {currentOrder.shippingAddress?.pincode || 'N/A'}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>Phone: {currentOrder.shippingAddress?.phone || 'N/A'}</Typography>
                </Box>
              </CardContent>
            </DetailCard>
          </Grid>
        </Grid>
      </DetailSection>
      
      {/* Order Items */}
      <DetailSection>
        <Typography variant="h6" gutterBottom>Order Items</Typography>
        <DetailTable component={Paper} elevation={0}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell>Price</TableCell>
                <TableCell align="center">Quantity</TableCell>
                <TableCell align="right">Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentOrder.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box
                        component="img"
                        sx={{
                          width: 50,
                          height: 50,
                          objectFit: 'contain',
                          borderRadius: 1,
                          mr: 2,
                          bgcolor: 'background.default',
                        }}
                        src={item.image_url}
                        alt={item.productDisplayName}
                      />
                      <Box>
                        <Typography variant="body2">{item.productDisplayName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.size && `Size: ${item.size}`} 
                          {item.color && ` | Color: ${item.color}`}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>₹{item.price.toFixed(2)}</TableCell>
                  <TableCell align="center">{item.quantity}</TableCell>
                  <TableCell align="right">₹{(item.price * item.quantity).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DetailTable>
        
        <Grid container justifyContent="flex-end">
          <Grid item xs={12} sm={6} md={4}>
            <Paper elevation={0} sx={{ p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: theme.shape.borderRadius }}>
              <Typography variant="subtitle2" gutterBottom>Order Summary</Typography>
              <Box sx={{ my: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Subtotal:</Typography>
                  <Typography variant="body2">₹{currentOrder.subtotal.toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Shipping:</Typography>
                  <Typography variant="body2">₹{currentOrder.shippingCost.toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Tax:</Typography>
                  <Typography variant="body2">₹{currentOrder.tax.toFixed(2)}</Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle2">Total:</Typography>
                  <Typography variant="subtitle2" color="secondary.main">₹{currentOrder.total.toFixed(2)}</Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </DetailSection>
      
      {/* Help Section */}
      <DetailSection>
        <Typography variant="h6" gutterBottom>Need Help?</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <DetailCard>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <SupportAgent sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="subtitle2" gutterBottom>
                  Contact Support
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Need help with your order? Our support team is here to assist you.
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small"
                  sx={{ textTransform: 'none', borderRadius: theme.shape.borderRadius * 2 }}
                >
                  Contact Us
                </Button>
              </CardContent>
            </DetailCard>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <DetailCard>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <LocalShipping sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="subtitle2" gutterBottom>
                  Track Shipment
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Follow your package in real-time with our shipping partner.
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small"
                  disabled={orderStatus.toLowerCase() !== 'shipped'}
                  sx={{ textTransform: 'none', borderRadius: theme.shape.borderRadius * 2 }}
                >
                  Track Package
                </Button>
              </CardContent>
            </DetailCard>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <DetailCard>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <Storefront sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="subtitle2" gutterBottom>
                  Return Policy
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Not satisfied? Learn about our hassle-free return process.
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small"
                  sx={{ textTransform: 'none', borderRadius: theme.shape.borderRadius * 2 }}
                >
                  View Policy
                </Button>
              </CardContent>
            </DetailCard>
          </Grid>
        </Grid>
      </DetailSection>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button 
          variant="outlined" 
          component={Link} 
          to="/user/orders"
          startIcon={<ChevronLeft />}
          sx={{ textTransform: 'none', borderRadius: theme.shape.borderRadius * 2 }}
        >
          Back to Orders
        </Button>
        
        <Button 
          variant="contained" 
          color="primary"
          component={Link}
          to="/all-products"
          sx={{ textTransform: 'none', borderRadius: theme.shape.borderRadius * 2 }}
        >
          Continue Shopping
        </Button>
      </Box>
    </DetailContainer>
  );
};

export default OrderDetailsPage;