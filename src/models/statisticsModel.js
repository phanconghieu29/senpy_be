const { poolPromise } = require("../config/db");

exports.fetchStatistics = async () => {
  const pool = await poolPromise;
  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;

  const queries = {
    currentYearStats: `
            SELECT
                (SELECT COUNT(*) FROM MentorConnections WHERE status = N'Đã kết nối' AND YEAR(request_date) = ${currentYear}) AS successfulConnections,
                (SELECT COUNT(*) FROM Mentor WHERE YEAR((SELECT created_at FROM Users WHERE Users.user_id = Mentor.user_id)) = ${currentYear}) AS mentors,
                (SELECT COUNT(*) FROM Mentee WHERE YEAR((SELECT created_at FROM Users WHERE Users.user_id = Mentee.user_id)) = ${currentYear}) AS mentees,
                (SELECT COUNT(*) FROM SessionSummaries WHERE YEAR(report_date) = ${currentYear}) AS news
            `,
    previousYearStats: `
            SELECT
                (SELECT COUNT(*) FROM MentorConnections WHERE status = N'Đã kết nối' AND YEAR(request_date) = ${previousYear}) AS successfulConnections,
                (SELECT COUNT(*) FROM Mentor WHERE YEAR((SELECT created_at FROM Users WHERE Users.user_id = Mentor.user_id)) = ${previousYear}) AS mentors,
                (SELECT COUNT(*) FROM Mentee WHERE YEAR((SELECT created_at FROM Users WHERE Users.user_id = Mentee.user_id)) = ${previousYear}) AS mentees,
                (SELECT COUNT(*) FROM SessionSummaries WHERE YEAR(report_date) = ${previousYear}) AS news
            `,
  };

  const currentYearStats = (
    await pool.request().query(queries.currentYearStats)
  ).recordset[0];
  const previousYearStats = (
    await pool.request().query(queries.previousYearStats)
  ).recordset[0];

  return { currentYearStats, previousYearStats };
};

exports.fetchMonthlyArticleStatistics = async () => {
  const pool = await poolPromise;
  const query = `
      SELECT 
          MONTH(report_date) AS month,
          COUNT(*) AS article_count
      FROM SessionSummaries
      WHERE YEAR(report_date) = YEAR(GETDATE())
      GROUP BY MONTH(report_date)
      ORDER BY month;
  `;

  const result = await pool.request().query(query);
  return result.recordset;
};
