const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const authRoutes = require("./src/routes/authRoutes"); // Đảm bảo authRoutes được import chính xác
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(morgan("short"));

// Đăng ký authRoutes cho các đường dẫn bắt đầu bằng /api/auth
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the Mentoring App!");
});

app.get("/set-cookie", (req, res) => {
  res.cookie("sessionId", "abc123", {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // Cookie tồn tại trong 24 giờ
  });
  res.cookie("role", "mentee", { maxAge: 24 * 60 * 60 * 1000 });
  res.json({ message: "Cookies đã được set!" });
});

app.get("/get-cookie", (req, res) => {
  const cookies = req.cookies;
  res.json({ cookies });
});

app.get("/clear-cookie", (req, res) => {
  res.clearCookie("sessionId");
  res.json({ message: "Cookie sessionId đã được xóa!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
