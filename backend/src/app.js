const express = require("express");
const cors = require("cors");
require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
// routes
const authRoutes = require("./routes/auth.routes");

const app = express();

app.use(cors());
app.use(express.json());

// url 
app.use("/login", authRoutes);

module.exports = app;
