const express = require("express");
const cors = require("cors");
require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const authRoutes = require("./routes/auth.routes");
const boardRoutes = require("./routes/boards");
const columnRoutes = require("./routes/columns");
const cardRoutes = require("./routes/cards");
const { authMiddleware } = require("./middleware/auth.middleware");

const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/boards", authMiddleware, boardRoutes);
app.use("/columns", authMiddleware, columnRoutes);
app.use("/cards", authMiddleware, cardRoutes);

module.exports = app;
