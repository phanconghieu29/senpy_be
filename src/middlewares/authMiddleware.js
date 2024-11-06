const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1]; // Lấy token từ header Authorization

  if (!token) {
    return res.status(401).json({ message: "Token không tồn tại." });
  }

  // Kiểm tra tính hợp lệ của token
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Token không hợp lệ." });
    }

    req.user = user; // Lưu thông tin người dùng vào req.user
    next(); // Tiến hành tiếp theo nếu token hợp lệ
  });
};

module.exports = authMiddleware;
