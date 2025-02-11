const { sql, poolPromise } = require("../config/db");
const bcrypt = require("bcrypt");
const { createUser } = require("../models/User");
const { createMentor } = require("../models/Mentor");
const { User }= require("../models/User");

const getMentors = async (req, res) => {
  try {
    const mentors = await User.find({ role: "mentor" }).select("-password");
    res.status(200).json({ mentors });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách mentors:", error);
    res.status(500).json({ message: "Lỗi máy chủ, thử lại sau!" });
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
      status: "Chờ duyệt",
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
                AND status IN (N'Chờ mentor', N'Chờ BĐH')
          `);

    if (existingConnection.recordset[0].connectionExists > 0) {
      // Nếu đã có kết nối, trả về thông báo
      return res.status(400).json({
        message: "Bạn đã có yêu cầu kết nối với mentor này đang chờ xử lý",
      });
    }

    const menteeConnectedCheck = await pool
      .request()
      .input("mentee_id", sql.Int, mentee_id)
      .query(`
        SELECT COUNT(*) AS menteeHasConnection 
        FROM MentorConnections 
        WHERE mentee_id = @mentee_id 
          AND status = N'Đã kết nối'
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
                AND status = N'Đã kết nối'
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
              WHERE mentee_id = @mentee_id AND status = N'Chờ mentor'
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
              VALUES (@mentee_id, @mentor_id, @introduction, N'Chờ mentor', GETDATE())
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
  try {
    const { id } = req.params;
    
    // Kiểm tra xem user có phải là mentor không
    const mentor = await User.findOneAndUpdate(
      { _id: id, role: "mentor" }, // Chỉ cập nhật nếu role là mentor
      { status: "Đã kích hoạt" },
      { new: true }
    );

    if (!mentor) {
      return res.status(404).json({ message: "Mentor không tồn tại hoặc không hợp lệ!" });
    }

    res.status(200).json({ message: "Mentor approved successfully", mentor });
  } catch (error) {
    console.error("Error approving mentor:", error);
    res.status(500).json({ message: "Error approving mentor" });
  }
};

const rejectMentor = async (req, res) => {
  try {
    const { id } = req.params;

    // Kiểm tra xem user có phải là mentor không
    const mentor = await User.findOne({ _id: id, role: "mentor" });
    if (!mentor) {
      return res.status(404).json({ message: "Mentor không tồn tại hoặc không hợp lệ!" });
    }

    // Xóa mentor khỏi DB
    await User.findByIdAndDelete(id);
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
