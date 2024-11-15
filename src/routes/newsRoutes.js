const express = require("express");
const upload = require("../config/uploadConfig");  // Import multer
const NewsController = require("../controllers/NewsController");
const path = require("path");
const router = express.Router();

// Đảm bảo route này xử lý việc upload file
router.post("/upload", upload, (req, res) => {
  if (req.file) {
    return res.status(200).json({
      message: "File uploaded successfully!",
      file: req.file,  // Trả về thông tin file đã được upload
    });
  } else {
    return res.status(400).json({ message: "Không có file nào được tải lên" });
  }
});

// Định tuyến để tạo bài viết mới
router.post("/create", upload, NewsController.create);

// Định tuyến để lấy tất cả bài viết
router.get("/all", NewsController.getAll);

router.get("/:news_id", NewsController.getNewsById);

// Thêm route cho chỉnh sửa bài viết
router.put("/update", upload, NewsController.update);
// Xoá bài đăng theo news_id
router.delete("/delete/:news_id", NewsController.delete);
module.exports = router;
