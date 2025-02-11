const express = require("express");
const router = express.Router();
const cookieController = require("../controllers/cookieController");

// Lấy tất cả cookies
router.get("/", cookieController.getAllCookies);

// Lấy cookie theo sessionId
router.get("/:sessionId", cookieController.getCookieBySessionId);

// Tạo cookie mới
router.post("/", cookieController.createCookie);

// Cập nhật cookie theo sessionId
router.put("/:sessionId", cookieController.updateCookieBySessionId);

// Xóa cookie theo sessionId
router.delete("/:sessionId", cookieController.deleteCookieBySessionId);

module.exports = router;
