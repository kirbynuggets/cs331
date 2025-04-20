import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Divider,
  CircularProgress,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Collapse,
  Card,
  CardContent,
  Fade,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  useTheme,
  alpha,
  styled,
} from '@mui/material';
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  Visibility,
  ReceiptOutlined,
  ShoppingBag,
  ChevronLeft,
  CheckCircle,
  Schedule,
  LocalShipping,
  ErrorOutline,
} from '@mui/icons-material';
import { getUserOrders, selectOrders, selectOrderStatus } from '../orderSlice';
import { formatDate, formatCurrency } from '../../../utils/formatters';

// Styled components
const OrdersContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(6),
}));

const OrderCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  transition: 'all 0.3s ease',
  border: `1px solid ${theme.palette.divider}`,
  '&:hover': {
    boxShadow: theme.shadows[3],
    borderColor: theme.palette.primary.light,
  },
}));

const StatusChip = styled(Chip)(({ theme, status }) => {
  const statusColors = {
    'pending': {
      bgcolor: alpha(theme.palette.warning.main, 0.1),
      color: theme.palette.warning.dark,
    },
    'processing': {
      bgcolor: alpha(theme.palette.info.main, 0.1),
      color: theme.palette.info.dark,
    },
    'shipped': {
      bgcolor: alpha(theme.palette.primary.main, 0.1),
      color: theme.palette.primary.dark,
    },
    'delivered': {
      bgcolor: alpha(theme.palette.success.main, 0.1),
      color: theme.palette.success.dark,
    },
    'cancelled': {
      bgcolor: alpha(theme.palette.error.main, 0.1),
      color: theme.palette.error.dark,
    },
  };
  
  const statusStyles = statusColors[status] || {
    bgcolor: alpha(theme.palette.grey[500], 0.1),
    color: theme.palette.text.secondary,
  };
  
  return {
    fontWeight: 600,
    ...statusStyles,
  };
});

const EmptyOrdersBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(6),
  textAlign: 'center',
  minHeight: '300px',
}));

const ViewOrderButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(1),
  borderRadius: theme.shape.borderRadius * 2,
  textTransform: 'none',
  fontWeight: 500,
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
  },
}));

// Order Item Row component
const OrderItemRow = ({ item }) => {
  const [open, setOpen] = useState(false);
  
  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {item.productDisplayName}
        </TableCell>
        <TableCell align="right">{item.quantity}</TableCell>
        <TableCell align="right">₹{item.price.toFixed(2)}</TableCell>
        <TableCell align="right">₹{(item.price * item.quantity).toFixed(2)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Grid container spacing={2} sx={{ py: 2 }}>
                <Grid item xs={12} sm={3}>
                  <Box
                    component="img"
                    sx={{
                      height: 100,
                      width: '100%',
                      maxWidth: 100,
                      objectFit: 'contain',
                      borderRadius: 1,
                      bgcolor: 'background.default',
                    }}
                    src={item.image_url}
                    alt={item.productDisplayName}
                  />
                </Grid>
                <Grid item xs={12} sm={9}>
                  <Typography variant="subtitle2" gutterBottom component="div">
                    Product Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={4}>
                      <Typography variant="body2" color="text.secondary">
                        Size: {item.size || 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={4}>
                      <Typography variant="body2" color="text.secondary">
                        Color: {item.color || 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={4}>
                      <Typography variant="body2" color="text.secondary">
                        Category: {item.articleType || 'N/A'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

// Main Orders Page Component
const OrdersPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  
  const orders = useSelector(selectOrders);
  const status = useSelector(selectOrderStatus);
  
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  
  useEffect(() => {
    dispatch(getUserOrders());
  }, [dispatch]);
  
  const handleViewOrder = (order) => {
    navigate(`/user/orders/${order.id}`);
  };
  
  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  };
  
  const handleCloseDetails = () => {
    setDetailsOpen(false);
  };
  
  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Schedule color="warning" />;
      case 'processing':
        return <Schedule color="info" />;
      case 'shipped':
        return <LocalShipping color="primary" />;
      case 'delivered':
        return <CheckCircle color="success" />;
      case 'cancelled':
        return <ErrorOutline color="error" />;
      default:
        return <Schedule color="disabled" />;
    }
  };
  
  if (status === 'loading') {
    return (
      <OrdersContainer maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress color="secondary" />
        </Box>
      </OrdersContainer>
    );
  }
  
  // Render empty state if no orders
  if (!orders || orders.length === 0) {
    return (
      <OrdersContainer maxWidth="xl">
        <Box sx={{ mb: 4 }}>
          <Button 
            component={Link} 
            to="/all-products"
            startIcon={<ChevronLeft />}
            sx={{ mb: 2, textTransform: 'none' }}
          >
            Continue Shopping
          </Button>
          <Typography variant="h4" gutterBottom>My Orders</Typography>
        </Box>
        
        <EmptyOrdersBox>
          <ShoppingBag sx={{ fontSize: 70, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>No orders yet</Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ maxWidth: 500 }}>
            You haven't placed any orders yet. Start shopping to explore our collections.
          </Typography>
          <Button 
            component={Link}
            to="/all-products"
            variant="contained" 
            color="primary"
            sx={{ mt: 2, borderRadius: theme.shape.borderRadius * 2, textTransform: 'none' }}
          >
            Browse Products
          </Button>
        </EmptyOrdersBox>
      </OrdersContainer>
    );
  }
  
  return (
    <OrdersContainer maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Button 
          component={Link} 
          to="/all-products"
          startIcon={<ChevronLeft />}
          sx={{ mb: 2, textTransform: 'none' }}
        >
          Continue Shopping
        </Button>
        <Typography variant="h4" gutterBottom>My Orders</Typography>
        <Typography variant="body1" color="text.secondary">
          View and track your order history
        </Typography>
      </Box>
      
      <Box sx={{ my: 4 }}>
        {orders.map((order, index) => (
          <Fade in={true} key={order.id} timeout={300 + index * 100}>
            <OrderCard elevation={0}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={8}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <ReceiptOutlined sx={{ color: 'primary.main', mr: 1 }} />
                    <Typography variant="h6">
                      Order #{order.orderNumber || order.id}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 2 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        ORDER DATE
                      </Typography>
                      <Typography variant="body2">
                        {formatDate(order.orderDate)}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        TOTAL AMOUNT
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        ₹{order.total.toFixed(2)}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        ITEMS
                      </Typography>
                      <Typography variant="body2">
                        {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        PAYMENT
                      </Typography>
                      <Typography variant="body2">
                        {order.paymentMethod || 'Online Payment'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', sm: 'flex-end' } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {getStatusIcon(order.status)}
                    <StatusChip 
                      label={order.status} 
                      status={order.status.toLowerCase()} 
                      sx={{ ml: 1 }}
                    />
                  </Box>
                  
                  <Box sx={{ mt: 'auto' }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleViewDetails(order)}
                      sx={{ mr: 1, textTransform: 'none', borderRadius: theme.shape.borderRadius * 2 }}
                    >
                      View Details
                    </Button>
                    
                    <Button
                      variant="contained"
                      size="small"
                      color="primary"
                      onClick={() => handleViewOrder(order)}
                      sx={{ textTransform: 'none', borderRadius: theme.shape.borderRadius * 2 }}
                    >
                      Track Order
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </OrderCard>
          </Fade>
        ))}
      </Box>
      
      {/* Order Details Dialog */}
      {selectedOrder && (
        <Dialog
          open={detailsOpen}
          onClose={handleCloseDetails}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ReceiptOutlined sx={{ mr: 1, color: 'primary.main' }} />
              Order #{selectedOrder.orderNumber || selectedOrder.id}
              <Box sx={{ ml: 'auto' }}>
                <StatusChip 
                  label={selectedOrder.status} 
                  status={selectedOrder.status.toLowerCase()} 
                  size="small"
                />
              </Box>
            </Box>
          </DialogTitle>
          
          <DialogContent dividers>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>Order Information</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Order Date:</Typography>
                    <Typography variant="body2">{formatDate(selectedOrder.orderDate)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Payment Method:</Typography>
                    <Typography variant="body2">{selectedOrder.paymentMethod || 'Online Payment'}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Payment Status:</Typography>
                    <Chip 
                      label={selectedOrder.paymentStatus || 'Paid'} 
                      size="small" 
                      color={selectedOrder.paymentStatus === 'Failed' ? 'error' : 'success'}
                      variant="outlined"
                    />
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>Shipping Address</Typography>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2">{selectedOrder.shippingAddress?.fullName || 'N/A'}</Typography>
                  <Typography variant="body2">{selectedOrder.shippingAddress?.address || 'N/A'}</Typography>
                  <Typography variant="body2">
                    {selectedOrder.shippingAddress?.city || 'N/A'}, {selectedOrder.shippingAddress?.state || 'N/A'} {selectedOrder.shippingAddress?.pincode || 'N/A'}
                  </Typography>
                  <Typography variant="body2">Phone: {selectedOrder.shippingAddress?.phone || 'N/A'}</Typography>
                </Box>
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="subtitle2" gutterBottom>Order Items</Typography>
            <TableContainer component={Paper} elevation={0} variant="outlined">
              <Table aria-label="order items">
                <TableHead>
                  <TableRow>
                    <TableCell />
                    <TableCell>Product</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedOrder.items.map((item) => (
                    <OrderItemRow key={item.id} item={item} />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Grid container>
                <Grid item xs={12} sm={6} />
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Subtotal:</Typography>
                    <Typography variant="body2">₹{selectedOrder.subtotal.toFixed(2)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Shipping:</Typography>
                    <Typography variant="body2">₹{selectedOrder.shippingCost.toFixed(2)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Tax:</Typography>
                    <Typography variant="body2">₹{selectedOrder.tax.toFixed(2)}</Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle2">Total:</Typography>
                    <Typography variant="subtitle2" color="secondary.main">₹{selectedOrder.total.toFixed(2)}</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          
          <DialogActions>
            <Button onClick={handleCloseDetails} sx={{ textTransform: 'none' }}>
              Close
            </Button>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => {
                handleCloseDetails();
                handleViewOrder(selectedOrder);
              }}
              sx={{ textTransform: 'none' }}
            >
              Track Order
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </OrdersContainer>
  );
};

export default OrdersPage;