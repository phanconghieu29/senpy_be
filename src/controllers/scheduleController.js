const scheduleModel = require("../models/Schedule");
const { poolPromise, sql } = require("../config/db");

// const getSchedules = async (req, res) => {
//   try {
//     const schedules = await scheduleModel.getSchedules();
//     res.json(schedules); // Trả kết quả dưới dạng JSON
//   } catch (err) {
//     res.status(500).send("Error fetching schedules");
//   }
// };

const getSchedules = async (req, res) => {
  const { role, torteeId } = req.user; // Extract role and torteeId from token

  try {
    const schedules = await scheduleModel.getSchedulesByRole(role, torteeId);
    res.json(schedules); // Return the filtered schedules as JSON
  } catch (err) {
    console.error("Error fetching schedules:", err);
    res.status(500).send("Error fetching schedules");
  }
};

const addSchedule = async (req, res) => {
  const { mentee_id, scheduled_time, status, title, reason_for_cancel } =
    req.body;
  try {
    const success = await scheduleModel.addSchedule({
      mentee_id,
      scheduled_time,
      status,
      title,
      reason_for_cancel,
    });
    if (success) {
      res.status(201).send("Schedule added successfully");
    } else {
      res.status(400).send("Failed to add schedule");
    }
  } catch (err) {
    res.status(500).send("Error adding schedule");
  }
};

const approveSchedule = async (req, res) => {
  const { scheduleId } = req.body;

  try {
    await scheduleModel.updateStatus(scheduleId, "scheduled");
    res.status(200).send("Lịch hẹn đã được chấp nhận");
  } catch (err) {
    res.status(500).send("Lỗi khi chấp nhận lịch hẹn");
  }
};

const deleteSchedule = async (req, res) => {
  const { scheduleId } = req.body;

  try {
    await scheduleModel.deleteSchedule(scheduleId);
    res.status(200).send("Lịch hẹn đã được hủy");
  } catch (err) {
    res.status(500).send("Lỗi khi hủy lịch hẹn");
  }
};

module.exports = {
  getSchedules,
  addSchedule,
  approveSchedule,
  deleteSchedule,
};
