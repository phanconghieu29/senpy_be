const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const LoginEvent = require("../models/User"); // LoginEvent model
const User = require("../models/User"); // User model giả định đã có
require("dotenv").config();

const SECRET_KEY = process.env.JWT_SECRET || "your-secret-key";

// Đăng nhập
const login = async (req, res) => {
  const { usernameOrEmail, password } = req.body;

  try {
    // Tìm người dùng theo username hoặc email
    const user = await User.findOne({
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
    });

    if (!user) {
      await logFailedLogin(req, usernameOrEmail, "User not found");
      return res.status(404).json({ message: "User not found" });
    }

    // Kiểm tra mật khẩu
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      await logFailedLogin(req, usernameOrEmail, "Invalid password");
      return res.status(401).json({ message: "Invalid password" });
    }

    // Tạo token JWT
    const token = jwt.sign({ userId: user._id, role: user.role }, SECRET_KEY, {
      expiresIn: "1h",
    });

    // Ghi nhận sự kiện đăng nhập thành công
    await logSuccessfulLogin(req, user._id, usernameOrEmail);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Đăng ký
const register = async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    // Kiểm tra nếu email hoặc username đã tồn tại
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email or username already exists" });
    }

    // Mã hóa mật khẩu và tạo người dùng mới
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role,
    });
    await newUser.save();

    // Ghi nhận sự kiện đăng ký
    await logRegisterEvent(req, newUser);

    res.status(201).json({ message: "Registration successful", user: newUser });
  } catch (err) {
    console.error("Error during registration:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Đăng xuất
const logout = async (req, res) => {
  try {
    const userId = req.user.userId; // Lấy userId từ middleware xác thực JWT

    // Ghi nhận sự kiện đăng xuất
    await logLogoutEvent(req, userId);

    res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    console.error("Error during logout:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Ghi nhận sự kiện đăng nhập thành công
const logSuccessfulLogin = async (req, userId, usernameOrEmail) => {
  const loginEvent = new LoginEvent({
    user_id: userId,
    session_id: req.sessionID || generateSessionId(),
    ip_address: req.ip,
    user_agent: req.headers["user-agent"],
    event_type: "login",
    event_details: {
      username_or_email: usernameOrEmail,
      status: "success",
    },
  });
  await loginEvent.save();
};

// Ghi nhận sự kiện đăng nhập thất bại
const logFailedLogin = async (req, usernameOrEmail, reason) => {
  const loginEvent = new LoginEvent({
    user_id: null,
    session_id: req.sessionID || generateSessionId(),
    ip_address: req.ip,
    user_agent: req.headers["user-agent"],
    event_type: "login",
    event_details: {
      username_or_email: usernameOrEmail,
      status: "failed",
      reason: reason,
    },
  });
  await loginEvent.save();
};

// Ghi nhận sự kiện đăng ký
const logRegisterEvent = async (req, user) => {
  const loginEvent = new LoginEvent({
    user_id: user._id,
    session_id: req.sessionID || generateSessionId(),
    ip_address: req.ip,
    user_agent: req.headers["user-agent"],
    event_type: "register",
    event_details: {
      role: user.role,
    },
  });
  await loginEvent.save();
};

// Ghi nhận sự kiện đăng xuất
const logLogoutEvent = async (req, userId) => {
  const loginEvent = new LoginEvent({
    user_id: userId,
    session_id: req.sessionID || generateSessionId(),
    ip_address: req.ip,
    user_agent: req.headers["user-agent"],
    event_type: "logout",
  });
  await loginEvent.save();
};

// Tạo session_id giả lập nếu không có
const generateSessionId = () => {
  return `sess_${Math.random().toString(36).substring(2, 15)}`;
};

module.exports = {
  login,
  register,
  logout,
};
