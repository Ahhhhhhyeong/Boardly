const express = require("express");
const cors = require("cors");
require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
// routes
const authRoutes = require("./routes/auth.routes");

const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// url 
app.use("/auth", authRoutes);

module.exports = app;
