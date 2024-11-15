const { poolPromise, sql } = require("../config/db"); // Kết nối database của bạn

// Hàm lấy danh sách lịch
const getSchedules = async () => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT * FROM Schedules"); // Thay 'Schedule' bằng tên bảng thực tế của bạn
    return result.recordset; // Trả về kết quả dưới dạng mảng
  } catch (err) {
    console.error("Error fetching schedules:", err);
    throw err;
  }
};

// Hàm lấy danh sách lịch dựa trên vai trò và torteeId
const getSchedulesByRole = async (role, torteeId) => {
  try {
    const pool = await poolPromise;

    // Construct the query based on user role
    let query = "SELECT * FROM Schedules";
    if (role === "mentor") {
      query += " WHERE mentor_id = @torteeId"; // Mentor sees their mentees' schedules
    } else if (role === "mentee") {
      query += " WHERE mentee_id = @torteeId"; // Mentee sees their mentor's schedules
    }

    const result = await pool
      .request()
      .input("torteeId", sql.Int, torteeId)
      .query(query);

    return result.recordset; // Return the filtered schedules as an array
  } catch (err) {
    console.error("Error fetching schedules by role:", err);
    throw err;
  }
};

// // Hàm thêm lịch mới
const addSchedule = async (schedule) => {
  try {
    const pool = await poolPromise;
    const { mentee_id, scheduled_time, status, title, reason_for_cancel } =
      schedule;

    const mentorQuery = await pool
      .request()
      .input("mentee_id", sql.Int, mentee_id)
      .input("status", sql.NVarChar(20), "connected").query(`
        SELECT mentor_id 
        FROM MentorConnections 
        WHERE mentee_id = @mentee_id AND status = @status
      `);

    const mentor_id = mentorQuery.recordset[0]?.mentor_id;

    if (!mentor_id) {
      throw new Error("No approved connection found for the given mentee.");
    }

    // Insert the schedule with the retrieved mentor_id
    const result = await pool
      .request()
      .input("mentor_id", sql.Int, mentor_id)
      .input("mentee_id", sql.Int, mentee_id)
      .input("scheduled_time", sql.DateTime, scheduled_time)
      .input("status", sql.NVarChar(20), status)
      .input("title", sql.NVarChar(50), title)
      .input("reason_for_cancel", sql.Text, reason_for_cancel).query(`
        INSERT INTO Schedules (mentor_id, mentee_id, scheduled_time, status, title, reason_for_cancel)
        VALUES (@mentor_id, @mentee_id, @scheduled_time, @status, @title, @reason_for_cancel)
      `);

    return result.rowsAffected > 0;
  } catch (err) {
    console.error("Error adding schedule:", err);
    throw err;
  }
};

// const Schedules = {
//   // Cập nhật trạng thái của lịch
//   updateStatus: (scheduleId, status) => {
//     return db.query("UPDATE Schedules SET status = ? WHERE schedule_id = ?", [
//       status,
//       scheduleId,
//     ]);
//   },
// };

const updateStatus = async (scheduleId, status) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("schedule_id", sql.Int, scheduleId)
      .input("status", sql.NVarChar(20), status)
      .query("UPDATE Schedules SET status = @status WHERE schedule_id = @schedule_id");

    return result.rowsAffected > 0;
  } catch (err) {
    console.error("Error updating schedule status:", err);
    throw err;
  }
};

const deleteSchedule = async (scheduleId) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("schedule_id", sql.Int, scheduleId)
      .query("DELETE FROM Schedules WHERE schedule_id = @schedule_id");

    return result.rowsAffected > 0;
  } catch (err) {
    console.error("Error deleting schedule:", err);
    throw err;
  }
};

module.exports = {
  getSchedules,
  addSchedule,
  // Schedules,
  updateStatus,
  getSchedulesByRole,
  deleteSchedule,
};
