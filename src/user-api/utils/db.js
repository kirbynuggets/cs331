// "use strict";

// // const mysql = require("mysql");
// const config = require("./config");
// const util = require("util");
// const mysql = require("mysql2");

// // TODO Use connection pooling
// // TODO https://www.npmjs.com/package/mysql-error-keys

// const pool = mysql.createPool({
//     host: config.MYSQL_HOST,
//     user: config.MYSQL_USER,
//     password: config.MYSQL_PASSWORD,
//     database: config.MYSQL_DATABASE,
//     waitForConnections: true,
//     connectionLimit: 10,
//     queueLimit: 0
// }).promise();

// module.exports = pool;

// // const connection = mysql.createConnection({
// //     host: config.MYSQL_HOST,
// //     user: config.MYSQL_USER,
// //     password: config.MYSQL_PASSWORD,
// //     database: config.MYSQL_DATABASE,
// // });

// // connection.connect((err) => {
// //     if (err) {
// //         throw err;
// //     }
// //     console.log("Connected to MYSQL database.");
// // });

// // connection.on("error", function (err) {
// //     console.error(err.code);
// // });

// // connection.query = util.promisify(connection.query).bind(connection);

// // module.exports = connection;


// src_old/user-api/utils/db.js
"use strict";

const { Sequelize } = require('sequelize');
const config = require("./config");

// Create SQLite connection with Sequelize
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: process.env.SQLITE_DB_PATH || "user.db",
  logging: process.env.NODE_ENV === "test" ? false : console.log,
});

// Define models
const User = sequelize.define("User", {
  username: {
    type: Sequelize.DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 255],
    },
  },
  email: {
    type: Sequelize.DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password_hash: {
    type: Sequelize.DataTypes.STRING,
    allowNull: false,
  },
});

const Administrator = sequelize.define("Administrator", {
  username: {
    type: Sequelize.DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 255],
    },
  },
  email: {
    type: Sequelize.DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password_hash: {
    type: Sequelize.DataTypes.STRING,
    allowNull: false,
  },
  security_question: {
    type: Sequelize.DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [10, 255],
    },
  },
  security_answer_hash: {
    type: Sequelize.DataTypes.STRING,
    allowNull: false,
  },
});

// Initialize the database
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    await sequelize.sync({ alter: true });
    console.log('All models were synchronized successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();

module.exports = {
  sequelize,
  User,
  Administrator
};