// routes/scheduleRoutes.js
const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const authMiddleware = require("../middlewares/authMiddleware");

// Route lấy danh sách lịch
router.get('/get-schedules', authMiddleware, scheduleController.getSchedules);

// Route thêm lịch mới
router.post('/add-schedule', authMiddleware, scheduleController.addSchedule);

router.post('/approve-schedule', authMiddleware, scheduleController.approveSchedule);

router.delete('/delete-schedule', authMiddleware, scheduleController.deleteSchedule);

router.get("/ordered", authMiddleware, scheduleController.getOrderedSchedules);

module.exports = router;
