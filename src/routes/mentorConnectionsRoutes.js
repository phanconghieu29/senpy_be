const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();
const MentorConnectionController = require("../controllers/mentorConnectionsController");
// const {
//   getRequestsByMentor,
//   updateConnectionStatus,
// } = require("../controllers/mentorConnectionsController");

// // Lấy danh sách yêu cầu kết nối của mentee cho mentor
// router.get("/requests", authMiddleware, getRequestsByMentor);

// // Cập nhật trạng thái kết nối (đồng ý/từ chối)
// router.post("/update-status", authMiddleware, updateConnectionStatus);

// API: Lấy tất cả yêu cầu kết nối của mentee
router.get(
  "/mentees/requests",
  authMiddleware,
  MentorConnectionController.getMenteeRequests
);

// API: Hủy yêu cầu kết nối của mentee
router.delete(
  "/mentees/requests/:connectionId",
  authMiddleware,
  MentorConnectionController.cancelRequest
);

// API: Lấy tất cả yêu cầu kết nối của mentor
router.get(
  "/mentors/requests",
  authMiddleware,
  MentorConnectionController.getMentorRequests
);

// API: Chấp nhận hoặc từ chối yêu cầu kết nối của mentor
router.patch(
  "/mentors/requests/:connectionId",
  authMiddleware,
  MentorConnectionController.updateRequestStatus
);

// API: Admin duyệt kết nối
router.post(
  "/admin/approve-connection/",
  authMiddleware,
  MentorConnectionController.approveConnection
);

// API: Lấy thông tin yêu cầu kết nối của mentee và kiểm tra trạng thái kết nối
router.get(
  "/mentees/status",
  authMiddleware,
  MentorConnectionController.getMenteeStatus
);

router.get(
  "/mentors/status",
  authMiddleware,
  MentorConnectionController.getMentorStatus
);

// Route lấy các yêu cầu mà mentor đã approve cho admin duyệt
router.get(
  "/admin/approved-requests",
  authMiddleware,
  MentorConnectionController.getApprovedRequests
);

module.exports = router;
