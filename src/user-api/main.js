"use strict";

require("dotenv").config();
const express = require("express");
require("express-async-errors");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validator = require("email-validator");
const { Sequelize, DataTypes } = require("sequelize");

// Initialize Express app
const app = express();

// Configuration
const PORT = process.env.PORT || 3001;
const SECRET = process.env.SECRET || "secret";

// Database setup with Sequelize
const sequelize = new Sequelize(
  process.env.NODE_ENV === 'test' ? process.env.MYSQL_TEST_DATABASE || 'test_db' : process.env.MYSQL_DATABASE || "database",
  process.env.MYSQL_USER || "user",
  process.env.MYSQL_PASSWORD || "password",
  {
    host: process.env.MYSQL_HOST || "localhost",
    dialect: "mysql",
    logging: process.env.NODE_ENV === "test" ? false : console.log,
  }
);

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

module.exports = { Administrator, User, app };
// Export the app for testing purposes