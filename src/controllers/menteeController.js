const { sql, poolPromise } = require("../config/db");
const bcrypt = require("bcrypt");
const { createUser } = require("../models/User");
const { createMentee } = require("../models/Mentee");

const getMentees = async (req, res) => {
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
        m.id as menteeID,
        m.major,
        m.strengths,
        m.weaknesses,
        m.goals,
        m.mentoring_expectations
      FROM 
        Users u
      INNER JOIN 
        Mentee m ON u.user_id = m.user_id
      WHERE 
        u.role = 'mentee'
    `);
    res.json(result.recordset);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách mentee:", error);
    res.status(500).json({ message: "Không thể lấy danh sách mentee" });
  }
};

const registerMentee = async (req, res) => {
  try {
    const {
      name,
      gender,
      email,
      phone,
      facebook_link,
      year_in_school,
      major,
      strengths,
      weaknesses,
      goals,
      mentoring_expectations,
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
      role: "mentee",
      avatar: null,
      status: "pending",
    });

    // Insert into Mentee table
    await createMentee({
      user_id,
      year_in_school,
      major,
      strengths,
      weaknesses,
      goals,
      mentoring_expectations,
    });

    res.status(200).json({ message: "Đăng ký mentee thành công!" });
  } catch (error) {
    console.error("Error registering mentee:", error);
    res.status(500).json({ message: "Đăng ký không thành công." });
  }
};

const approveMentee = async (req, res) => {
  const menteeId = req.params.menteeId;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input("menteeId", sql.Int, menteeId)
      .query(`UPDATE Users SET status = 'active' WHERE user_id = @menteeId`);

    res.status(200).json({ message: "Mentee approved successfully" });
  } catch (error) {
    console.error("Error approving mentee:", error);
    res.status(500).json({ message: "Error approving mentee" });
  }
};

const rejectMentee = async (req, res) => {
  const menteeId = req.params.menteeId;

  try {
    const pool = await poolPromise;

    // Delete mentee-specific data from the Mentee table
    await pool
      .request()
      .input("menteeId", sql.Int, menteeId)
      .query(`DELETE FROM Mentee WHERE user_id = @menteeId`);

    // Delete user data from the Users table
    await pool
      .request()
      .input("menteeId", sql.Int, menteeId)
      .query(`DELETE FROM Users WHERE user_id = @menteeId`);

    res.status(200).json({ message: "Mentee rejected and data removed." });
  } catch (error) {
    console.error("Error rejecting mentee:", error);
    res.status(500).json({ message: "Error rejecting mentee." });
  }
};

module.exports = { registerMentee, getMentees, approveMentee, rejectMentee };
