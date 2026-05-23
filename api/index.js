const express = require("express");

const cors = require("cors");

require("dotenv").config();

const app = express();

app.use(cors());

app.use(express.json());

// ROUTES
const authRoutes =
  require("../src/routes/authRoutes");

const groupRoutes =
  require("../src/routes/groupRoutes");

const transactionRoutes =
  require("../src/routes/transactionRoutes");

app.use("/auth", authRoutes);

app.use("/groups", groupRoutes);

app.use(
  "/transactions",
  transactionRoutes
);

module.exports = app;