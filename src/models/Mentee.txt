const { sql, poolPromise } = require('../config/db');

class Mentee {
  constructor(user_id, year_in_school, major, strengths, weaknesses, goals, mentoring_expectations) {
    this.user_id = user_id;
    this.year_in_school = year_in_school;
    this.major = major;
    this.strengths = strengths;
    this.weaknesses = weaknesses;
    this.goals = goals;
    this.mentoring_expectations = mentoring_expectations;
  }
}

async function createMentee(menteeData) {
  const pool = await poolPromise;
  await pool.request()
    .input('user_id', sql.Int, menteeData.user_id)
    .input('year_in_school', sql.NVarChar, menteeData.year_in_school)
    .input('major', sql.NVarChar, menteeData.major)
    .input('strengths', sql.NText, menteeData.strengths)
    .input('weaknesses', sql.NText, menteeData.weaknesses)
    .input('goals', sql.NText, menteeData.goals)
    .input('mentoring_expectations', sql.NText, menteeData.mentoring_expectations)
    .query(`
      INSERT INTO Mentee (user_id, year_in_school, major, strengths, weaknesses, goals, mentoring_expectations)
      VALUES (@user_id, @year_in_school, @major, @strengths, @weaknesses, @goals, @mentoring_expectations)
    `);
}

module.exports = { Mentee, createMentee };
