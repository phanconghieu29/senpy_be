const { poolPromise, sql } = require("../config/db");

// Model xử lý các yêu cầu kết nối của mentor và mentee
class MentorConnection {
  // Lấy tất cả yêu cầu kết nối của mentee
  // static async getMenteeRequests(menteeId) {
  //   try {
  //     const pool = await poolPromise;
  //     const result = await pool.request().input("mentee_id", sql.Int, menteeId)
  //       .query(`
  //         SELECT * FROM MentorConnections
  //         WHERE mentee_id = @mentee_id
  //         ORDER BY request_date DESC
  //       `);
  //     return result.recordset;
  //   } catch (error) {
  //     throw new Error("Error fetching mentee requests: " + error.message);
  //   }
  // }
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
          ORDER BY mc.request_date DESC
        `);
      return result.recordset;
    } catch (error) {
      throw new Error("Error fetching mentee requests: " + error.message);
    }
  }

  // Lấy tất cả yêu cầu kết nối của mentor
  // static async getMentorRequests(mentorId) {
  //   try {
  //     const pool = await poolPromise;
  //     const result = await pool.request().input("mentor_id", sql.Int, mentorId)
  //       .query(`
  //         SELECT * FROM MentorConnections
  //         WHERE mentor_id = @mentor_id AND (status = 'pending' OR status = 'connected')
  //         ORDER BY request_date DESC
  //       `);
  //     return result.recordset;
  //   } catch (error) {
  //     throw new Error("Error fetching mentor requests: " + error.message);
  //   }
  // }

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
          WHERE mc.mentor_id = @mentor_id AND (mc.status = 'pending' OR mc.status = 'connected')
          ORDER BY mc.request_date DESC
        `);
      return result.recordset;
    } catch (error) {
      throw new Error("Error fetching mentor requests: " + error.message);
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
      throw new Error("Error canceling request: " + error.message);
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
      throw new Error("Error updating request status: " + error.message);
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
        WHERE mc.status = 'awaiting_admin' OR mc.status = 'connected'
        ORDER BY mc.request_date DESC
      `);
      return result.recordset;
    } catch (error) {
      throw new Error(
        "Error fetching approved requests for admin: " + error.message
      );
    }
  }

  // Admin duyệt kết nối và hủy các yêu cầu khác của mentor và mentee
  static async approveConnection(mentorId, menteeId) {
    try {
      const pool = await poolPromise;

      // Cập nhật trạng thái kết nối
      const updateResult = await pool
        .request()
        .input("mentor_id", sql.Int, mentorId)
        .input("mentee_id", sql.Int, menteeId).query(`
        UPDATE MentorConnections
        SET status = 'connected'
        WHERE mentor_id = @mentor_id AND mentee_id = @mentee_id
      `);

      if (updateResult.rowsAffected[0] === 0) {
        throw new Error("No connection found to update");
      }

      // Kiểm tra có yêu cầu kết nối pending nào không trước khi hủy
      const pendingCheckResult = await pool
        .request()
        .input("mentor_id", sql.Int, mentorId)
        .input("mentee_id", sql.Int, menteeId).query(`
        SELECT COUNT(*) AS pendingCount
        FROM MentorConnections
        WHERE (mentor_id = @mentor_id OR mentee_id = @mentee_id)
        AND status = 'pending'
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
          SET status = 'rejected'
          WHERE (mentor_id = @mentor_id OR mentee_id = @mentee_id)
          AND status = 'pending'
          AND NOT (mentor_id = @mentor_id AND mentee_id = @mentee_id)
        `);

        if (deleteResult.rowsAffected[0] === 0) {
          throw new Error("No pending connections found to delete");
        }
      }

      // Nếu không có lỗi, trả về true để xác nhận duyệt thành công
      return true;
    } catch (error) {
      // Xử lý lỗi
      console.error("Error approving connection:", error);
      throw new Error("Error approving connection: " + error.message);
    }
  }

  // static async getMentorInfo(mentorId) {
  //   try {
  //     const pool = await poolPromise;
  //     const result = await pool
  //       .request()
  //       .input("mentor_id", sql.Int, mentorId)
  //       .query("SELECT * FROM Mentor WHERE id = @mentor_id");
  //     return result.recordset[0]; // Trả về thông tin của mentor
  //   } catch (error) {
  //     throw new Error("Error fetching mentor info: " + error.message);
  //   }
  // }

  static async getMentorInfo(mentorId) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("mentor_id", sql.Int, mentorId)
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
      throw new Error("Error fetching mentor info: " + error.message);
    }
  }
  

  // static async getMenteeInfo(menteeId) {
  //   try {
  //     const pool = await poolPromise;
  //     const result = await pool
  //       .request()
  //       .input("mentee_id", sql.Int, menteeId)
  //       .query("SELECT * FROM Mentee WHERE id = @mentee_id");
  //     return result.recordset[0]; // Trả về thông tin của mentor
  //   } catch (error) {
  //     throw new Error("Error fetching mentee info: " + error.message);
  //   }
  // }

  static async getMenteeInfo(menteeId) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("mentee_id", sql.Int, menteeId)
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
      throw new Error("Error fetching mentee info: " + error.message);
    }
  }
}

module.exports = MentorConnection;
