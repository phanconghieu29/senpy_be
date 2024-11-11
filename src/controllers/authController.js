const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sql, poolPromise } = require("../config/db");

async function loginUser(req, res) {
  const { email, password } = req.body;

  try {
    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("email", sql.NVarChar, email)
      .query("SELECT * FROM Users WHERE email = @email");

    const user = result.recordset[0];

    if (!user) {
      return res.status(404).json({ message: "Tài khoản không tồn tại" });
    }

    // Kiểm tra mật khẩu
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Sai mật khẩu" });
    }

    // Kiểm tra trạng thái người dùng
    if (user.status !== "active") {
      return res
        .status(403)
        .json({ message: "Tài khoản của bạn không còn hoạt động" });
    }

    // Lấy thêm thông tin dựa trên vai trò của người dùng
    let additionalInfo = null;

    if (user.role === "mentor") {
      // Lấy thông tin từ bảng Mentor nếu là Mentor
      const mentorResult = await pool
        .request()
        .input("user_id", sql.Int, user.user_id)
        .query("SELECT * FROM Mentor WHERE user_id = @user_id");

      additionalInfo = mentorResult.recordset[0];
    } else if (user.role === "mentee") {
      // Lấy thông tin từ bảng Mentee nếu là Mentee
      const menteeResult = await pool
        .request()
        .input("user_id", sql.Int, user.user_id)
        .query("SELECT * FROM Mentee WHERE user_id = @user_id");

      additionalInfo = menteeResult.recordset[0];
    }

    // Tạo JWT token
    const token = jwt.sign(
      {
        id: user.user_id,
        role: user.role,
        torteeId: additionalInfo ? additionalInfo.id : null,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" } // Token có hiệu lực trong 1 giờ
    );

    // Trả về thông tin đăng nhập thành công kèm theo token và thông tin người dùng
    res.status(200).json({
      message: "Đăng nhập thành công",
      token,
      user: {
        id: user.user_id,
        email: user.email,
        name: user.name,
        role: user.role,
        gender: user.gender,
        phone: user.phone,
        facebook_link: user.facebook_link,
        avatar: user.avatar,
        created_at: user.created_at,
        additionalInfo, // Thông tin từ Mentor hoặc Mentee
      },
    });
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
}

module.exports = { loginUser };
