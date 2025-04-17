"use strict";

const bcrypt = require("bcrypt");
const adminRouter = require("express").Router();
const dbConn = require("../utils/db");
const jwt = require("jsonwebtoken");
const validator = require("email-validator");

// Create a new administrator
adminRouter.post("/", async (request, response) => {
  let { username, email, password, security_question, security_answer } =
    request.body;

  // Validate required fields
  if (
    !username ||
    !password ||
    !email ||
    !security_question ||
    !security_answer
  ) {
    return response.status(400).json({
      error:
        "username, email, password, security_question, or security_answer missing in request body",
    });
  }

  // Trim input fields
  username = username.trim();
  password = password.trim();
  email = email.trim();
  security_question = security_question.trim();
  security_answer = security_answer.trim();

  // Validate input lengths
  if (username.length < 3 || password.length < 3) {
    return response.status(400).json({
      error: "username and password must each be at least 3 characters long",
    });
  }

  if (!validator.validate(email)) {
    return response.status(400).json({
      error: "Invalid email",
    });
  }

  if (security_question.length < 10) {
    return response.status(400).json({
      error: "security_question must be at least 10 characters long",
    });
  }

  if (security_answer.length < 3) {
    return response.status(400).json({
      error: "security_answer must be at least 3 characters long",
    });
  }

  // Check for existing username
  const [adminUserRows] = await dbConn.query(
    "SELECT * FROM administrator WHERE username=?",
    [username],
  );
  if (adminUserRows.length !== 0) {
    return response.status(409).json({
      error: "An administrator with that username already exists",
    });
  }

  // Check for existing email
  const [adminEmailRows] = await dbConn.query(
    "SELECT * FROM administrator WHERE email=?",
    [email],
  );
  if (adminEmailRows.length !== 0) {
    return response.status(409).json({
      error: "An administrator with that email already exists",
    });
  }

  // Hash password and security answer
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);
  const securityAnswerHash = await bcrypt.hash(security_answer, saltRounds);

  // Insert new administrator
  await dbConn.query(
    "INSERT INTO administrator (username, email, password_hash, security_question, security_answer_hash) VALUES (?, ?, ?, ?, ?)",
    [username, email, passwordHash, security_question, securityAnswerHash],
  );

  return response.status(201).end();
});

// Get all administrators
adminRouter.get("/", async (request, response) => {
  const [rows] = await dbConn.query(
    "SELECT username, email FROM administrator",
  );
  response.json(rows);
});

// Change password for an administrator
adminRouter.post("/changepassword", async (request, response) => {
  const administrator = request.administrator;
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
    administrator.password_hash,
  );
  if (!passwordCorrect) {
    return response.status(400).json({
      error: "Incorrect current_password",
    });
  }

  // Hash new password and update
  const saltRounds = 10;
  const newPasswordHash = await bcrypt.hash(new_password, saltRounds);
  await dbConn.query(
    "UPDATE administrator SET password_hash=? WHERE username=?",
    [newPasswordHash, administrator.username],
  );

  return response.status(200).end();
});

// Update an administrator
adminRouter.put("/:username", async (request, response) => {
  const { username } = request.params;
  let { new_username, email, password, security_question, security_answer } =
    request.body;

  // Fetch existing administrator
  const [adminSearch] = await dbConn.query(
    "SELECT * FROM administrator WHERE username=?",
    [username],
  );
  if (adminSearch.length === 0) {
    return response.status(404).json({
      error: "Administrator not found",
    });
  }
  const administrator = adminSearch[0];

  // Validate new username
  if (!new_username || new_username.length < 3) {
    return response.status(400).json({
      error: "new_username must be at least 3 characters long",
    });
  }

  // Check for username conflict
  const [usernameRows] = await dbConn.query(
    "SELECT * FROM administrator WHERE username=?",
    [new_username],
  );
  if (username !== new_username && usernameRows.length !== 0) {
    return response.status(409).json({
      error: `Username ${new_username} already exists`,
    });
  }

  // Validate email
  if (!email || !validator.validate(email)) {
    return response.status(400).json({
      error: "Invalid email",
    });
  }

  // Check for email conflict
  const [emailRows] = await dbConn.query(
    "SELECT * FROM administrator WHERE email=?",
    [email],
  );
  if (administrator.email !== email && emailRows.length !== 0) {
    return response.status(409).json({
      error: "An administrator with that email already exists",
    });
  }

  // Validate password
  if (!password || password.length < 3) {
    return response.status(400).json({
      error: "password must be at least 3 characters long",
    });
  }

  // Validate security question and answer
  if (!security_question || security_question.length < 10) {
    return response.status(400).json({
      error: "security_question must be at least 10 characters long",
    });
  }
  if (!security_answer || security_answer.length < 3) {
    return response.status(400).json({
      error: "security_answer must be at least 3 characters long",
    });
  }

  // Hash password and security answer
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);
  const securityAnswerHash = await bcrypt.hash(security_answer, saltRounds);

  // Update administrator
  await dbConn.query(
    "UPDATE administrator SET username=?, password_hash=?, email=?, security_question=?, security_answer_hash=? WHERE username=?",
    [
      new_username,
      passwordHash,
      email,
      security_question,
      securityAnswerHash,
      username,
    ],
  );

  return response.status(200).end();
});

// Delete an administrator
adminRouter.delete("/:username", async (request, response) => {
  if (!request.administrator) {
    return response.status(403).end();
  }

  const { username } = request.params;
  await dbConn.query("DELETE FROM administrator WHERE username=?", [username]);
  return response.status(204).end();
});

module.exports = adminRouter;
