const mysql = require("mysql2/promise"); // Changed from 'mysql'
const bcrypt = require("bcrypt");
require("dotenv").config();

async function createAdmin() {
  const adminUser = {
    username: "john_doe",
    email: "john_doe@example.com",
    password: "heyoo",
    security_question: "What is your favorite color?",
    security_answer: "blue",
  };

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(adminUser.password, saltRounds);
  const securityAnswerHash = await bcrypt.hash(
    adminUser.security_answer,
    saltRounds,
  );

  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || "localhost",
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "password",
    database: process.env.MYSQL_DATABASE || "fashion_ecommerce",
  });

  try {
    console.log("Creating admin user...");
    const [result] = await connection.execute(
      "INSERT INTO administrator (username, email, password_hash, security_question, security_answer_hash) VALUES (?, ?, ?, ?, ?)",
      [
        adminUser.username,
        adminUser.email,
        passwordHash,
        adminUser.security_question,
        securityAnswerHash,
      ],
    );

    console.log("Admin user created successfully!");
    console.log("Admin ID:", result.insertId);
    console.log("Username:", adminUser.username);
    console.log("Email:", adminUser.email);
  } catch (error) {
    console.error("Error creating admin user:", error.message);
  } finally {
    await connection.end();
  }
}

createAdmin().catch(console.error);
