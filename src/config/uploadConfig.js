// config/uploadConfig.js
const multer = require("multer");
const path = require("path");

// Cấu hình lưu trữ Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");  // Đảm bảo thư mục uploads đã tồn tại
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);  // Lấy phần mở rộng của tệp
    cb(null, Date.now() + ext);  // Tên tệp dựa trên thời gian hiện tại
  },
});

// Cấu hình Multer
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },  // Giới hạn tệp tối đa là 5MB
}).single("image");

module.exports = upload;
