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

const registerUser = async (req, res) => {
  try {
    const { name, gender, email, phone, facebook_link } = req.body;

    // Default password is phone number
    const password = phone;

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert into Users table
    await createUser({
      name,
      gender,
      email,
      phone,
      facebook_link,
      password: hashedPassword,
      role: "admin",
      avatar: null,
      status: "active",
    });

    res.status(200).json({ message: "Đăng ký người dùng thành công!" });
  } catch (error) {
    console.error("Lỗi khi đăng ký người dùng:", error);
    res.status(500).json({ message: "Đăng ký không thành công." });
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
