const { poolPromise, sql } = require("../config/db");

// const MentorConnection = {
//   getAllRequestsByMentor: async (mentorId) => {
//     try {
//       const pool = await poolPromise;
//       const result = await pool.request().input("mentorId", sql.Int, mentorId)
//         .query(`
//           SELECT 
//             mc.connection_id,
//             mc.mentee_id,
//             mc.introduction,
//             mc.status,
//             mc.request_date,
//             m.avatar, 
//             m.name AS mentee_name
//           FROM MentorConnections mc
//           JOIN Mentee m ON mc.mentee_id = m.id
//           WHERE mc.mentor_id = @mentorId
//         `);
//       return result.recordset;
//     } catch (err) {
//       console.log("Error fetching connection requests:", err);
//       throw err;
//     }
//   },

//   updateStatus: async (connectionId, status) => {
//     try {
//       const pool = await poolPromise;
//       const result = await pool
//         .request()
//         .input("connectionId", sql.Int, connectionId)
//         .input("status", sql.NVarChar, status).query(`
//           UPDATE MentorConnections
//           SET status = @status, approval_date = GETDATE()
//           WHERE connection_id = @connectionId
//         `);
//       return result.rowsAffected > 0;
//     } catch (err) {
//       console.log("Error updating connection status:", err);
//       throw err;
//     }
//   },
// };

// module.exports = MentorConnection;
const MentorConnection = {
  getAllRequestsByMentor: async (mentorId) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request().input("mentorId", sql.Int, mentorId)
        .query(`
          SELECT 
            mc.connection_id,
            mc.mentee_id,
            mc.introduction,
            mc.status,
            mc.request_date,
            u.avatar, 
            u.name AS mentee_name
          FROM MentorConnections mc
          JOIN Mentee m ON mc.mentee_id = m.id
          JOIN Users u ON m.user_id = u.user_id
          WHERE mc.mentor_id = @mentorId
        `);
      return result.recordset;
    } catch (err) {
      console.log("Error fetching connection requests:", err);
      throw err;
    }
  },

  updateStatus: async (connectionId, status) => {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("connectionId", sql.Int, connectionId)
        .input("status", sql.NVarChar, status)
        .query(`
          UPDATE MentorConnections
          SET status = @status, approval_date = GETDATE()
          WHERE connection_id = @connectionId
        `);
      return result.rowsAffected > 0;
    } catch (err) {
      console.log("Error updating connection status:", err);
      throw err;
    }
  },
};

module.exports = MentorConnection;

