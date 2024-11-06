const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();
const {
  getRequestsByMentor,
  updateConnectionStatus,
} = require("../controllers/mentorConnectionsController");

// Lấy danh sách yêu cầu kết nối của mentee cho mentor
router.get("/requests", authMiddleware, getRequestsByMentor);

// Cập nhật trạng thái kết nối (đồng ý/từ chối)
router.post("/update-status", authMiddleware, updateConnectionStatus);

module.exports = router;
