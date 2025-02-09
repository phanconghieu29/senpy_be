const { sql, poolPromise } = require("../config/db");
const bcrypt = require("bcrypt");
const { User, createUser } = require("../models/User");

const getUsers = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
        select * from users where role = 'admin'
      `);
    res.json(result.recordset);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách người dùng:", error);
    res.status(500).json({ message: "Không thể lấy danh sách người dùng" });
  }
};

// const registerUser = async (req, res) => {
//   try {
//     const { name, gender, email, phone, facebook_link } = req.body;

//     // Default password is phone number
//     const password = phone;

//     // Mã hóa mật khẩu
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Insert into Users table
//     await createUser({
//       name,
//       gender,
//       email,
//       phone,
//       facebook_link,
//       password: hashedPassword,
//       role: "admin",
//       avatar: null,
//       status: "active",
//     });

//     res.status(200).json({ message: "Đăng ký người dùng thành công!" });
//   } catch (error) {
//     console.error("Lỗi khi đăng ký người dùng:", error);
//     res.status(500).json({ message: "Đăng ký không thành công." });
//   }
// };

const registerUser = async (req, res) => {
  try {
    const { name, gender, email, phone, password, role, profile } = req.body;

    // Kiểm tra role hợp lệ
    if (!["mentor", "mentee"].includes(role)) {
      return res.status(400).json({ message: "Vai trò không hợp lệ!" });
    }

    // Kiểm tra email đã tồn tại chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email đã được sử dụng!" });
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo object chứa thông tin profile
    const profileData =
      role === "mentor" ? { mentor_details: profile } : { mentee_details: profile };

    // Tạo user mới
    const newUser = new User({
      name,
      gender,
      email,
      phone,
      password: hashedPassword,
      role,
      status: "pending", // Chờ admin duyệt
      ...profileData, // Lưu thông tin vào đúng schema
    });

    // Lưu user vào database
    await newUser.save();

    // Trả về kết quả (ẩn mật khẩu)
    res.status(201).json({
      message: "Đăng ký thành công! Vui lòng chờ admin duyệt.",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
        profile: profile,
      },
    });
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    res.status(500).json({ message: "Lỗi máy chủ, thử lại sau!" });
  }
};

const getUserById = async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    if (isNaN(userId)) {
      return res.status(400).json({ error: "ID người dùng không hợp lệ" });
    }

    const user = await User.getUserById(userId);
    res.status(200).json(user);
  } catch (error) {
    console.error("Lỗi khi lấy thông tin người dùng:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  registerUser,
  getUsers,
  getUserById,
};
