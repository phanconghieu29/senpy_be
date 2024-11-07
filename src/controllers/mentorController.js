const { sql, poolPromise} = require("../config/db");
const bcrypt = require("bcrypt");
const { createUser } = require("../models/User");
const { createMentor } = require("../models/Mentor");

const getMentors = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 
        u.user_id AS id,
        u.name,
        u.gender,
        u.email,
        u.phone,
        u.facebook_link,
        u.status,
        m.id as mentorID,
        m.expertise,
        m.strengths,
        m.weaknesses,
        m.goals,
        m.mentoring_expectations,
        m.reason_for_mentoring
      FROM 
        Users u
      INNER JOIN 
        Mentor m ON u.user_id = m.user_id
      WHERE 
        u.role = 'mentor'
    `);
    res.json(result.recordset);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách mentor:", error);
    res.status(500).json({ message: "Không thể lấy danh sách mentor" });
  }
};

const registerMentor = async (req, res) => {
  try {
    const {
      name,
      gender,
      email,
      phone,
      facebook_link,
      expertise,
      strengths,
      weaknesses,
      goals,
      mentoring_expectations,
      reason_for_mentoring,
    } = req.body;

    // Default password is phone number
    const password = phone;

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert into Users table
    const user_id = await createUser({
      name,
      gender,
      email,
      phone,
      facebook_link,
      password: hashedPassword,
      role: "mentor",
      avatar: null,
      status: "active",
    });

    // Insert into Mentor table
    await createMentor({
      user_id,
      expertise,
      strengths,
      weaknesses,
      goals,
      mentoring_expectations,
      reason_for_mentoring,
    });

    res.status(200).json({ message: "Đăng ký mentor thành công!" });
  } catch (error) {
    console.error("Error registering mentor:", error);
    res.status(500).json({ message: "Đăng ký không thành công." });
  }
};

const addConnection = async (req, res) => {
  try {
    const { mentee_id, mentor_id, introduction } = req.body;

    const pool = await poolPromise;
    await pool.request()
      .input('mentee_id', sql.Int, mentee_id)
      .input('mentor_id', sql.Int, mentor_id)
      .input('introduction', sql.NVarChar, introduction)
      .input('status', sql.NVarChar, 'pending')
      .query(`
        INSERT INTO MentorConnections (mentee_id, mentor_id, introduction, status)
        VALUES (@mentee_id, @mentor_id, @introduction, @status)
      `);

    res.status(201).json({ message: 'Connection request sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const approveMentor = async (req, res) => {
  const mentorId = req.params.mentorId;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input("mentorId", sql.Int, mentorId)
      .query(`UPDATE Users SET status = 'active' WHERE user_id = @mentorId`);

    res.status(200).json({ message: "Mentor approved successfully" });
  } catch (error) {
    console.error("Error approving mentor:", error);
    res.status(500).json({ message: "Error approving mentor" });
  }
};

module.exports = { getMentors, registerMentor, addConnection, approveMentor };