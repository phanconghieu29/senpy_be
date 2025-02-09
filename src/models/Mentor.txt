const { sql, poolPromise } = require('../config/db');

class Mentor {
  constructor(user_id, expertise, strengths, weaknesses, goals, mentoring_expectations, reason_for_mentoring) {
      this.user_id = user_id;
      this.expertise = expertise;
      this.strengths = strengths;
      this.weaknesses = weaknesses;
      this.goals = goals;
      this.mentoring_expectations = mentoring_expectations;
      this.reason_for_mentoring = reason_for_mentoring;
  }
}

async function createMentor(mentorData) {
  const pool = await poolPromise;
  await pool.request()
    .input('user_id', sql.Int, mentorData.user_id)
    .input('expertise', sql.NVarChar, mentorData.expertise)
    .input('strengths', sql.NText, mentorData.strengths)
    .input('weaknesses', sql.NText, mentorData.weaknesses)
    .input('goals', sql.NText, mentorData.goals)
    .input('mentoring_expectations', sql.NText, mentorData.mentoring_expectations)
    .input('reason_for_mentoring', sql.NText, mentorData.reason_for_mentoring)
    .query(`
      INSERT INTO Mentor (user_id, expertise, strengths, weaknesses, goals, mentoring_expectations, reason_for_mentoring)
      VALUES (@user_id, @expertise, @strengths, @weaknesses, @goals, @mentoring_expectations, @reason_for_mentoring)
    `);
}

module.exports = { Mentor, createMentor };
