const express = require("express");
const cors = require("cors");
require("dotenv").config();

const groupRoutes = require("./routes/groupRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const authRoutes = require("./routes/authRoutes");



const app = express();


app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/groups", groupRoutes);
app.use("/transactions", transactionRoutes);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});