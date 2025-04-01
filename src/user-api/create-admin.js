#!/usr/bin/env node
"use strict";

require("dotenv").config();
const readline = require("readline");
const bcrypt = require("bcrypt");
const { Sequelize, DataTypes } = require("sequelize");

// Initialize database connection (same as your app)
const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE || "database",
  process.env.MYSQL_USER || "user",
  process.env.MYSQL_PASSWORD || "password",
  {
    host: process.env.MYSQL_HOST || "localhost",
    dialect: "mysql",
    logging: false,
  }
);

// Define Administrator model (same as your app)
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

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Helper function to prompt for input
function askQuestion(question, hidden = false) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });

    // For password inputs, hide the typing
    if (hidden) {
      const stdin = process.stdin;
      stdin.setRawMode(true);
      stdin.resume();
      stdin.setEncoding("utf8");
      stdin.on("data", (key) => {
        if (key === "\u0003") {
          // Ctrl+C
          process.exit();
        }
      });
    }
  });
}

async function main() {
  try {
    console.log("\nAdmin Account Creation Utility\n");

    // Connect to database
    await sequelize.authenticate();
    console.log("Connected to database successfully.");

    // Sync models
    await Administrator.sync({ alter: true });

    // Get admin details
    const username = await askQuestion("Enter username (3-255 chars): ");
    if (username.length < 3 || username.length > 255) {
      throw new Error("Username must be between 3 and 255 characters");
    }

    const email = await askQuestion("Enter email: ");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Invalid email format");
    }

    const password = await askQuestion("Enter password: ", true);
    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters");
    }

    const confirmPassword = await askQuestion("Confirm password: ", true);
    if (password !== confirmPassword) {
      throw new Error("Passwords do not match");
    }

    const securityQuestion = await askQuestion(
      "Enter security question (min 10 chars): "
    );
    if (securityQuestion.length < 10) {
      throw new Error("Security question must be at least 10 characters");
    }

    const securityAnswer = await askQuestion(
      "Enter answer to security question: "
    );
    if (securityAnswer.length < 3) {
      throw new Error("Security answer must be at least 3 characters");
    }

    // Hash password and security answer
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const securityAnswerHash = await bcrypt.hash(securityAnswer, saltRounds);

    // Create admin record
    await Administrator.create({
      username,
      email,
      password_hash: passwordHash,
      security_question: securityQuestion,
      security_answer_hash: securityAnswerHash,
    });

    console.log("\nAdmin account created successfully!");
  } catch (error) {
    console.error("\nError:", error.message);
    process.exit(1);
  } finally {
    rl.close();
    await sequelize.close();
  }
}

main();
