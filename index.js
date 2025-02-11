const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose"); // Add this import
const connectDB = require("./src/config/db");
const authRoutes = require("./src/routes/authRoutes");
require("dotenv").config();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(morgan("short"));

// Connect to MongoDB
connectDB();

// Log MongoDB connection status
mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

mongoose.connection.once("open", () => {
  console.log("MongoDB connected successfully");
});

// Routes
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the Mentoring App!");
});

app.get("/set-cookie", (req, res) => {
  res.cookie("sessionId", "abc123", {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  });
  res.cookie("role", "mentee", { maxAge: 24 * 60 * 60 * 1000 });
  res.json({ message: "Cookies đã được set!" });
});

app.get("/get-cookie", (req, res) => {
  res.json({ cookies: req.cookies });
});

app.get("/clear-cookie", (req, res) => {
  res.clearCookie("sessionId");
  res.json({ message: "Cookie sessionId đã được xóa!" });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
