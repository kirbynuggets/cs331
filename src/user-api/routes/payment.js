const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Razorpay = require('razorpay');
const { authenticate } = require('../middleware/auth');
const Order = require('../models/order');
const { body, validationResult } = require('express-validator');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create a new Razorpay order
router.post('/create', authenticate, async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount'
      });
    }
    
    // Amount should be in paise (multiply by 100)
    const amountInPaise = Math.round(amount * 100);
    
    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1 // Auto capture payment
    };
    
    const order = await razorpay.orders.create(options);
    
    res.json({
      success: true,
      order_id: order.id,
      amount: amount,
      currency: 'INR',
      key_id: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order'
    });
  }
});

// Verify payment signature
router.post('/verify', 
  authenticate,
  [
    body('orderId').notEmpty().withMessage('Order ID is required'),
    body('paymentId').notEmpty().withMessage('Payment ID is required'),
    body('signature').notEmpty().withMessage('Signature is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }
    
    try {
      const { orderId, paymentId, signature } = req.body;
      
      // Find the order in our database
      const order = await Order.findById(orderId);
      
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }
      
      // Verify the payment signature
      const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${order.razorpayOrderId}|${paymentId}`)
        .digest('hex');
      
      if (generatedSignature !== signature) {
        // Payment verification failed
        order.paymentStatus = 'failed';
        await order.save();
        
        return res.status(400).json({
          success: false,
          message: 'Payment verification failed'
        });
      }
      
      // Payment verified successfully
      order.paymentStatus = 'paid';
      order.paymentDetails = {
        paymentId,
        signature,
        paidAt: new Date()
      };
      await order.save();
      
      res.json({
        success: true,
        message: 'Payment verified successfully'
      });
    } catch (error) {
      console.error('Error verifying payment:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify payment'
      });
    }
  }
);

// Get payment methods (could be dynamic in the future)
router.get('/methods', authenticate, (req, res) => {
  // This could be fetched from a database in a real application
  const paymentMethods = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      description: 'Pay securely with your card',
      enabled: true
    },
    {
      id: 'upi',
      name: 'UPI',
      description: 'Pay using UPI apps like Google Pay, PhonePe, etc.',
      enabled: true
    },
    {
      id: 'netbanking',
      name: 'Net Banking',
      description: 'Pay through your bank account',
      enabled: true
    },
    {
      id: 'wallet',
      name: 'Wallet',
      description: 'Pay using digital wallets',
      enabled: true
    },
    {
      id: 'cod',
      name: 'Cash on Delivery',
      description: 'Pay when your order is delivered',
      enabled: true
    }
  ];
  
  res.json({ success: true, methods: paymentMethods });
});

module.exports = router;