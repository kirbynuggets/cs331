"use strict";

const signupRouter = require("express").Router();
const dbConn = require("../utils/db");
const validator = require("email-validator");
const bcrypt = require("bcrypt");

// User signup route
signupRouter.post("/", async (request, response) => {
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

module.exports = signupRouter;
