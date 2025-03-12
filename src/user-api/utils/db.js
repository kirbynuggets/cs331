"use strict";

// const mysql = require("mysql");
const config = require("./config");
const util = require("util");
const mysql = require("mysql2");

// TODO Use connection pooling
// TODO https://www.npmjs.com/package/mysql-error-keys

const pool = mysql.createPool({
    host: config.MYSQL_HOST,
    user: config.MYSQL_USER,
    password: config.MYSQL_PASSWORD,
    database: config.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
}).promise();

module.exports = pool;

// const connection = mysql.createConnection({
//     host: config.MYSQL_HOST,
//     user: config.MYSQL_USER,
//     password: config.MYSQL_PASSWORD,
//     database: config.MYSQL_DATABASE,
// });

// connection.connect((err) => {
//     if (err) {
//         throw err;
//     }
//     console.log("Connected to MYSQL database.");
// });

// connection.on("error", function (err) {
//     console.error(err.code);
// });

// connection.query = util.promisify(connection.query).bind(connection);

// module.exports = connection;
