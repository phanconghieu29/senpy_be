// models/ReportSession.js
const { sql, poolPromise } = require("../config/db");

const createReportSession = async (data) => {
  const pool = await poolPromise;
  // const query = `
  //   INSERT INTO SessionSummaries (schedule_id, mentor_id, mentee_id, cross_mentor, meeting_number, achieved_results, current_issues, mentor_guidance, next_steps_and_commitments, image, status)
  //   VALUES (@schedule_id, @mentor_id, @mentee_id, @cross_mentor, @meeting_number, @achieved_results, @current_issues, @mentor_guidance, @next_steps_and_commitments, @image, @status)
  // `;
  const query = `
    INSERT INTO SessionSummaries (schedule_id, cross_mentor, meeting_number, achieved_results, current_issues, mentor_guidance, next_steps_and_commitments, image, status)
    VALUES (@schedule_id, @cross_mentor, @meeting_number, @achieved_results, @current_issues, @mentor_guidance, @next_steps_and_commitments, @image, @status)
  `;
  const result = await pool
    .request()
    .input("schedule_id", sql.Int, data.schedule_id)
    // .input('mentor_id', sql.Int, data.mentor_id)
    // .input('mentee_id', sql.Int, data.mentee_id)
    .input("cross_mentor", sql.NVarChar, data.cross_mentor)
    .input("meeting_number", sql.Int, data.meeting_number)
    .input("achieved_results", sql.NText, data.achieved_results)
    .input("current_issues", sql.NText, data.current_issues)
    .input("mentor_guidance", sql.NText, data.mentor_guidance)
    .input(
      "next_steps_and_commitments",
      sql.NText,
      data.next_steps_and_commitments
    )
    .input("image", sql.NVarChar, data.image) // You can store the image URL or base64 encoded string
    .input("status", sql.NVarChar, data.status)
    .query(query);

  return result.recordset;
};


const getAllReports = async () => {
  const pool = await poolPromise;
  const query = `
    SELECT 
      ss.summary_id,
      s.scheduled_time AS scheduled_time,
      u1.name AS mentor_name,
      u2.name AS mentee_name,
      ss.cross_mentor,
      ss.meeting_number,
      FORMAT(ss.report_date, 'yyyy-MM-dd') AS report_date,
      ss.achieved_results,
      ss.current_issues,
      ss.mentor_guidance,
      ss.next_steps_and_commitments,
      ss.image,
      ss.status
    FROM 
      SessionSummaries ss
    LEFT JOIN Schedules s ON ss.schedule_id = s.schedule_id
    LEFT JOIN Mentor m ON s.mentor_id = m.id
    LEFT JOIN Users u1 ON m.user_id = u1.user_id
    LEFT JOIN Mentee me ON s.mentee_id = me.id
    LEFT JOIN Users u2 ON me.user_id = u2.user_id
    ORDER BY ss.report_date DESC
  `;

  try {
    const result = await pool.request().query(query);
    return result.recordset;
  } catch (error) {
    console.error("Error fetching reports:", error);
    throw error;
  }
};

const updateReportStatus = async (id, status) => {
  const pool = await poolPromise;
  const query = `UPDATE SessionSummaries SET status = @status WHERE summary_id = @id`;

  try {
    const result = await pool
      .request()
      .input("status", sql.NVarChar, status)
      .input("id", sql.Int, id)
      .query(query);

    return result.rowsAffected > 0; // Ensure we return a success if the update was successful
  } catch (error) {
    console.error("Error updating status in database:", error);
    throw error;
  }
};


const getReportsByStatus = async (status) => {
  const pool = await poolPromise;
  const query = `
    SELECT 
      ss.summary_id,
      s.scheduled_time AS scheduled_time,
      u1.name AS mentor_name,
      u2.name AS mentee_name,
      ss.cross_mentor,
      ss.meeting_number,
      FORMAT(ss.report_date, 'yyyy-MM-dd') AS report_date,
      ss.achieved_results,
      ss.current_issues,
      ss.mentor_guidance,
      ss.next_steps_and_commitments,
      ss.image,
      ss.status
    FROM 
      SessionSummaries ss
    LEFT JOIN Schedules s ON ss.schedule_id = s.schedule_id
    LEFT JOIN Mentor m ON s.mentor_id = m.id
    LEFT JOIN Users u1 ON m.user_id = u1.user_id
    LEFT JOIN Mentee me ON s.mentee_id = me.id
    LEFT JOIN Users u2 ON me.user_id = u2.user_id
    WHERE ss.status = @status
  `;

  try {
    const result = await pool
      .request()
      .input("status", sql.NVarChar, status)
      .query(query);
    return result.recordset;
  } catch (error) {
    console.error("Error fetching reports by status:", error);
    throw error;
  }
};


const updateReportStatusById = async (id, status) => {
  const pool = await poolPromise;
  const query = `UPDATE SessionSummaries SET status = @status WHERE summary_id = @id`;

  try {
    const result = await pool
      .request()
      .input("status", sql.NVarChar, status)
      .input("id", sql.Int, id)
      .query(query);

    if (result.rowsAffected > 0) {
      console.log("Report status updated successfully");
      return { success: true };
    } else {
      console.error("Report not found");
      throw new Error("Report not found");
    }
  } catch (error) {
    console.error("Error in updateReportStatusById:", error);
    throw new Error("Database operation failed");
  }
};

module.exports = {
  createReportSession,
  getAllReports,
  updateReportStatus,
  getReportsByStatus,
  updateReportStatusById,
};
