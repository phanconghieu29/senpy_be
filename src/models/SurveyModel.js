const { sql, poolPromise } = require('../config/db');

const createSurvey = async (surveyData) => {
  const pool = await poolPromise;
  try {
    console.log('Survey data:', surveyData); // Kiểm tra dữ liệu được gửi đi

    const result = await pool.request()
      .input('mentor_id', sql.Int, surveyData.mentor_id)
      .input('mentee_id', sql.Int, surveyData.mentee_id)
      .input('quality_score', sql.Int, surveyData.quality_score)
      .input('collaboration_score', sql.Int, surveyData.collaboration_score)
      .input('effectiveness_score', sql.Int, surveyData.effectiveness_score)
      .input('comments', sql.NText, surveyData.comments)
      .query(`
        INSERT INTO Feedback (mentor_id, mentee_id, quality_score, collaboration_score, effectiveness_score, comments)
        VALUES (@mentor_id, @mentee_id, @quality_score, @collaboration_score, @effectiveness_score, @comments)
      `);

    console.log('Query result:', result); // Kiểm tra kết quả truy vấn
    return result;
  } catch (error) {
    console.error('Error saving survey:', error.message); // In ra lỗi nếu có
    throw error;
  }
};


const getAllSurveys = async () => {
  const pool = await poolPromise;
  try {
    const result = await pool.request().query(`
      SELECT 
        f.feedback_id,
        u1.name AS mentor_name, -- Lấy tên của mentor
        u2.name AS mentee_name, -- Lấy tên của mentee
        f.quality_score,
        f.collaboration_score,
        f.effectiveness_score,
        f.comments,
        f.feedback_date
      FROM Feedback f
      JOIN Mentor m ON f.mentor_id = m.id
      JOIN Users u1 ON m.user_id = u1.user_id -- Kết nối để lấy tên mentor
      JOIN Mentee me ON f.mentee_id = me.id
      JOIN Users u2 ON me.user_id = u2.user_id -- Kết nối để lấy tên mentee
    `);

    return result.recordset; // Trả về danh sách feedbacks
  } catch (error) {
    console.error("Error fetching surveys:", error.message);
    throw error;
  }
};

module.exports = {
  createSurvey,
  getAllSurveys, 
};