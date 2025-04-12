// import React from "react";

// const Temp = () => {
//     return (
//         <div>
//             <h1>Cart</h1>
//         </div>
//     );
// }

// export default Temp;

// import React, { useState } from 'react';
// import {
//   Box,
//   Button,
//   Card,
//   CardContent,
//   Checkbox,
//   Container,
//   Divider,
//   FormControlLabel,
//   Grid,
//   IconButton,
//   InputAdornment,
//   Paper,
//   Radio,
//   RadioGroup,
//   Stack,
//   Step,
//   StepLabel,
//   Stepper,
//   TextField,
//   Typography
// } from '@mui/material';
// import {
//   Add as AddIcon,
//   Remove as RemoveIcon,
//   Delete as DeleteIcon,
//   CheckCircle as CheckCircleIcon
// } from '@mui/icons-material';


// const Temp = () => {
//   const [cart, setCart] = useState([
//     { id: 1, name: "Floral Print Dress", size: "M", color: "Blue", price: 1899, quantity: 1, image: "/api/placeholder/120/150" },
//     { id: 2, name: "Classic White Shirt", size: "L", color: "White", price: 1299, quantity: 2, image: "/api/placeholder/120/150" },
//     { id: 3, name: "Denim Jeans", size: "32", color: "Dark Blue", price: 1599, quantity: 1, image: "/api/placeholder/120/150" }
//   ]);
  
//   const [step, setStep] = useState('cart'); // 'cart', 'address', 'payment', 'confirmation'
//   const [couponCode, setCouponCode] = useState('');
//   const [couponApplied, setCouponApplied] = useState(false);
  
//   // Address form state
//   const [address, setAddress] = useState({
//     fullName: '',
//     streetAddress: '',
//     city: '',
//     state: '',
//     pincode: '',
//     phone: ''
//   });
  
//   const updateQuantity = (id, newQuantity) => {
//     if (newQuantity < 1) return;
//     setCart(cart.map(item => 
//       item.id === id ? {...item, quantity: newQuantity} : item
//     ));
//   };
  
//   const removeItem = (id) => {
//     setCart(cart.filter(item => item.id !== id));
//   };
  
//   const calculateSubtotal = () => {
//     return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
//   };
  
//   const calculateDiscount = () => {
//     return couponApplied ? calculateSubtotal() * 0.1 : 0;
//   };
  
//   const calculateTotal = () => {
//     return calculateSubtotal() - calculateDiscount() + 99; // 99 is delivery fee
//   };
  
//   const applyCoupon = () => {
//     if (couponCode.toUpperCase() === 'SAVE10') {
//       setCouponApplied(true);
//     }
//   };
  
//   const handleAddressChange = (e) => {
//     const { name, value } = e.target;
//     setAddress(prev => ({ ...prev, [name]: value }));
//   };
  
//   const handleAddressSubmit = (e) => {
//     e.preventDefault();
//     setStep('payment');
//   };
  
//   const handlePaymentSubmit = (e) => {
//     e.preventDefault();
//     setStep('confirmation');
//   };
  
//   return (
//     <div className="flex flex-col lg:flex-row gap-6 max-w-6xl mx-auto p-4">
//       {/* Main content */}
//       <div className="w-full lg:w-8/12">
//         {step === 'cart' && (
//           <>
//             <div className="bg-white p-6 rounded shadow mb-6">
//               <h1 className="text-2xl font-semibold mb-6">Shopping Bag ({cart.length} items)</h1>
              
//               {cart.map(item => (
//                 <div key={item.id} className="flex border-b py-4">
//                   <div className="w-24 h-32 flex-shrink-0">
//                     <img 
//                       src={item.image} 
//                       alt={item.name} 
//                       className="w-full h-full object-cover"
//                     />
//                   </div>
//                   <div className="ml-4 flex-grow">
//                     <h3 className="font-medium">{item.name}</h3>
//                     <p className="text-gray-600">Size: {item.size}</p>
//                     <p className="text-gray-600">Color: {item.color}</p>
//                     <div className="flex items-center mt-2">
//                       <button 
//                         className="w-6 h-6 border flex items-center justify-center"
//                         onClick={() => updateQuantity(item.id, item.quantity - 1)}
//                       >
//                         -
//                       </button>
//                       <span className="mx-2">{item.quantity}</span>
//                       <button 
//                         className="w-6 h-6 border flex items-center justify-center"
//                         onClick={() => updateQuantity(item.id, item.quantity + 1)}
//                       >
//                         +
//                       </button>
//                     </div>
//                   </div>
//                   <div className="flex flex-col items-end">
//                     <span className="font-semibold">₹{item.price}</span>
//                     <button 
//                       className="text-gray-500 mt-auto"
//                       onClick={() => removeItem(item.id)}
//                     >
//                       Remove
//                     </button>
//                   </div>
//                 </div>
//               ))}
              
//               <div className="mt-6">
//                 <div className="flex items-center">
//                   <input 
//                     type="text" 
//                     placeholder="Enter coupon code" 
//                     className="border p-2 flex-grow"
//                     value={couponCode}
//                     onChange={(e) => setCouponCode(e.target.value)}
//                   />
//                   <button 
//                     className="bg-black text-white px-4 py-2 ml-2"
//                     onClick={applyCoupon}
//                   >
//                     Apply
//                   </button>
//                 </div>
//                 {couponApplied && (
//                   <p className="text-green-600 mt-2">Coupon applied successfully!</p>
//                 )}
//               </div>
//             </div>
            
//             <button 
//               className="bg-black text-white px-6 py-3 w-full"
//               onClick={() => setStep('address')}
//               disabled={cart.length === 0}
//             >
//               Proceed to Checkout
//             </button>
//           </>
//         )}
        
//         {step === 'address' && (
//           <div className="bg-white p-6 rounded shadow">
//             <h1 className="text-2xl font-semibold mb-6">Shipping Address</h1>
//             <form onSubmit={handleAddressSubmit}>
//               <div className="mb-4">
//                 <label className="block mb-1">Full Name*</label>
//                 <input 
//                   type="text" 
//                   name="fullName"
//                   value={address.fullName}
//                   onChange={handleAddressChange}
//                   className="w-full border p-2" 
//                   required
//                 />
//               </div>
//               <div className="mb-4">
//                 <label className="block mb-1">Street Address*</label>
//                 <input 
//                   type="text" 
//                   name="streetAddress"
//                   value={address.streetAddress}
//                   onChange={handleAddressChange}
//                   className="w-full border p-2" 
//                   required
//                 />
//               </div>
//               <div className="grid grid-cols-2 gap-4 mb-4">
//                 <div>
//                   <label className="block mb-1">City*</label>
//                   <input 
//                     type="text" 
//                     name="city"
//                     value={address.city}
//                     onChange={handleAddressChange}
//                     className="w-full border p-2" 
//                     required
//                   />
//                 </div>
//                 <div>
//                   <label className="block mb-1">State*</label>
//                   <input 
//                     type="text" 
//                     name="state"
//                     value={address.state}
//                     onChange={handleAddressChange}
//                     className="w-full border p-2" 
//                     required
//                   />
//                 </div>
//               </div>
//               <div className="grid grid-cols-2 gap-4 mb-4">
//                 <div>
//                   <label className="block mb-1">Pincode*</label>
//                   <input 
//                     type="text" 
//                     name="pincode"
//                     value={address.pincode}
//                     onChange={handleAddressChange}
//                     className="w-full border p-2" 
//                     required
//                   />
//                 </div>
//                 <div>
//                   <label className="block mb-1">Phone Number*</label>
//                   <input 
//                     type="tel" 
//                     name="phone"
//                     value={address.phone}
//                     onChange={handleAddressChange}
//                     className="w-full border p-2" 
//                     required
//                   />
//                 </div>
//               </div>
//               <div className="flex justify-between mt-6">
//                 <button 
//                   type="button"
//                   className="border border-black px-6 py-3"
//                   onClick={() => setStep('cart')}
//                 >
//                   Back to Cart
//                 </button>
//                 <button 
//                   type="submit"
//                   className="bg-black text-white px-6 py-3"
//                 >
//                   Continue to Payment
//                 </button>
//               </div>
//             </form>
//           </div>
//         )}
        
//         {step === 'payment' && (
//           <div className="bg-white p-6 rounded shadow">
//             <h1 className="text-2xl font-semibold mb-6">Payment Method</h1>
//             <form onSubmit={handlePaymentSubmit}>
//               <div className="space-y-4">
//                 <div className="border p-4 rounded flex items-center">
//                   <input type="radio" name="payment" id="upi" className="mr-2" defaultChecked />
//                   <label htmlFor="upi" className="flex-grow">UPI</label>
//                 </div>
//                 <div className="border p-4 rounded flex items-center">
//                   <input type="radio" name="payment" id="card" className="mr-2" />
//                   <label htmlFor="card" className="flex-grow">Credit/Debit Card</label>
//                 </div>
//                 <div className="border p-4 rounded flex items-center">
//                   <input type="radio" name="payment" id="netbanking" className="mr-2" />
//                   <label htmlFor="netbanking" className="flex-grow">Net Banking</label>
//                 </div>
//                 <div className="border p-4 rounded flex items-center">
//                   <input type="radio" name="payment" id="cod" className="mr-2" />
//                   <label htmlFor="cod" className="flex-grow">Cash on Delivery</label>
//                 </div>
//               </div>
//               <div className="flex justify-between mt-6">
//                 <button 
//                   type="button"
//                   className="border border-black px-6 py-3"
//                   onClick={() => setStep('address')}
//                 >
//                   Back
//                 </button>
//                 <button 
//                   type="submit"
//                   className="bg-black text-white px-6 py-3"
//                 >
//                   Place Order
//                 </button>
//               </div>
//             </form>
//           </div>
//         )}
        
//         {step === 'confirmation' && (
//           <div className="bg-white p-6 rounded shadow text-center">
//             <div className="mb-6">
//               <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                 </svg>
//               </div>
//             </div>
//             <h1 className="text-2xl font-semibold mb-2">Order Placed Successfully!</h1>
//             <p className="text-gray-600 mb-6">Thank you for shopping with us. Your order confirmation has been sent to your registered email.</p>
//             <div className="text-left p-4 border rounded mb-6">
//               <p className="font-semibold">Order #WS78956412</p>
//               <p className="text-gray-600">Expected delivery: March 18-20, 2025</p>
//             </div>
//             <button 
//               className="bg-black text-white px-6 py-3"
//               onClick={() => {
//                 setCart([]);
//                 setStep('cart');
//               }}
//             >
//               Continue Shopping
//             </button>
//           </div>
//         )}
//       </div>
      
//       {/* Order summary */}
//       {step !== 'confirmation' && (
//         <div className="w-full lg:w-4/12">
//           <div className="bg-white p-6 rounded shadow sticky top-6">
//             <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
//             <div className="space-y-3 border-b pb-4 mb-4">
//               {cart.map(item => (
//                 <div key={item.id} className="flex justify-between">
//                   <span>{item.name} x{item.quantity}</span>
//                   <span>₹{item.price * item.quantity}</span>
//                 </div>
//               ))}
//             </div>
//             <div className="space-y-3 mb-4">
//               <div className="flex justify-between">
//                 <span>Subtotal</span>
//                 <span>₹{calculateSubtotal()}</span>
//               </div>
//               {couponApplied && (
//                 <div className="flex justify-between text-green-600">
//                   <span>Discount</span>
//                   <span>-₹{calculateDiscount()}</span>
//                 </div>
//               )}
//               <div className="flex justify-between">
//                 <span>Delivery</span>
//                 <span>₹99</span>
//               </div>
//             </div>
//             <div className="flex justify-between font-semibold text-lg border-t pt-4">
//               <span>Total</span>
//               <span>₹{calculateTotal()}</span>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Temp;

import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Container,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

const ShoppingCartAndOrder = () => {
  const [cart, setCart] = useState([
    { id: 1, name: "Floral Print Dress", size: "M", color: "Blue", price: 1899, quantity: 1, image: "/api/placeholder/120/150" },
    { id: 2, name: "Classic White Shirt", size: "L", color: "White", price: 1299, quantity: 2, image: "/api/placeholder/120/150" },
    { id: 3, name: "Denim Jeans", size: "32", color: "Dark Blue", price: 1599, quantity: 1, image: "/api/placeholder/120/150" }
  ]);
  
  const [activeStep, setActiveStep] = useState(0);
  const steps = ['Shopping Bag', 'Shipping Address', 'Payment Method', 'Confirmation'];
  
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  
  // Address form state
  const [address, setAddress] = useState({
    fullName: '',
    streetAddress: '',
    city: '',
    state: '',
    pincode: '',
    phone: ''
  });
  
  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    setCart(cart.map(item => 
      item.id === id ? {...item, quantity: newQuantity} : item
    ));
  };
  
  const removeItem = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };
  
  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };
  
  const calculateDiscount = () => {
    return couponApplied ? calculateSubtotal() * 0.1 : 0;
  };
  
  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount() + 99; // 99 is delivery fee
  };
  
  const applyCoupon = () => {
    if (couponCode.toUpperCase() === 'SAVE10') {
      setCouponApplied(true);
    }
  };
  
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddress(prev => ({ ...prev, [name]: value }));
  };
  
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  
  const handleReset = () => {
    setActiveStep(0);
    setCart([]);
  };
  
  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      <Grid container spacing={3}>
        {/* Main content */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            {activeStep === 0 && (
              <>
                <Typography variant="h5" gutterBottom>
                  Shopping Bag ({cart.length} items)
                </Typography>
                <Divider sx={{ my: 2 }} />
                
                {cart.map(item => (
                  <Box key={item.id} sx={{ display: 'flex', py: 2, borderBottom: '1px solid #eee' }}>
                    <Box sx={{ width: 100, height: 120, flexShrink: 0 }}>
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </Box>
                    <Box sx={{ ml: 2, flexGrow: 1 }}>
                      <Typography variant="subtitle1">{item.name}</Typography>
                      <Typography variant="body2" color="text.secondary">Size: {item.size}</Typography>
                      <Typography variant="body2" color="text.secondary">Color: {item.color}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <IconButton 
                          size="small"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                        <Typography sx={{ mx: 1 }}>{item.quantity}</Typography>
                        <IconButton 
                          size="small"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <Typography variant="subtitle1">₹{item.price}</Typography>
                      <IconButton 
                        sx={{ mt: 'auto' }}
                        onClick={() => removeItem(item.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
                
                <Box sx={{ mt: 3 }}>
                  <TextField
                    fullWidth
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Button 
                            variant="contained" 
                            onClick={applyCoupon}
                            disabled={!couponCode}
                          >
                            Apply
                          </Button>
                        </InputAdornment>
                      ),
                    }}
                  />
                  {couponApplied && (
                    <Typography color="success.main" sx={{ mt: 1 }}>
                      Coupon applied successfully!
                    </Typography>
                  )}
                </Box>
              </>
            )}
            
            {activeStep === 1 && (
              <>
                <Typography variant="h5" gutterBottom>
                  Shipping Address
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      name="fullName"
                      value={address.fullName}
                      onChange={handleAddressChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Street Address"
                      name="streetAddress"
                      value={address.streetAddress}
                      onChange={handleAddressChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="City"
                      name="city"
                      value={address.city}
                      onChange={handleAddressChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="State"
                      name="state"
                      value={address.state}
                      onChange={handleAddressChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Pincode"
                      name="pincode"
                      value={address.pincode}
                      onChange={handleAddressChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      name="phone"
                      value={address.phone}
                      onChange={handleAddressChange}
                      required
                    />
                  </Grid>
                </Grid>
              </>
            )}
            
            {activeStep === 2 && (
              <>
                <Typography variant="h5" gutterBottom>
                  Payment Method
                </Typography>
                <Divider sx={{ my: 2 }} />
                <RadioGroup defaultValue="upi">
                  <Stack spacing={2}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <FormControlLabel value="upi" control={<Radio />} label="UPI" />
                    </Paper>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <FormControlLabel value="card" control={<Radio />} label="Credit/Debit Card" />
                    </Paper>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <FormControlLabel value="netbanking" control={<Radio />} label="Net Banking" />
                    </Paper>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <FormControlLabel value="cod" control={<Radio />} label="Cash on Delivery" />
                    </Paper>
                  </Stack>
                </RadioGroup>
              </>
            )}
            
            {activeStep === 3 && (
              <Box sx={{ textAlign: 'center' }}>
                <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Order Placed Successfully!
                </Typography>
                <Typography color="text.secondary" paragraph>
                  Thank you for shopping with us. Your order confirmation has been sent to your registered email.
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, mb: 3, textAlign: 'left' }}>
                  <Typography variant="subtitle1">Order #WS78956412</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Expected delivery: March 18-20, 2025
                  </Typography>
                </Paper>
              </Box>
            )}
          </Paper>
          
          {activeStep !== 3 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                disabled={activeStep === 0}
                onClick={handleBack}
              >
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={activeStep === 0 && cart.length === 0}
              >
                {activeStep === 2 ? 'Place Order' : 'Continue'}
              </Button>
            </Box>
          )}
          
          {activeStep === 3 && (
            <Button
              variant="contained"
              fullWidth
              onClick={handleReset}
            >
              Continue Shopping
            </Button>
          )}
        </Grid>
        
        {/* Order summary */}
        {activeStep !== 3 && (
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Order Summary
                </Typography>
                <Stack spacing={1} sx={{ mb: 2 }}>
                  {cart.map(item => (
                    <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">
                        {item.name} x{item.quantity}
                      </Typography>
                      <Typography variant="body2">
                        ₹{item.price * item.quantity}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
                <Divider sx={{ my: 2 }} />
                <Stack spacing={1} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Subtotal</Typography>
                    <Typography variant="body2">₹{calculateSubtotal()}</Typography>
                  </Box>
                  {couponApplied && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="success.main">Discount</Typography>
                      <Typography variant="body2" color="success.main">-₹{calculateDiscount()}</Typography>
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Delivery</Typography>
                    <Typography variant="body2">₹99</Typography>
                  </Box>
                </Stack>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle1">Total</Typography>
                  <Typography variant="subtitle1">₹{calculateTotal()}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default ShoppingCartAndOrder;