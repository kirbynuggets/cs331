"use strict";

var usersRouter = require("express").Router();
const dbConn = require("../utils/db");
const validator = require("email-validator");
const bcrypt = require("bcrypt");

// Get all users (admin only)
usersRouter.get("/", async (request, response) => {
  if (!request.administrator) {
    return response
      .status(403)
      .json({ error: "Forbidden: Admin access required" });
  }

  const [users] = await dbConn.query("SELECT username, email FROM user");
  response.json(users);
});

// Create a new user (admin only)
usersRouter.post("/", async (request, response) => {
  if (!request.administrator) {
    return response
      .status(403)
      .json({ error: "Forbidden: Admin access required" });
  }

  let { username, email, password } = request.body;

  // Validate required fields
  if (!username || !password || !email) {
    return response.status(400).json({
      error: "username, password, and email are required",
    });
  }

  // Trim input fields
  username = username.trim();
  password = password.trim();
  email = email.trim();

  // Validate username
  if (username.length < 3) {
    return response.status(400).json({
      error: "username must be at least 3 characters long",
    });
  }

  // Validate password
  if (password.length < 3) {
    return response.status(400).json({
      error: "password must be at least 3 characters long",
    });
  }

  // Validate email
  if (!validator.validate(email)) {
    return response.status(400).json({
      error: "Invalid email",
    });
  }

  // Check for existing username
  const [userWithUsername] = await dbConn.query(
    "SELECT * FROM user WHERE username=?",
    [username],
  );
  if (userWithUsername.length !== 0) {
    return response.status(409).json({
      error: "A user with that username already exists",
    });
  }

  // Check for existing email
  const [userWithEmail] = await dbConn.query(
    "SELECT * FROM user WHERE email=?",
    [email],
  );
  if (userWithEmail.length !== 0) {
    return response.status(409).json({
      error: "A user with that email already exists",
    });
  }

  // Hash password
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  // Insert new user
  await dbConn.query(
    "INSERT INTO user (username, email, password_hash) VALUES (?, ?, ?)",
    [username, email, passwordHash],
  );

  return response.status(201).end();
});

// Change password for a user
usersRouter.post("/changepassword", async (request, response) => {
  if (!request.user) {
    return response
      .status(403)
      .json({ error: "Forbidden: User authentication required" });
  }

  const user = request.user;
  let { new_password, current_password } = request.body;

  // Validate new password
  if (!new_password) {
    return response.status(400).json({
      error: "new_password not provided",
    });
  }
  new_password = new_password.trim();
  if (new_password.length < 3) {
    return response.status(400).json({
      error: "new_password must be at least 3 characters long",
    });
  }

  // Validate current password
  if (!current_password) {
    return response.status(400).json({
      error: "current_password not provided",
    });
  }

  // Verify current password
  const passwordCorrect = await bcrypt.compare(
    current_password,
    user.password_hash,
  );
  if (!passwordCorrect) {
    return response.status(400).json({
      error: "Incorrect current password",
    });
  }

  // Hash new password and update
  const saltRounds = 10;
  const newPasswordHash = await bcrypt.hash(new_password, saltRounds);
  await dbConn.query("UPDATE user SET password_hash=? WHERE username=?", [
    newPasswordHash,
    user.username,
  ]);

  return response.status(200).end();
});

// Update a user (admin only)
usersRouter.put("/:username", async (request, response) => {
  if (!request.administrator) {
    return response
      .status(403)
      .json({ error: "Forbidden: Admin access required" });
  }

  const { username } = request.params;
  let { new_username, email, password } = request.body;

  // Fetch existing user
  const [userSearch] = await dbConn.query(
    "SELECT * FROM user WHERE username=?",
    [username],
  );
  if (userSearch.length === 0) {
    return response.status(404).json({
      error: "User not found",
    });
  }
  const user = userSearch[0];

  // Validate new username
  if (!new_username || new_username.length < 3) {
    return response.status(400).json({
      error: "new_username must be at least 3 characters long",
    });
  }

  // Check for username conflict
  const [userWithUsername] = await dbConn.query(
    "SELECT * FROM user WHERE username=?",
    [new_username],
  );
  if (username !== new_username && userWithUsername.length !== 0) {
    return response.status(409).json({
      error: `A user with the username ${new_username} already exists`,
    });
  }

  // Validate email
  if (!email || !validator.validate(email)) {
    return response.status(400).json({
      error: "Invalid email",
    });
  }

  // Check for email conflict
  const [userWithEmail] = await dbConn.query(
    "SELECT * FROM user WHERE email=?",
    [email],
  );
  if (user.email !== email && userWithEmail.length !== 0) {
    return response.status(409).json({
      error: "A user with that email already exists",
    });
  }

  // Validate password
  if (!password || password.length < 3) {
    return response.status(400).json({
      error: "password must be at least 3 characters long",
    });
  }

  // Hash password
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  // Update user
  await dbConn.query(
    "UPDATE user SET username=?, password_hash=?, email=? WHERE username=?",
    [new_username, passwordHash, email, username],
  );

  return response.status(200).end();
});

// Delete a user (admin only)
usersRouter.delete("/:username", async (request, response) => {
  if (!request.administrator) {
    return response
      .status(403)
      .json({ error: "Forbidden: Admin access required" });
  }

  const { username } = request.params;
  await dbConn.query("DELETE FROM user WHERE username=?", [username]);
  return response.status(204).end();
});

module.exports = usersRouter;
