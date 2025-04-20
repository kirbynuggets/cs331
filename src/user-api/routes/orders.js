const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const Order = require('../models/order');
const Product = require('../models/product');

// Get all orders for the current user
router.get('/', authenticate, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 }) // Sort by most recent first
      .populate('items.product');
    
    res.json({ 
      success: true, 
      orders: orders.map(order => formatOrderResponse(order))
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get a single order by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const order = await Order.findOne({ 
      _id: req.params.id,
      user: req.user.id 
    }).populate('items.product');
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    res.json({ 
      success: true, 
      order: formatOrderResponse(order)
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create a new order
router.post('/', 
  authenticate,
  [
    body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
    body('items.*.productId').notEmpty().withMessage('Product ID is required'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('items.*.price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('shippingInfo').notEmpty().withMessage('Shipping information is required'),
    body('paymentMethod').notEmpty().withMessage('Payment method is required'),
    body('total').isFloat({ min: 0 }).withMessage('Total must be a positive number'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    try {
      const { items, shippingInfo, paymentMethod, subtotal, shippingCost, tax, total } = req.body;
      
      // Validate products and availability
      const productIds = items.map(item => item.productId);
      const products = await Product.find({ _id: { $in: productIds } });
      
      if (products.length !== productIds.length) {
        return res.status(400).json({ 
          success: false, 
          message: 'One or more products are not available' 
        });
      }
      
      // Create new order
      const newOrder = new Order({
        user: req.user.id,
        items: items.map(item => ({
          product: item.productId,
          quantity: item.quantity,
          price: item.price,
          size: item.size,
          color: item.color
        })),
        shippingInfo,
        paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending', // Will be updated after payment
        status: 'pending',
        subtotal,
        shippingCost,
        tax,
        total,
        orderNumber: generateOrderNumber(),
        orderDate: new Date(),
        expectedDeliveryDate: calculateExpectedDelivery()
      });
      
      await newOrder.save();
      
      // Populate product details for response
      const populatedOrder = await Order.findById(newOrder._id).populate('items.product');
      
      res.status(201).json({ 
        success: true, 
        message: 'Order created successfully',
        order: formatOrderResponse(populatedOrder)
      });
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

// Get order payment status
router.get('/:id/payment', authenticate, async (req, res) => {
  try {
    const order = await Order.findOne({ 
      _id: req.params.id, 
      user: req.user.id 
    });
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    res.json({ 
      success: true, 
      paymentStatus: order.paymentStatus,
      paymentDetails: order.paymentDetails
    });
  } catch (error) {
    console.error('Error fetching payment status:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update order status (for admins)
router.put('/:id/status', 
  authenticate,
  async (req, res) => {
    try {
      // Check if user is admin
      if (!req.user.isAdmin) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
      }
      
      const { status } = req.body;
      
      // Validate status
      const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid status value'
        });
      }
      
      const order = await Order.findById(req.params.id);
      
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
      
      // Update status
      order.status = status;
      
      // If cancelled, add cancellation date
      if (status === 'cancelled') {
        order.cancelledDate = new Date();
      }
      
      await order.save();
      
      res.json({ success: true, message: 'Order status updated' });
    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

// Helper Functions

// Format order response
function formatOrderResponse(order) {
  return {
    id: order._id,
    orderNumber: order.orderNumber,
    orderDate: order.orderDate,
    status: order.status,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    shippingInfo: order.shippingInfo,
    items: order.items.map(item => ({
      id: item._id,
      productId: item.product._id,
      productDisplayName: item.product.productDisplayName,
      price: item.price,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
      image_url: `/static/images/${item.product._id}.jpg`,
      articleType: item.product.articleType,
      baseColour: item.product.baseColour
    })),
    subtotal: order.subtotal,
    shippingCost: order.shippingCost,
    tax: order.tax,
    total: order.total,
    expectedDeliveryDate: order.expectedDeliveryDate,
    cancelledDate: order.cancelledDate,
    cancellationReason: order.cancellationReason
  };
}

// Generate an order number
function generateOrderNumber() {
  const prefix = 'ORD';
  const timestamp = Date.now().toString().slice(-8); // Last 8 digits of timestamp
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0'); // 3-digit random number
  return `${prefix}${timestamp}${random}`;
}

// Calculate expected delivery date (7 days from now)
function calculateExpectedDelivery() {
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 7);
  return deliveryDate;
}

module.exports = router;