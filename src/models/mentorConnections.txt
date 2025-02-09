const { poolPromise, sql } = require("../config/db");

// Model xử lý các yêu cầu kết nối của mentor và mentee
class MentorConnection {
  static async getMenteeRequests(menteeId) {
    try {
      const pool = await poolPromise;
      const result = await pool.request().input("mentee_id", sql.Int, menteeId)
        .query(`
          SELECT 
            mc.connection_id,
            mc.mentor_id,
            mc.introduction,
            mc.status,
            mc.request_date,
            mc.approval_date,
            mentor_user.name AS mentor_name,
            mentee_user.name AS mentee_name
          FROM MentorConnections mc
          INNER JOIN Mentee mentee ON mc.mentee_id = mentee.id
          INNER JOIN Mentor mentor ON mc.mentor_id = mentor.id
          INNER JOIN Users mentee_user ON mentee.user_id = mentee_user.user_id
          INNER JOIN Users mentor_user ON mentor.user_id = mentor_user.user_id
          WHERE mc.mentee_id = @mentee_id
          ORDER BY 
            CASE 
              WHEN mc.status = N'Chờ mentor' THEN 1
              WHEN mc.status = N'Chờ BĐH' THEN 2
              ELSE 3
            END,
            mc.request_date DESC
        `);
      return result.recordset;
    } catch (error) {
      throw new Error("Lỗi khi tìm kiếm yêu cầu của mentee: " + error.message);
    }
  }

  static async getMentorRequests(mentorId) {
    try {
      const pool = await poolPromise;
      const result = await pool.request().input("mentor_id", sql.Int, mentorId)
        .query(`
          SELECT 
            mc.connection_id,
            mc.mentee_id,
            mc.introduction,
            mc.status,
            mc.request_date,
            mc.approval_date,
            mentor_user.name AS mentor_name,
            mentee_user.name AS mentee_name
          FROM MentorConnections mc
          INNER JOIN Mentee mentee ON mc.mentee_id = mentee.id
          INNER JOIN Mentor mentor ON mc.mentor_id = mentor.id
          INNER JOIN Users mentee_user ON mentee.user_id = mentee_user.user_id
          INNER JOIN Users mentor_user ON mentor.user_id = mentor_user.user_id
          WHERE mc.mentor_id = @mentor_id
          ORDER BY 
            CASE 
              WHEN mc.status = N'Chờ mentor' THEN 1
              WHEN mc.status = N'Chờ BĐH' THEN 2
              ELSE 3
            END,
            mc.request_date DESC
        `);
      return result.recordset;
    } catch (error) {
      throw new Error("Lỗi khi tìm kiếm yêu cầu của mentor: " + error.message);
    }
  }
  

  // Hủy yêu cầu kết nối của mentee
  static async cancelRequest(connectionId) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("connection_id", sql.Int, connectionId)
        .query(
          "DELETE FROM MentorConnections WHERE connection_id = @connection_id"
        );
      return result.rowsAffected[0] > 0;
    } catch (error) {
      throw new Error("Lỗi khi hủy yêu cầu: " + error.message);
    }
  }

  // Chấp nhận hoặc từ chối yêu cầu kết nối của mentor
  static async updateRequestStatus(connectionId, status) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("connection_id", sql.Int, connectionId)
        .input("status", sql.NVarChar(20), status).query(`
          UPDATE MentorConnections 
          SET status = @status 
          WHERE connection_id = @connection_id
        `);
      return result.rowsAffected[0] > 0;
    } catch (error) {
      throw new Error(
        "Lỗi khi cập nhật trạng thái yêu cầu kết nối: " + error.message
      );
    }
  }

  // Lấy tất cả các yêu cầu mà mentor đã approve và chờ admin duyệt
  static async getApprovedRequests() {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query(`
        SELECT 
          mc.connection_id,
          mc.mentee_id,
          mc.mentor_id,
          mc.introduction,
          mc.status,
          mc.request_date,
          mc.approval_date,
          mentee_user.name AS mentee_name,
          mentor_user.name AS mentor_name
        FROM MentorConnections mc
        INNER JOIN Mentee mentee ON mc.mentee_id = mentee.id
        INNER JOIN Mentor mentor ON mc.mentor_id = mentor.id
        INNER JOIN Users mentee_user ON mentee.user_id = mentee_user.user_id
        INNER JOIN Users mentor_user ON mentor.user_id = mentor_user.user_id
        WHERE mc.status IN (N'Chờ BĐH', N'Đã kết nối', N'Từ chối bởi BĐH')
        ORDER BY 
          CASE 
            WHEN mc.status = N'Chờ BĐH' THEN 1
            WHEN mc.status = N'Đã kết nối' THEN 2
            ELSE 3
          END,
          mc.request_date DESC
      `);
      return result.recordset;
    } catch (error) {
      throw new Error(
        "Lỗi khi tìm kiếm yêu cầu đã được chấp thuận cho quản trị viên: " +
          error.message
      );
    }
  }

  // Admin duyệt kết nối và hủy các yêu cầu khác của mentor và mentee
  static async approveConnection(connectionId, mentorId, menteeId) {
    try {
      const pool = await poolPromise;

      // Cập nhật trạng thái kết nối
      const updateResult = await pool
        .request()
        .input("connection_id", sql.Int, connectionId).query(`
        UPDATE MentorConnections 
        SET status = N'Đã kết nối' 
        WHERE connection_id = @connection_id
      `);

      if (updateResult.rowsAffected[0] === 0) {
        throw new Error("Không tìm thấy kết nối để cập nhật");
      }

      // Kiểm tra có yêu cầu kết nối pending nào không trước khi hủy
      const pendingCheckResult = await pool
        .request()
        .input("mentor_id", sql.Int, mentorId)
        .input("mentee_id", sql.Int, menteeId).query(`
        SELECT COUNT(*) AS pendingCount
        FROM MentorConnections
        WHERE (mentor_id = @mentor_id OR mentee_id = @mentee_id)
        AND status = N'Chờ BĐH'
        AND NOT (mentor_id = @mentor_id AND mentee_id = @mentee_id)
      `);

      const pendingCount = pendingCheckResult.recordset[0].pendingCount;

      // Nếu có yêu cầu pending, tiến hành hủy
      if (pendingCount > 0) {
        const deleteResult = await pool
          .request()
          .input("mentor_id", sql.Int, mentorId)
          .input("mentee_id", sql.Int, menteeId).query(`
          UPDATE MentorConnections
          SET status = N'Từ chối bởi BĐH'
          WHERE (mentor_id = @mentor_id OR mentee_id = @mentee_id)
          AND status IN (N'Chờ mentor', N'Chờ BĐH')
          AND NOT (mentor_id = @mentor_id AND mentee_id = @mentee_id)
        `);

        if (deleteResult.rowsAffected[0] === 0) {
          throw new Error("Không tìm thấy kết nối đang chờ để xóa");
        }
      }

      // Nếu không có lỗi, trả về true để xác nhận duyệt thành công
      return true;
    } catch (error) {
      // Xử lý lỗi
      console.error("Lỗi khi chấp thuận kết nối:", error);
      throw new Error("Lỗi khi chấp thuận kết nối: " + error.message);
    }
  }

  static async getMentorInfo(mentorId) {
    try {
      const pool = await poolPromise;
      const result = await pool.request().input("mentor_id", sql.Int, mentorId)
        .query(`
          SELECT 
            mentor.id,
            mentor.user_id,
            mentor.expertise,
            mentor.strengths,
            mentor.weaknesses,
            mentor.goals,
            mentor.mentoring_expectations,
            mentor.reason_for_mentoring,
            users.name AS mentor_name
          FROM Mentor mentor
          INNER JOIN Users users ON mentor.user_id = users.user_id
          WHERE mentor.id = @mentor_id
        `);
      return result.recordset[0]; // Return mentor info with name
    } catch (error) {
      throw new Error("Lỗi khi tìm thông tin mentor: " + error.message);
    }
  }

  static async getMenteeInfo(menteeId) {
    try {
      const pool = await poolPromise;
      const result = await pool.request().input("mentee_id", sql.Int, menteeId)
        .query(`
          SELECT 
            mentee.id,
            mentee.user_id,
            mentee.year_in_school,
            mentee.major,
            mentee.strengths,
            mentee.weaknesses,
            mentee.goals,
            mentee.mentoring_expectations,
            users.name AS mentee_name
          FROM Mentee mentee
          INNER JOIN Users users ON mentee.user_id = users.user_id
          WHERE mentee.id = @mentee_id
        `);
      return result.recordset[0]; // Return mentee info with name
    } catch (error) {
      throw new Error("Lỗi khi tìm thông tin mentee: " + error.message);
    }
  }
}

module.exports = MentorConnection;
