const { sql, poolPromise } = require("../config/db");
const bcrypt = require("bcrypt");
const { createUser } = require("../models/User");

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
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Đăng ký không thành công." });
  }
};

module.exports = {
  registerUser,
  getUsers
};
