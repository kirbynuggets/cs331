// "use strict";

// const bcrypt = require("bcrypt");
// const loginRouter = require("express").Router();
// const dbConn = require("../utils/db");
// const jwt = require("jsonwebtoken");

// // https://stackoverflow.com/questions/46693430/what-are-salt-rounds-and-how-are-salts-stored-in-bcrypt

// loginRouter.post("/user", async (request, response) => {
//   const { username, password } = request.body;

//   const query = "SELECT * FROM user WHERE username=?";
//   const [rows] = await dbConn.query(query, [username]); // Destructure rows from the result
//   const userWithUsername = rows[0]; // Get the first user

//   if (!userWithUsername) {
//     return response.status(401).json({
//       error: "Invalid username",
//     });
//   }

//   // Now userWithUsername is correctly the first row from the query result
//   const passwordCorrect = await bcrypt.compare(
//     password,
//     userWithUsername.password_hash,
//   );

//   if (!passwordCorrect) {
//     return response.status(401).json({
//       error: "Invalid password",
//     });
//   }

//   const userForToken = {
//     username: userWithUsername.username,
//     email: userWithUsername.email,
//   };

//   const token = jwt.sign(userForToken, process.env.SECRET, {
//     expiresIn: 60 * 60,
//   });

//   response.status(200).send({
//     token,
//     username: userWithUsername.username,
//     email: userWithUsername.email,
//     type: "standard_user",
//   });
// });

// loginRouter.post("/admin", async (request, response) => {
//   const { username, password } = request.body;

//   const query = "SELECT * FROM administrator WHERE username=?";
//   const [rows] = await dbConn.query(query, [username]); // Destructure rows
//   const administratorWithUsername = rows[0]; // Get the first admin

//   if (!administratorWithUsername) {
//     return response.status(401).json({
//       error: "Invalid username",
//     });
//   }

//   // Now administratorWithUsername is correctly the first row
//   const passwordCorrect = await bcrypt.compare(
//     password,
//     administratorWithUsername.password_hash,
//   );

//   if (!passwordCorrect) {
//     return response.status(401).json({
//       error: "Invalid password",
//     });
//   }

//   const administratorForToken = {
//     username: administratorWithUsername.username,
//     email: administratorWithUsername.email,
//   };

//   const token = jwt.sign(administratorForToken, process.env.SECRET, {
//     expiresIn: 60 * 60,
//   });

//   response.status(200).send({
//     token,
//     username: administratorWithUsername.username,
//     email: administratorWithUsername.email,
//     type: "administrator",
//   });
// });

// module.exports = loginRouter;


// src_old/user-api/routes/login.js
"use strict";

const bcrypt = require("bcrypt");
const loginRouter = require("express").Router();
const { User, Administrator } = require("../utils/db");
const jwt = require("jsonwebtoken");

loginRouter.post("/user", async (request, response) => {
  const { username, password } = request.body;

  try {
    // Find user with Sequelize
    const userWithUsername = await User.findOne({ 
      where: { username } 
    });

    if (!userWithUsername) {
      return response.status(401).json({
        error: "Invalid username",
      });
    }

    // Compare passwords
    const passwordCorrect = await bcrypt.compare(
      password,
      userWithUsername.password_hash
    );

    if (!passwordCorrect) {
      return response.status(401).json({
        error: "Invalid password",
      });
    }

    const userForToken = {
      username: userWithUsername.username,
      email: userWithUsername.email,
    };

    const token = jwt.sign(userForToken, process.env.SECRET, {
      expiresIn: 60 * 60,
    });

    response.status(200).send({
      token,
      username: userWithUsername.username,
      email: userWithUsername.email,
      type: "standard_user",
    });
  } catch (error) {
    console.error('Login error:', error);
    response.status(500).json({
      error: "Internal server error during login",
    });
  }
});

loginRouter.post("/admin", async (request, response) => {
  const { username, password } = request.body;

  try {
    // Find admin with Sequelize
    const administratorWithUsername = await Administrator.findOne({
      where: { username }
    });

    if (!administratorWithUsername) {
      return response.status(401).json({
        error: "Invalid username",
      });
    }

    // Compare passwords
    const passwordCorrect = await bcrypt.compare(
      password,
      administratorWithUsername.password_hash
    );

    if (!passwordCorrect) {
      return response.status(401).json({
        error: "Invalid password",
      });
    }

    const administratorForToken = {
      username: administratorWithUsername.username,
      email: administratorWithUsername.email,
    };

    const token = jwt.sign(administratorForToken, process.env.SECRET, {
      expiresIn: 60 * 60,
    });

    response.status(200).send({
      token,
      username: administratorWithUsername.username,
      email: administratorWithUsername.email,
      type: "administrator",
    });
  } catch (error) {
    console.error('Admin login error:', error);
    response.status(500).json({
      error: "Internal server error during admin login",
    });
  }
});

module.exports = loginRouter;