const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Lưu trữ tệp trong thư mục 'uploads'
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // Lấy phần mở rộng tệp
    cb(null, Date.now() + ext); // Đặt tên cho tệp là thời gian hiện tại + phần mở rộng
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
