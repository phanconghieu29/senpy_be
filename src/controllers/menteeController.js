const bcrypt = require("bcrypt");
const { createUser } = require("../models/User");
const { createMentee } = require("../models/Mentee");
const { Mentee } = require("../models/Mentee");
const { User }= require("../models/User");

const getMentees = async (req, res) => {
  try {
    const mentees = await User.find({ role: "mentee" }).select("-password");
    res.status(200).json({ mentees });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách mentees:", error);
    res.status(500).json({ message: "Lỗi máy chủ, thử lại sau!" });
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

    // Tạo user mới
    const newUser = new User({
      name,
      gender,
      email,
      phone,
      facebook_link,
      password: hashedPassword,
      role: "mentee",
      avatar: null,
      status: "Chờ duyệt",
    });

    const savedUser = await newUser.save();

    // Tạo mentee mới
    const newMentee = new Mentee({
      user_id: savedUser._id,
      year_in_school,
      major,
      strengths,
      weaknesses,
      goals,
      mentoring_expectations,
    });

    await newMentee.save();

    res.status(200).json({ message: "Đăng ký mentee thành công!" });
  } catch (error) {
    console.error("Error registering mentee:", error);
    res.status(500).json({ message: "Đăng ký không thành công." });
  }
};

const approveMentee = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Kiểm tra xem user có phải là mentee không
    const mentee = await User.findOneAndUpdate(
      { _id: id, role: "mentee" }, // Chỉ cập nhật nếu role là mentee
      { status: "Đã kích hoạt" },
      { new: true }
    );

    if (!mentee) {
      return res.status(404).json({ message: "Mentee không tồn tại hoặc không hợp lệ!" });
    }

    res.status(200).json({ message: "Mentee approved successfully", mentee });
  } catch (error) {
    console.error("Error approving mentee:", error);
    res.status(500).json({ message: "Error approving mentee" });
  }
};

const rejectMentee = async (req, res) => {
  try {
    const { id } = req.params;

    // Kiểm tra xem user có phải là mentee không
    const mentee = await User.findOne({ _id: id, role: "mentee" });
    if (!mentee) {
      return res.status(404).json({ message: "Mentee không tồn tại hoặc không hợp lệ!" });
    }

    // Xóa mentee khỏi DB
    await User.findByIdAndDelete(id);
    res.status(200).json({ message: "Mentee rejected and data removed." });
  } catch (error) {
    console.error("Error rejecting mentee:", error);
    res.status(500).json({ message: "Error rejecting mentee." });
  }
};

module.exports = { registerMentee, getMentees, approveMentee, rejectMentee };
