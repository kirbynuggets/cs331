"use strict";

const config = require("./utils/config");
const logger = require("./utils/logger");
const express = require("express");
require("express-async-errors");
const cors = require("cors");
const middleware = require("./utils/middleware");
const usersRouter = require("./routes/users");
const adminRouter = require("./routes/admin");
const loginRouter = require("./routes/login");
const signupRouter = require("./routes/signup");

const app = express();

logger.info(`Server running on port ${config.PORT}`);

app.use(cors());
app.use(express.json());
app.use(middleware.requestLogger);
app.use(middleware.tokenExtractor);

app.use("/api/users", middleware.userAdminExtractor, usersRouter);
app.use("/api/admin", middleware.adminExtractor, adminRouter);
app.use("/api/login", loginRouter);
app.use("/api/signup", signupRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
