import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Grid,
  Box,
  Divider,
  Button,
  Paper,
  IconButton,
  Card,
  CardMedia,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Alert,
  Chip,
  styled,
  useTheme,
  Fade,
  alpha,
} from "@mui/material";
import {
  Add,
  Remove,
  Delete,
  ArrowForward,
  ShoppingBag,
  LocalShipping,
  Payment,
  CheckCircle,
  BookmarkBorder,
  NavigateBefore,
} from "@mui/icons-material";
import {
  fetchCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  selectCart,
  selectCartItems,
  selectCartTotalPrice,
} from "../cartSlice";
import { addToSaveForLater } from "../../saveForLater/saveForLaterSlice";
import ShippingForm from "./ShippingForm";

// Styled Components
const CartEmptyContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(6),
  textAlign: "center",
}));

const CartItemCard = styled(Card)(({ theme }) => ({
  display: "flex",
  marginBottom: theme.spacing(2),
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  boxShadow: "none",
  border: `1px solid ${theme.palette.divider}`,
  transition: "all 0.3s ease",
  "&:hover": {
    borderColor: theme.palette.primary.light,
    boxShadow: theme.shadows[1],
  },
}));

const CartItemImage = styled(CardMedia)(({ theme }) => ({
  width: 100,
  height: 120,
  objectFit: "contain",
  marginRight: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.grey[100],
}));

const QuantitySelector = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  marginTop: theme.spacing(1),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  width: "fit-content",
}));

const QuantityButton = styled(IconButton)(({ theme }) => ({
  padding: theme.spacing(0.5),
  color: theme.palette.text.secondary,
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    color: theme.palette.primary.main,
  },
}));

const QuantityInput = styled(TextField)(({ theme }) => ({
  width: "40px",
  "& input": {
    padding: `${theme.spacing(0.5)} 0`,
    textAlign: "center",
  },
  "& fieldset": {
    border: "none",
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  textTransform: "none",
  borderRadius: theme.shape.borderRadius * 4,
  fontWeight: 500,
}));

const OrderSummaryCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  position: "sticky",
  top: theme.spacing(2),
}));

const SummaryRow = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  marginBottom: theme.spacing(1.5),
}));

const ProceedButton = styled(Button)(({ theme }) => ({
  width: "100%",
  height: "48px",
  position: "relative",
  overflow: "hidden",
  transition: "all 0.3s ease",
  background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
  color: theme.palette.primary.contrastText,
  borderRadius: theme.shape.borderRadius * 4,
  textTransform: "none",
  fontWeight: 600,
  "&::after": {
    content: '""',
    position: "absolute",
    top: 0,
    left: -100,
    width: "100%",
    height: "100%",
    background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.primary.contrastText, 0.15)}, transparent)`,
    transition: "0.5s",
  },
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.9),
    boxShadow: theme.shadows[4],
  },
  "&:hover::after": {
    left: "120%",
  },
}));

// Cart steps
const steps = [
  "Shopping Bag",
  "Shipping Information",
  "Payment",
  "Confirmation",
];

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();

  const { items, totalPrice, status, error } = useSelector(selectCart);
  const [activeStep, setActiveStep] = useState(0);

  // Estimated delivery, shipping cost, and tax could be calculated dynamically
  const shippingCost = 99;
  const estimatedTax = totalPrice * 0.05; // 5% tax
  const totalPayable = totalPrice + shippingCost + estimatedTax;

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const handleQuantityChange = (itemId, currentQuantity, increment) => {
    const newQuantity = Math.max(1, currentQuantity + increment);
    if (newQuantity !== currentQuantity) {
      dispatch(updateCartItem({ itemId, quantity: newQuantity }));
    }
  };

  const handleRemoveItem = (itemId) => {
    dispatch(removeCartItem(itemId));
  };

  const handleSaveForLater = (itemId) => {
    dispatch(addToSaveForLater(itemId));
    dispatch(removeCartItem(itemId));
  };

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };
  // If cart is empty
  if (items.length === 0 && status !== "loading") {
    return (
      <Container maxWidth="xl" sx={{ py: 6 }}>
        <CartEmptyContainer>
          <ShoppingBag sx={{ fontSize: 70, color: "text.secondary", mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Your cart is empty
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            gutterBottom
            sx={{ maxWidth: 500, mb: 4 }}
          >
            Looks like you haven't added anything to your cart yet. Browse our
            collection to find stylish items for your wardrobe.
          </Typography>
          <Button
            component={RouterLink}
            to="/all-products"
            variant="contained"
            color="primary"
            size="large"
            startIcon={<ArrowForward />}
            sx={{
              borderRadius: theme.shape.borderRadius * 4,
              textTransform: "none",
              px: 4,
            }}
          >
            Continue Shopping
          </Button>
        </CartEmptyContainer>
      </Container>
    );
  }

  // Show loading state
  if (status === "loading" && items.length === 0) {
    return (
      <Container
        maxWidth="xl"
        sx={{
          py: 6,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress color="secondary" />
      </Container>
    );
  }

  // Show error state
  if (error && status === "failed" && items.length === 0) {
    return (
      <Container maxWidth="xl" sx={{ py: 6 }}>
        <Alert severity="error" sx={{ borderRadius: theme.shape.borderRadius }}>
          Error: {error}
        </Alert>
      </Container>
    );
  }

  // Render cart content based on active step
  const renderStepContent = (step) => {
    switch (step) {
      case 0: // Cart Items
        return (
          <Grid container spacing={4}>
            {/* Cart Items */}
            <Grid item xs={12} md={8}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Typography variant="h5">
                  Shopping Bag ({items.length}{" "}
                  {items.length === 1 ? "item" : "items"})
                </Typography>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={<Delete />}
                  onClick={handleClearCart}
                  sx={{
                    textTransform: "none",
                    borderRadius: theme.shape.borderRadius * 2,
                  }}
                >
                  Clear All
                </Button>
              </Box>

              {items.map((item) => (
                <Fade key={item.id} in={true} timeout={500}>
                  <CartItemCard>
                    <CartItemImage
                      component="img"
                      image={`http://localhost:8000/static/images/${item.productId}.jpg`}
                      alt={item.productDisplayName}
                    />
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        flexGrow: 1,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Box>
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 600 }}
                          >
                            {item.productDisplayName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Size: {item.size}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Color: {item.color || "Default"}
                          </Typography>

                          <QuantitySelector>
                            <QuantityButton
                              size="small"
                              onClick={() =>
                                handleQuantityChange(item.id, item.quantity, -1)
                              }
                            >
                              <Remove fontSize="small" />
                            </QuantityButton>
                            <QuantityInput
                              size="small"
                              value={item.quantity}
                              inputProps={{ readOnly: true }}
                            />
                            <QuantityButton
                              size="small"
                              onClick={() =>
                                handleQuantityChange(item.id, item.quantity, 1)
                              }
                            >
                              <Add fontSize="small" />
                            </QuantityButton>
                          </QuantitySelector>
                        </Box>

                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-end",
                          }}
                        >
                          {/* <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>₹{(item.price * item.quantity).toFixed(2)}</Typography>
                          <Typography variant="caption" color="text.secondary">₹{item.price.toFixed(2)} each</Typography> */}
                          <Typography variant="caption" color="text.secondary">
                            {/* Check if item.price is a valid number */}
                            {
                              typeof item.price === "number"
                                ? `₹${item.price.toFixed(2)} each`
                                : "Price N/A" // Fallback text
                            }
                          </Typography>
                          {/* Total price for this item (price * quantity) */}
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 600 }}
                          >
                            {/* Check if both price and quantity are valid numbers */}
                            {
                              typeof item.price === "number" &&
                              typeof item.quantity === "number"
                                ? `₹${(item.price * item.quantity).toFixed(2)}`
                                : "Total N/A" // Fallback text
                            }
                          </Typography>

                          <Box sx={{ display: "flex", mt: "auto" }}>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleSaveForLater(item.id)}
                              sx={{ mr: 1 }}
                            >
                              <BookmarkBorder fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleRemoveItem(item.id)}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </CartItemCard>
                </Fade>
              ))}

              <Box
                sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}
              >
                <Button
                  component={RouterLink}
                  to="/products"
                  startIcon={<NavigateBefore />}
                  sx={{ textTransform: "none", fontWeight: 500 }}
                >
                  Continue Shopping
                </Button>
              </Box>
            </Grid>

            {/* Order Summary */}
            <Grid item xs={12} md={4}>
              <OrderSummaryCard elevation={0}>
                <Typography variant="h6" gutterBottom>
                  Order Summary
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <SummaryRow>
                  <Typography variant="body2">
                    Subtotal ({items.length}{" "}
                    {items.length === 1 ? "item" : "items"})
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    ₹{totalPrice.toFixed(2)}
                  </Typography>
                </SummaryRow>

                <SummaryRow>
                  <Typography variant="body2">Shipping</Typography>
                  <Typography variant="body2" fontWeight={500}>
                    ₹{shippingCost.toFixed(2)}
                  </Typography>
                </SummaryRow>

                <SummaryRow>
                  <Typography variant="body2">Estimated Tax</Typography>
                  <Typography variant="body2" fontWeight={500}>
                    ₹{estimatedTax.toFixed(2)}
                  </Typography>
                </SummaryRow>

                <Box sx={{ mt: 3, mb: 2 }}>
                  <Divider />
                </Box>

                <SummaryRow>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Total
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    color="secondary.main"
                  >
                    ₹{totalPayable.toFixed(2)}
                  </Typography>
                </SummaryRow>

                <Box sx={{ mt: 3 }}>
                  <ProceedButton
                    endIcon={<ArrowForward />}
                    onClick={handleNext}
                  >
                    Proceed to Shipping
                  </ProceedButton>
                </Box>
              </OrderSummaryCard>
            </Grid>
          </Grid>
        );

      case 1: // Shipping Information
        return <ShippingForm onBack={handleBack} onNext={handleNext} />;

      case 2: // Payment
        // This would be replaced with actual payment integration
        return (
          <Box sx={{ py: 4 }}>
            <Typography variant="h5" gutterBottom>
              Payment
            </Typography>
            <Typography variant="body1" paragraph>
              Payment integration with Razorpay would be implemented here.
            </Typography>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}
            >
              <Button onClick={handleBack} startIcon={<NavigateBefore />}>
                Back
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                endIcon={<ArrowForward />}
              >
                Complete Payment
              </Button>
            </Box>
          </Box>
        );

      case 3: // Order Confirmation
        return (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              py: 6,
              textAlign: "center",
            }}
          >
            <CheckCircle sx={{ fontSize: 70, color: "success.main", mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              Order Confirmed!
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              paragraph
              sx={{ maxWidth: 600 }}
            >
              Thank you for your purchase. Your order has been confirmed and
              will be shipped shortly. You will receive an email confirmation
              with the order details.
            </Typography>
            <Typography variant="body2" paragraph>
              Order Number: #ORD-{Math.floor(100000 + Math.random() * 900000)}
            </Typography>
            <Box sx={{ mt: 4 }}>
              <Button
                component={RouterLink}
                to="/user/orders"
                variant="outlined"
                sx={{ mr: 2, borderRadius: theme.shape.borderRadius * 2 }}
              >
                View Orders
              </Button>
              <Button
                component={RouterLink}
                to="/products"
                variant="contained"
                color="primary"
                sx={{ borderRadius: theme.shape.borderRadius * 2 }}
              >
                Continue Shopping
              </Button>
            </Box>
          </Box>
        );

      default:
        return <Typography>Unknown step</Typography>;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      <Stepper activeStep={activeStep} sx={{ mb: 6 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {renderStepContent(activeStep)}
    </Container>
  );
};

export default CartPage;
