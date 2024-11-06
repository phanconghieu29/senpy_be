const { poolPromise } = require("../config/db");
const bcrypt = require("bcrypt");
const { createUser } = require("../models/User");
const { createMentee } = require("../models/Mentee");

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
      status: "active",
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

module.exports = { registerMentee };
