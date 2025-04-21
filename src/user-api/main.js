"use strict";

require("dotenv").config();
const express = require("express");
require("express-async-errors");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validator = require("email-validator");
const { Sequelize, DataTypes } = require("sequelize");
const crypto = require('crypto'); // For Razorpay signature verification

// Initialize Express app
const app = express();

// Configuration
const PORT = process.env.PORT || 3001;
const SECRET = process.env.SECRET || "secret";

// Database setup with Sequelize
// const sequelize = new Sequelize(
//   process.env.NODE_ENV === 'test' ? process.env.MYSQL_TEST_DATABASE || 'test_db' : process.env.MYSQL_DATABASE || "database",
//   process.env.MYSQL_USER || "user",
//   process.env.MYSQL_PASSWORD || "password",
//   {
//     host: process.env.MYSQL_HOST || "localhost",
//     dialect: "mysql",
//     logging: process.env.NODE_ENV === "test" ? false : console.log,
//   }
// );
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: process.env.SQLITE_DB_PATH || "user.db",
  logging: process.env.NODE_ENV === "test" ? false : console.log,
});


// Define models
const User = sequelize.define("User", {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 255],
    },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

const Administrator = sequelize.define("Administrator", {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 255],
    },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  security_question: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [10, 255],
    },
  },
  security_answer_hash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

// Order model
const Order = sequelize.define("Order", {
  orderNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'pending',
    validate: {
      isIn: [['pending', 'processing', 'shipped', 'delivered', 'cancelled']]
    }
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: false
  },
  paymentStatus: {
    type: DataTypes.STRING,
    defaultValue: 'pending',
    validate: {
      isIn: [['pending', 'paid', 'failed', 'refunded']]
    }
  },
  paymentDetails: {
    type: DataTypes.JSON,
    allowNull: true
  },
  subtotal: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  shippingCost: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  tax: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  total: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  shippingInfo: {
    type: DataTypes.JSON,
    allowNull: false
  },
  expectedDeliveryDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  deliveredAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  cancelledDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  cancellationReason: {
    type: DataTypes.STRING,
    allowNull: true
  },
  razorpayOrderId: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

// OrderItem model
const OrderItem = sequelize.define("OrderItem", {
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  size: {
    type: DataTypes.STRING,
    allowNull: true
  },
  color: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

// Cart model
const Cart = sequelize.define("Cart", {
    // Add the productId field
  productId: {
    type: DataTypes.INTEGER, // Make sure this matches the type of your product IDs
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    validate: {
      min: 1
    }
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  size: {
    type: DataTypes.STRING,
    allowNull: true
  },
  color: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

// WishlistItem model
const WishlistItem = sequelize.define("WishlistItem", {
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

// SaveForLaterItem model
const SaveForLaterItem = sequelize.define("SaveForLaterItem", {
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  size: {
    type: DataTypes.STRING,
    allowNull: true
  },
  color: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

// UserAddress model
const UserAddress = sequelize.define("UserAddress", {
  fullName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  pincode: {
    type: DataTypes.STRING,
    allowNull: false
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false
  },
  state: {
    type: DataTypes.STRING,
    allowNull: false
  },
  addressType: {
    type: DataTypes.STRING,
    defaultValue: 'home',
    validate: {
      isIn: [['home', 'work', 'other']]
    }
  },
  isDefault: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

// Define relationships
Order.belongsTo(User);
User.hasMany(Order);

Order.hasMany(OrderItem);
OrderItem.belongsTo(Order);

User.hasMany(Cart);
Cart.belongsTo(User);

User.hasMany(WishlistItem);
WishlistItem.belongsTo(User);

User.hasMany(SaveForLaterItem);
SaveForLaterItem.belongsTo(User);

User.hasMany(UserAddress);
UserAddress.belongsTo(User);

// Middleware
app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log("Method:", req.method);
  console.log("Path:  ", req.path);
  console.log("Body:  ", req.body);
  console.log("---");
  next();
});

// Token extractor
app.use((req, res, next) => {
  const authorization = req.get("Authorization");
  if (authorization && authorization.startsWith("Bearer ")) {
    req.token = authorization.replace("Bearer ", "");
  } else {
    req.token = null;
  }
  next();
});

// Error handler
app.use((error, req, res, next) => {
  console.error(error.message);

  if (error.name === "ValidationError") {
    return res.status(400).json({ error: error.message });
  } else if (error.name === "JsonWebTokenError") {
    return res.status(401).json({ error: error.message });
  } else if (error.name === "TokenExpiredError") {
    return res.status(401).json({ error: "token expired" });
  }

  return res.status(500).json({ error: "Internal server error" });
});

// Helper middleware for authentication
const authenticateUser = async (req, res, next) => {
  try {
    const decodedToken = jwt.verify(req.token, SECRET);
    if (!decodedToken.username) {
      return res.status(401).json({ error: "Token invalid" });
    }

    const user = await User.findOne({
      where: { username: decodedToken.username },
    });
    if (user) {
      req.user = user;
      return next();
    }

    const admin = await Administrator.findOne({
      where: { username: decodedToken.username },
    });
    if (admin) {
      req.administrator = admin;
      return next();
    }

    throw new Error("Token invalid");
  } catch (error) {
    next(error);
  }
};

const authenticateAdmin = async (req, res, next) => {
  try {
    const decodedToken = jwt.verify(req.token, SECRET);
    if (!decodedToken.username) {
      return res.status(401).json({ error: "Token invalid" });
    }

    const admin = await Administrator.findOne({
      where: { username: decodedToken.username },
    });
    if (admin) {
      req.administrator = admin;
      return next();
    }

    throw new Error("Admin access required");
  } catch (error) {
    next(error);
  }
};

// Routes

// User routes
app.get("/api/users", authenticateAdmin, async (req, res) => {
  const users = await User.findAll({ attributes: ["username", "email"] });
  res.json(users);
});

app.post("/api/users", authenticateAdmin, async (req, res) => {
  let { username, email, password } = req.body;

  // Validate input
  if (!username || !password || !email) {
    return res
      .status(400)
      .json({ error: "username, password, and email are required" });
  }

  username = username.trim();
  password = password.trim();
  email = email.trim();

  if (username.length < 3) {
    return res
      .status(400)
      .json({ error: "username must be at least 3 characters long" });
  }

  if (password.length < 3) {
    return res
      .status(400)
      .json({ error: "password must be at least 3 characters long" });
  }

  if (!validator.validate(email)) {
    return res.status(400).json({ error: "Invalid email" });
  }

  // Check for existing user
  const existingUser = await User.findOne({ where: { username } });
  if (existingUser) {
    return res
      .status(409)
      .json({ error: "A user with that username already exists" });
  }

  const existingEmail = await User.findOne({ where: { email } });
  if (existingEmail) {
    return res
      .status(409)
      .json({ error: "A user with that email already exists" });
  }

  // Hash password and create user
  const passwordHash = await bcrypt.hash(password, 10);
  await User.create({ username, email, password_hash: passwordHash });

  res.status(201).end();
});

app.post("/api/users/changepassword", authenticateUser, async (req, res) => {
  const user = req.user || req.administrator;
  let { new_password, current_password } = req.body;

  if (!new_password) {
    return res.status(400).json({ error: "new_password not provided" });
  }
  new_password = new_password.trim();
  if (new_password.length < 3) {
    return res
      .status(400)
      .json({ error: "new_password must be at least 3 characters long" });
  }

  if (!current_password) {
    return res.status(400).json({ error: "current_password not provided" });
  }

  const passwordCorrect = await bcrypt.compare(
    current_password,
    user.password_hash
  );
  if (!passwordCorrect) {
    return res.status(400).json({ error: "Incorrect current password" });
  }

  const newPasswordHash = await bcrypt.hash(new_password, 10);
  await user.update({ password_hash: newPasswordHash });

  res.status(200).end();
});

app.put("/api/users/:username", authenticateAdmin, async (req, res) => {
  const { username } = req.params;
  let { new_username, email, password } = req.body;

  const user = await User.findOne({ where: { username } });
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  if (!new_username || new_username.length < 3) {
    return res
      .status(400)
      .json({ error: "new_username must be at least 3 characters long" });
  }

  if (username !== new_username) {
    const existingUser = await User.findOne({
      where: { username: new_username },
    });
    if (existingUser) {
      return res
        .status(409)
        .json({
          error: `A user with the username ${new_username} already exists`,
        });
    }
  }

  if (!email || !validator.validate(email)) {
    return res.status(400).json({ error: "Invalid email" });
  }

  if (user.email !== email) {
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return res
        .status(409)
        .json({ error: "A user with that email already exists" });
    }
  }

  if (!password || password.length < 3) {
    return res
      .status(400)
      .json({ error: "password must be at least 3 characters long" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await user.update({
    username: new_username,
    email,
    password_hash: passwordHash,
  });

  res.status(200).end();
});

app.delete("/api/users/:username", authenticateAdmin, async (req, res) => {
  const { username } = req.params;
  await User.destroy({ where: { username } });
  res.status(204).end();
});

// Admin routes
app.get("/api/admin", authenticateAdmin, async (req, res) => {
  const admins = await Administrator.findAll({
    attributes: ["username", "email"],
  });
  res.json(admins);
});

app.post("/api/admin", async (req, res) => {
  let { username, email, password, security_question, security_answer } =
    req.body;

  if (
    !username ||
    !password ||
    !email ||
    !security_question ||
    !security_answer
  ) {
    return res.status(400).json({
      error:
        "username, email, password, security_question, or security_answer missing",
    });
  }

  username = username.trim();
  password = password.trim();
  email = email.trim();
  security_question = security_question.trim();
  security_answer = security_answer.trim();

  if (username.length < 3 || password.length < 3) {
    return res.status(400).json({
      error: "username and password must each be at least 3 characters long",
    });
  }

  if (!validator.validate(email)) {
    return res.status(400).json({ error: "Invalid email" });
  }

  if (security_question.length < 10) {
    return res.status(400).json({
      error: "security_question must be at least 10 characters long",
    });
  }

  if (security_answer.length < 3) {
    return res.status(400).json({
      error: "security_answer must be at least 3 characters long",
    });
  }

  const existingAdmin = await Administrator.findOne({ where: { username } });
  if (existingAdmin) {
    return res.status(409).json({
      error: "An administrator with that username already exists",
    });
  }

  const existingEmail = await Administrator.findOne({ where: { email } });
  if (existingEmail) {
    return res.status(409).json({
      error: "An administrator with that email already exists",
    });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const securityAnswerHash = await bcrypt.hash(security_answer, 10);

  await Administrator.create({
    username,
    email,
    password_hash: passwordHash,
    security_question,
    security_answer_hash: securityAnswerHash,
  });

  res.status(201).end();
});

app.post("/api/admin/changepassword", authenticateAdmin, async (req, res) => {
  const admin = req.administrator;
  let { new_password, current_password } = req.body;

  if (!new_password) {
    return res.status(400).json({ error: "new_password not provided" });
  }
  new_password = new_password.trim();
  if (new_password.length < 3) {
    return res
      .status(400)
      .json({ error: "new_password must be at least 3 characters long" });
  }

  if (!current_password) {
    return res.status(400).json({ error: "current_password not provided" });
  }

  const passwordCorrect = await bcrypt.compare(
    current_password,
    admin.password_hash
  );
  if (!passwordCorrect) {
    return res.status(400).json({ error: "Incorrect current_password" });
  }

  const newPasswordHash = await bcrypt.hash(new_password, 10);
  await admin.update({ password_hash: newPasswordHash });

  res.status(200).end();
});

app.put("/api/admin/:username", authenticateAdmin, async (req, res) => {
  const { username } = req.params;
  let { new_username, email, password, security_question, security_answer } =
    req.body;

  const admin = await Administrator.findOne({ where: { username } });
  if (!admin) {
    return res.status(404).json({ error: "Administrator not found" });
  }

  if (!new_username || new_username.length < 3) {
    return res
      .status(400)
      .json({ error: "new_username must be at least 3 characters long" });
  }

  if (username !== new_username) {
    const existingAdmin = await Administrator.findOne({
      where: { username: new_username },
    });
    if (existingAdmin) {
      return res
        .status(409)
        .json({ error: `Username ${new_username} already exists` });
    }
  }

  if (!email || !validator.validate(email)) {
    return res.status(400).json({ error: "Invalid email" });
  }

  if (admin.email !== email) {
    const existingEmail = await Administrator.findOne({ where: { email } });
    if (existingEmail) {
      return res
        .status(409)
        .json({ error: "An administrator with that email already exists" });
    }
  }

  if (!password || password.length < 3) {
    return res
      .status(400)
      .json({ error: "password must be at least 3 characters long" });
  }

  if (!security_question || security_question.length < 10) {
    return res.status(400).json({
      error: "security_question must be at least 10 characters long",
    });
  }

  if (!security_answer || security_answer.length < 3) {
    return res.status(400).json({
      error: "security_answer must be at least 3 characters long",
    });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const securityAnswerHash = await bcrypt.hash(security_answer, 10);

  await admin.update({
    username: new_username,
    password_hash: passwordHash,
    email,
    security_question,
    security_answer_hash: securityAnswerHash,
  });

  res.status(200).end();
});

app.delete("/api/admin/:username", authenticateAdmin, async (req, res) => {
  const { username } = req.params;
  await Administrator.destroy({ where: { username } });
  res.status(204).end();
});

// Auth routes
app.post("/api/login/user", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ where: { username } });
  if (!user) {
    return res.status(401).json({ error: "Invalid username" });
  }

  const passwordCorrect = await bcrypt.compare(password, user.password_hash);
  if (!passwordCorrect) {
    return res.status(401).json({ error: "Invalid password" });
  }

  const token = jwt.sign(
    { username: user.username, email: user.email },
    SECRET,
    { expiresIn: "1h" }
  );

  res.json({
    token,
    username: user.username,
    email: user.email,
    type: "standard_user",
  });
});

app.post("/api/login/admin", async (req, res) => {
  const { username, password } = req.body;

  const admin = await Administrator.findOne({ where: { username } });
  if (!admin) {
    return res.status(401).json({ error: "Invalid username" });
  }

  const passwordCorrect = await bcrypt.compare(password, admin.password_hash);
  if (!passwordCorrect) {
    return res.status(401).json({ error: "Invalid password" });
  }

  const token = jwt.sign(
    { username: admin.username, email: admin.email },
    SECRET,
    { expiresIn: "1h" }
  );

  res.json({
    token,
    username: admin.username,
    email: admin.email,
    type: "administrator",
  });
});

app.post("/api/signup", async (req, res) => {
  let { username, email, password } = req.body;

  if (!username || !password || !email) {
    return res
      .status(400)
      .json({ error: "username, password, and email are required" });
  }

  username = username.trim();
  password = password.trim();
  email = email.trim();

  if (username.length < 3) {
    return res
      .status(400)
      .json({ error: "username must be at least 3 characters long" });
  }

  if (password.length < 3) {
    return res
      .status(400)
      .json({ error: "password must be at least 3 characters long" });
  }

  if (!validator.validate(email)) {
    return res.status(400).json({ error: "Invalid email" });
  }

  const existingUser = await User.findOne({ where: { username } });
  if (existingUser) {
    return res
      .status(409)
      .json({ error: "A user with that username already exists" });
  }

  const existingEmail = await User.findOne({ where: { email } });
  if (existingEmail) {
    return res
      .status(409)
      .json({ error: "A user with that email already exists" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await User.create({ username, email, password_hash: passwordHash });

  res.status(201).end();
});

// --- Cart Routes ---
app.get("/api/cart", authenticateUser, async (req, res) => {
  const cartItems = await Cart.findAll({
    where: { UserId: req.user.id },
    attributes: ['id', 'quantity', 'size', 'color', 'productId', 'price']
  });
  
  console.log("in BACKEND bitch")
  // Here you would normally fetch product details from your product database
  // Since your products might be in a separate database, we'll return the cart with productIds
  res.json({ items: cartItems });
});

app.post("/api/cart/add", authenticateUser, async (req, res) => {
  const { productId, quantity, price, size, color } = req.body;
  
  if (!productId || !quantity) {
    return res.status(400).json({ error: "Product ID and quantity are required" });
  }
  
  // Check if item is already in cart
  const existingItem = await Cart.findOne({
    where: { 
      UserId: req.user.id,
      productId,
      size: size || null
    }
  });
  
  if (existingItem) {
    // Update quantity if already in cart
    existingItem.quantity += quantity;
    await existingItem.save();
  } else {
    // Add new item to cart
    await Cart.create({
      UserId: req.user.id,
      productId,
      quantity,
      price: price || null,
      size: size || null,
      color: color || null
    });
  }
  
  // Return updated cart
  const updatedCart = await Cart.findAll({
    where: { UserId: req.user.id },
    attributes: ['id', 'quantity', 'size', 'color', 'productId', 'price']
  });
  
  res.json({ items: updatedCart });
});

app.put("/api/cart/item/:id", authenticateUser, async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  
  if (!quantity || quantity < 1) {
    return res.status(400).json({ error: "Quantity must be at least 1" });
  }
  
  const cartItem = await Cart.findOne({
    where: { 
      id,
      UserId: req.user.id
    }
  });
  
  if (!cartItem) {
    return res.status(404).json({ error: "Cart item not found" });
  }
  
  cartItem.quantity = quantity;
  await cartItem.save();
  
  const updatedCart = await Cart.findAll({
    where: { UserId: req.user.id },
    attributes: ['id', 'quantity', 'size', 'color', 'productId', 'price']
  });
  
  res.json({ items: updatedCart });
});

app.delete("/api/cart/item/:id", authenticateUser, async (req, res) => {
  const { id } = req.params;
  
  await Cart.destroy({
    where: { 
      id,
      UserId: req.user.id
    }
  });
  
  res.status(204).end();
});

app.delete("/api/cart", authenticateUser, async (req, res) => {
  await Cart.destroy({
    where: { UserId: req.user.id }
  });
  
  res.status(204).end();
});

// --- Wishlist Routes ---
app.get("/api/wishlist", authenticateUser, async (req, res) => {
  const wishlistItems = await WishlistItem.findAll({
    where: { UserId: req.user.id },
    attributes: ['id', 'productId']
  });
  
  res.json({ items: wishlistItems });
});

app.post("/api/wishlist/add", authenticateUser, async (req, res) => {
  const { productId } = req.body;
  
  if (!productId) {
    return res.status(400).json({ error: "Product ID is required" });
  }
  
  // Check if item is already in wishlist
  const existingItem = await WishlistItem.findOne({
    where: { 
      UserId: req.user.id,
      productId
    }
  });
  
  if (!existingItem) {
    await WishlistItem.create({
      UserId: req.user.id,
      productId
    });
  }
  
  res.status(201).json({ message: "Item added to wishlist" });
});

app.delete("/api/wishlist/:productId", authenticateUser, async (req, res) => {
  const { productId } = req.params;
  
  await WishlistItem.destroy({
    where: { 
      productId,
      UserId: req.user.id
    }
  });
  
  res.status(204).end();
});

// --- Orders Routes ---
app.get("/api/orders", authenticateUser, async (req, res) => {
  const orders = await Order.findAll({
    where: { UserId: req.user.id },
    include: [
      {
        model: OrderItem,
        attributes: ['id', 'productId', 'quantity', 'price', 'size', 'color']
      }
    ],
    order: [['createdAt', 'DESC']]
  });
  
  res.json({ orders });
});

app.get("/api/orders/:id", authenticateUser, async (req, res) => {
  const { id } = req.params;
  
  const order = await Order.findOne({
    where: { 
      id,
      UserId: req.user.id
    },
    include: [
      {
        model: OrderItem,
        attributes: ['id', 'productId', 'quantity', 'price', 'size', 'color']
      }
    ]
  });
  
  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }
  
  res.json({ order });
});

app.post("/api/orders", authenticateUser, async (req, res) => {
  const { items, shippingInfo, paymentMethod, subtotal, shippingCost, tax, total } = req.body;
  
  if (!items || !items.length || !shippingInfo || !paymentMethod) {
    return res.status(400).json({ error: "Missing required order information" });
  }
  
  // Generate order number
  const orderNumber = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;
  
  // Calculate expected delivery date (7 days from now)
  const expectedDelivery = new Date();
  expectedDelivery.setDate(expectedDelivery.getDate() + 7);
  
  try {
    // Create the order in transaction
    const result = await sequelize.transaction(async (t) => {
      // Create order
      const order = await Order.create({
        UserId: req.user.id,
        orderNumber,
        status: 'pending',
        paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
        subtotal,
        shippingCost,
        tax,
        total,
        shippingInfo,
        expectedDeliveryDate: expectedDelivery
      }, { transaction: t });
      
      // Create order items
      const orderItems = await Promise.all(
        items.map(item => {
          return OrderItem.create({
            OrderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            size: item.size || null,
            color: item.color || null
          }, { transaction: t });
        })
      );
      
      // Clear the cart after successful order
      await Cart.destroy({
        where: { UserId: req.user.id },
        transaction: t
      });
      
      return { order, orderItems };
    });
    
    res.status(201).json({ 
      success: true,
      message: "Order created successfully",
      order: result.order
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
});

app.get("/api/orders/:id/payment", authenticateUser, async (req, res) => {
  const { id } = req.params;
  
  const order = await Order.findOne({
    where: { 
      id,
      UserId: req.user.id
    },
    attributes: ['id', 'paymentStatus', 'paymentDetails']
  });
  
  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }
  
  res.json({ 
    paymentStatus: order.paymentStatus,
    paymentDetails: order.paymentDetails
  });
});

// --- Addresses Routes ---
app.get("/api/user/addresses", authenticateUser, async (req, res) => {
  const addresses = await UserAddress.findAll({
    where: { UserId: req.user.id },
    order: [['isDefault', 'DESC'], ['createdAt', 'DESC']]
  });
  
  res.json({ addresses });
});

app.post("/api/user/addresses", authenticateUser, async (req, res) => {
  const { fullName, phone, pincode, address, city, state, addressType, isDefault } = req.body;
  
  if (!fullName || !phone || !pincode || !address || !city || !state) {
    return res.status(400).json({ error: "Missing required address information" });
  }
  
  try {
    // Handle default address (only one address can be default)
    if (isDefault) {
      await UserAddress.update(
        { isDefault: false },
        { where: { UserId: req.user.id, isDefault: true } }
      );
    }
    
    // Create new address
    const newAddress = await UserAddress.create({
      UserId: req.user.id,
      fullName,
      phone,
      pincode,
      address,
      city,
      state,
      addressType: addressType || 'home',
      isDefault: isDefault || false
    });
    
    // If this is the first address, make it default
    const addressCount = await UserAddress.count({ where: { UserId: req.user.id } });
    if (addressCount === 1) {
      await newAddress.update({ isDefault: true });
    }
    
    res.status(201).json({ address: newAddress });
  } catch (error) {
    console.error("Error creating address:", error);
    res.status(500).json({ error: "Failed to create address" });
  }
});

app.put("/api/user/addresses/:id", authenticateUser, async (req, res) => {
  const { id } = req.params;
  const { fullName, phone, pincode, address, city, state, addressType, isDefault } = req.body;
  
  if (!fullName || !phone || !pincode || !address || !city || !state) {
    return res.status(400).json({ error: "Missing required address information" });
  }
  
  const userAddress = await UserAddress.findOne({
    where: { 
      id,
      UserId: req.user.id
    }
  });
  
  if (!userAddress) {
    return res.status(404).json({ error: "Address not found" });
  }
  
  try {
    // Handle default address
    if (isDefault && !userAddress.isDefault) {
      await UserAddress.update(
        { isDefault: false },
        { where: { UserId: req.user.id, isDefault: true } }
      );
    }
    
    // Update address
    await userAddress.update({
      fullName,
      phone,
      pincode,
      address,
      city,
      state,
      addressType: addressType || 'home',
      isDefault: isDefault !== undefined ? isDefault : userAddress.isDefault
    });
    
    res.json({ address: userAddress });
  } catch (error) {
    console.error("Error updating address:", error);
    res.status(500).json({ error: "Failed to update address" });
  }
});

app.delete("/api/user/addresses/:id", authenticateUser, async (req, res) => {
  const { id } = req.params;
  
  const address = await UserAddress.findOne({
    where: { 
      id,
      UserId: req.user.id
    }
  });
  
  if (!address) {
    return res.status(404).json({ error: "Address not found" });
  }
  
  // Don't allow deletion of default address
  if (address.isDefault) {
    return res.status(400).json({ error: "Cannot delete default address" });
  }
  
  await address.destroy();
  
  res.status(204).end();
});

app.put("/api/user/addresses/:id/default", authenticateUser, async (req, res) => {
  const { id } = req.params;
  
  const address = await UserAddress.findOne({
    where: { 
      id,
      UserId: req.user.id
    }
  });
  
  if (!address) {
    return res.status(404).json({ error: "Address not found" });
  }
  
  try {
    // Reset all addresses to non-default
    await UserAddress.update(
      { isDefault: false },
      { where: { UserId: req.user.id } }
    );
    
    // Set this address as default
    await address.update({ isDefault: true });
    
    res.json({ message: "Default address updated" });
  } catch (error) {
    console.error("Error updating default address:", error);
    res.status(500).json({ error: "Failed to update default address" });
  }
});

// --- Payment Routes ---
// Using Razorpay for payment integration
// You'll need to install the razorpay package: npm install razorpay
// And add this import at the top: const Razorpay = require('razorpay');

// Initialize Razorpay with your key id and secret
// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET
// });

app.post("/api/payment/create", authenticateUser, async (req, res) => {
  const { amount } = req.body;
  
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: "Invalid amount" });
  }
  
  try {
    // Mock implementation for development
    // In production, replace with actual Razorpay implementation
    const orderId = `order_${Date.now()}`;
    
    res.json({
      success: true,
      order_id: orderId,
      amount: amount,
      currency: "INR",
      key_id: "rzp_test_your_key_id" // Replace with actual key in production
    });
    
    // Actual Razorpay implementation would be:
    // const options = {
    //   amount: Math.round(amount * 100), // Razorpay expects amount in paise
    //   currency: "INR",
    //   receipt: `receipt_${Date.now()}`
    // };
    // const order = await razorpay.orders.create(options);
    // res.json({
    //   success: true,
    //   order_id: order.id,
    //   amount: amount,
    //   currency: order.currency,
    //   key_id: process.env.RAZORPAY_KEY_ID
    // });
  } catch (error) {
    console.error("Payment creation error:", error);
    res.status(500).json({ error: "Failed to create payment" });
  }
});

app.post("/api/payment/verify", authenticateUser, async (req, res) => {
  const { orderId, paymentId, signature } = req.body;
  
  if (!orderId || !paymentId) {
    return res.status(400).json({ error: "Missing payment verification details" });
  }
  
  try {
    // Mock implementation for development
    // In production, verify the signature with Razorpay
    
    // Find the order and update its payment status
    const order = await Order.findByPk(orderId);
    
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    
    // Update payment status
    await order.update({
      paymentStatus: 'paid',
      paymentDetails: {
        paymentId,
        paidAt: new Date()
      }
    });
    
    res.json({ success: true, message: "Payment verified successfully" });
    
    // Actual Razorpay verification would be:
    // const generatedSignature = crypto
    //   .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    //   .update(`${order.razorpayOrderId}|${paymentId}`)
    //   .digest("hex");
    //
    // if (generatedSignature !== signature) {
    //   await order.update({ paymentStatus: 'failed' });
    //   return res.status(400).json({ error: "Invalid payment signature" });
    // }
    //
    // await order.update({
    //   paymentStatus: 'paid',
    //   paymentDetails: {
    //     paymentId,
    //     signature,
    //     paidAt: new Date()
    //   }
    // });
    //
    // res.json({ success: true, message: "Payment verified successfully" });
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({ error: "Failed to verify payment" });
  }
});

// Unknown endpoint handler
app.use((req, res) => {
  res.status(404).send({ error: "unknown endpoint" });
});

// Database synchronization and server startup
(async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection has been established successfully.");

    await sequelize.sync({ alter: true });
    console.log("Database synchronized");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    process.exit(1);
  }
})();

module.exports = { 
  Administrator, 
  User, 
  Order, 
  OrderItem, 
  Cart, 
  WishlistItem, 
  SaveForLaterItem, 
  UserAddress, 
  app 
};// Export the app for testing purposes