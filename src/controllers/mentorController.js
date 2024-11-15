const { sql, poolPromise } = require("../config/db");
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
      status: "pending",
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
  const { mentee_id, mentor_id, introduction } = req.body;

  try {
    const pool = await poolPromise; // Kết nối tới database

    // Bước 1: Kiểm tra xem mentee đã gửi yêu cầu tới mentor này chưa
    const existingConnection = await pool
      .request()
      .input("mentee_id", sql.Int, mentee_id)
      .input("mentor_id", sql.Int, mentor_id).query(`
              SELECT COUNT(*) AS connectionExists 
              FROM MentorConnections 
              WHERE mentee_id = @mentee_id 
                AND mentor_id = @mentor_id
          `);

    if (existingConnection.recordset[0].connectionExists > 0) {
      // Nếu đã có kết nối, trả về thông báo
      return res.status(400).json({
        message: "Bạn đã yêu cầu kết nối với mentor này rồi",
      });
    }

    const menteeConnectedCheck = await pool
      .request()
      .input("mentee_id", sql.Int, mentee_id)
      .query(`
        SELECT COUNT(*) AS menteeHasConnection 
        FROM MentorConnections 
        WHERE mentee_id = @mentee_id 
          AND status = 'connected'
      `);

    if (menteeConnectedCheck.recordset[0].menteeHasConnection > 0) {
      // If the mentee already has an active connection, return a message
      return res.status(400).json({
        message: "Bạn đã có mentor rồi.",
      });
    }

    //Kiểm tra xem mentor đã có người kết nối chưa
    const mentorConnectionCheck = await pool
      .request()
      .input("mentor_id", sql.Int, mentor_id).query(`
              SELECT COUNT(*) AS mentorHasConnection
              FROM MentorConnections 
              WHERE mentor_id = @mentor_id 
                AND status = 'connected'
          `);

    if (mentorConnectionCheck.recordset[0].mentorHasConnection > 0) {
      // Nếu mentor đã có người kết nối, trả về thông báo
      return res.status(400).json({
        message: "Mentor này đã có người kết nối, bạn không thể gửi yêu cầu nữa.",
      });
    }

    // Bước 2: Kiểm tra số lượng yêu cầu `pending` hiện tại của mentee
    const checkRequestCount = await pool
      .request()
      .input("mentee_id", sql.Int, mentee_id).query(`
              SELECT COUNT(*) AS requestCount 
              FROM MentorConnections 
              WHERE mentee_id = @mentee_id AND status = 'pending'
          `);

    const requestCount = checkRequestCount.recordset[0].requestCount;

    // Nếu đã đủ 3 yêu cầu `pending`, trả về lỗi
    if (requestCount >= 3) {
      return res.status(400).json({
        message: "Bạn chỉ được phép gửi tối đa 3 yêu cầu kết nối.",
      });
    }

    // Bước 3: Nếu chưa đạt giới hạn và chưa có yêu cầu trùng lặp, thêm yêu cầu mới vào MentorConnections
    await pool
      .request()
      .input("mentee_id", sql.Int, mentee_id)
      .input("mentor_id", sql.Int, mentor_id)
      .input("introduction", sql.NVarChar, introduction).query(`
              INSERT INTO MentorConnections (mentee_id, mentor_id, introduction, status, request_date)
              VALUES (@mentee_id, @mentor_id, @introduction, 'pending', GETDATE())
          `);

    res
      .status(201)
      .json({ message: "Yêu cầu kết nối đã được gửi thành công." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Đã xảy ra lỗi khi gửi yêu cầu kết nối." });
  }
};

const approveMentor = async (req, res) => {
  const mentorId = req.params.mentorId;
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input("mentorId", sql.Int, mentorId)
      .query(`UPDATE Users SET status = 'active' WHERE user_id = @mentorId`);

    res.status(200).json({ message: "Mentor approved successfully" });
  } catch (error) {
    console.error("Error approving mentor:", error);
    res.status(500).json({ message: "Error approving mentor" });
  }
};

const rejectMentor = async (req, res) => {
  const mentorId = req.params.mentorId;

  try {
    const pool = await poolPromise;

    // Delete mentor-specific data from the Mentor table
    await pool
      .request()
      .input("mentorId", sql.Int, mentorId)
      .query(`DELETE FROM Mentor WHERE user_id = @mentorId`);

    // Delete user data from the Users table
    await pool
      .request()
      .input("mentorId", sql.Int, mentorId)
      .query(`DELETE FROM Users WHERE user_id = @mentorId`);

    res.status(200).json({ message: "Mentor rejected and data removed." });
  } catch (error) {
    console.error("Error rejecting mentor:", error);
    res.status(500).json({ message: "Error rejecting mentor." });
  }
};

module.exports = {
  getMentors,
  registerMentor,
  addConnection,
  approveMentor,
  rejectMentor,
};
