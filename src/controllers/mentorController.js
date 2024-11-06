const { sql, poolPromise} = require("../config/db");
const bcrypt = require("bcrypt");
const Mentor = require("../models/Mentor");
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
        u.role = 'mentor' AND u.status = 'active'
    `);
    res.json(result.recordset);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách mentor:", error);
    res.status(500).json({ message: "Không thể lấy danh sách mentor" });
  }
};

// const createMentor = (req, res) => {
//   const {
//     user_id,
//     expertise,
//     strengths,
//     weaknesses,
//     goals,
//     mentoring_expectations,
//     reason_for_mentoring,
//   } = req.body;
//   const mentor = new Mentor(
//     user_id,
//     expertise,
//     strengths,
//     weaknesses,
//     goals,
//     mentoring_expectations,
//     reason_for_mentoring
//   );

//   const query = `INSERT INTO Mentor (user_id, expertise, strengths, weaknesses, goals, mentoring_expectations, reason_for_mentoring) VALUES (?, ?, ?, ?, ?, ?, ?)`;

//   db.query(
//     query,
//     [
//       mentor.user_id,
//       mentor.expertise,
//       mentor.strengths,
//       mentor.weaknesses,
//       mentor.goals,
//       mentor.mentoring_expectations,
//       mentor.reason_for_mentoring,
//     ],
//     (err) => {
//       if (err) {
//         return res
//           .status(500)
//           .json({ message: "Có lỗi xảy ra khi thêm mentor", error: err });
//       }
//       res.status(201).json({ message: "Thêm mentor thành công" });
//     }
//   );
// };

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

module.exports = { getMentors, registerMentor, addConnection };