const { poolPromise, sql } = require("../config/db"); // Kết nối database của bạn

// Hàm lấy danh sách lịch
// const getSchedules = async () => {
//   try {
//     const pool = await poolPromise;
//     const result = await pool.request().query("SELECT * FROM Schedules"); // Thay 'Schedule' bằng tên bảng thực tế của bạn
//     return result.recordset; // Trả về kết quả dưới dạng mảng
//   } catch (err) {
//     console.error("Lỗi khi tải lịch trình:", err);
//     throw err;
//   }
// };

const getSchedules = async () => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 
          s.schedule_id,
          s.scheduled_time,
          s.status,
          s.title,
          s.reason_for_cancel,
          m_user.name AS mentor_name,
          me_user.name AS mentee_name
      FROM 
          Schedules s
      JOIN 
          Mentor m ON s.mentor_id = m.id
      JOIN 
          Users m_user ON m.user_id = m_user.user_id
      JOIN 
          Mentee me ON s.mentee_id = me.id
      JOIN 
          Users me_user ON me.user_id = me_user.user_id;
    `);

    return result.recordset; // Trả về kết quả dưới dạng mảng
  } catch (err) {
    console.error("Lỗi khi tải lịch trình:", err);
    throw err;
  }
};

// Hàm lấy danh sách lịch dựa trên vai trò và torteeId
const getSchedulesByRole = async (role, torteeId) => {
  try {
    const pool = await poolPromise;

    // Construct the query based on user role
    let query = `
      SELECT 
          s.schedule_id,
          s.scheduled_time,
          s.status,
          s.title,
          s.reason_for_cancel,
          s.location,
          m_user.name AS mentor_name,
          me_user.name AS mentee_name
      FROM 
          Schedules s
      JOIN 
          Mentor m ON s.mentor_id = m.id
      JOIN 
          Users m_user ON m.user_id = m_user.user_id
      JOIN 
          Mentee me ON s.mentee_id = me.id
      JOIN 
          Users me_user ON me.user_id = me_user.user_id
    `;
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
    console.error("Lỗi khi tìm lịch trình theo vai trò:", err);
    throw err;
  }
};

// // Hàm thêm lịch mới
const addSchedule = async (schedule) => {
  try {
    const pool = await poolPromise;
    const { mentee_id, scheduled_time, status, title, location, reason_for_cancel } =
      schedule;

    const mentorQuery = await pool
      .request()
      .input("mentee_id", sql.Int, mentee_id)
      .input("status", sql.NVarChar(20), "Đã kết nối").query(`
        SELECT mentor_id 
        FROM MentorConnections 
        WHERE mentee_id = @mentee_id AND status = @status
      `);

    const mentor_id = mentorQuery.recordset[0]?.mentor_id;

    if (!mentor_id) {
      throw new Error(
        "Không tìm thấy kết nối được chấp thuận cho người được cố vấn đã cho."
      );
    }

    // Insert the schedule with the retrieved mentor_id
    const result = await pool
      .request()
      .input("mentor_id", sql.Int, mentor_id)
      .input("mentee_id", sql.Int, mentee_id)
      .input("scheduled_time", sql.DateTime, scheduled_time)
      .input("status", sql.NVarChar(20), status)
      .input("title", sql.NVarChar(50), title)
      .input("location", sql.NVarChar(100), location)
      .input("reason_for_cancel", sql.Text, reason_for_cancel).query(`
        INSERT INTO Schedules (mentor_id, mentee_id, scheduled_time, status, title, location, reason_for_cancel)
        VALUES (@mentor_id, @mentee_id, @scheduled_time, @status, @title, @location, @reason_for_cancel)
      `);

    return result.rowsAffected > 0;
  } catch (err) {
    console.error("Lỗi đặt lịch:", err);
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
      .query(
        "UPDATE Schedules SET status = @status WHERE schedule_id = @schedule_id"
      );

    return result.rowsAffected > 0;
  } catch (err) {
    console.error("Lỗi cập nhật trạng thái lịch:", err);
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
    console.error("Lỗi xóa lịch:", err);
    throw err;
  }
};

const getOrderedSchedulesForMentee = async (menteeId) => {
  try {
    const pool = await poolPromise;

    const query = `
      SELECT 
          s.schedule_id,
          s.scheduled_time,
          ROW_NUMBER() OVER (PARTITION BY s.mentor_id, s.mentee_id ORDER BY s.scheduled_time) AS meeting_order,
          ISNULL(ss.summary_id, 0) AS has_report
      FROM 
          Schedules s
      LEFT JOIN 
          SessionSummaries ss ON s.schedule_id = ss.schedule_id
      WHERE 
          s.mentee_id = @menteeId AND 
          s.status = 'scheduled'
      ORDER BY 
          s.scheduled_time;
    `;

    const result = await pool
      .request()
      .input("menteeId", sql.Int, menteeId)
      .query(query);

    return result.recordset; // Trả về kết quả dưới dạng mảng
  } catch (err) {
    console.error("Lỗi khi lấy danh sách lịch trình có thứ tự:", err);
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
  getOrderedSchedulesForMentee,
};
