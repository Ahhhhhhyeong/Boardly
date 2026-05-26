const express = require("express");
const cors = require("cors");
// routes
const authRoutes = require("./routes/auth.routes");

const app = express();

app.use(cors());
app.use(express.json());

// url 
app.use("/login", authRoutes);

module.exports = app;