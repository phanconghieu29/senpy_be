const mongoose = require("mongoose");

const CookieSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      description: "Mã định danh duy nhất cho phiên làm việc của người dùng.",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      description:
        "ID của người dùng nếu đã đăng nhập. Nếu là khách, trường này có thể null.",
    },
    role: {
      type: String,
      enum: ["admin", "user", "mentor", "mentee", "guest"],
      required: true,
      description: "Vai trò của người dùng trên hệ thống.",
    },
    expiresAt: {
      type: Date,
      required: true,
      description: "Thời gian hết hạn của cookie (ISO 8601).",
    },
    authToken: {
      type: String,
      description:
        "Mã thông báo xác thực (JWT token hoặc access token) để xác thực phiên làm việc.",
    },
    userInfo: {
      name: { type: String, description: "Tên đầy đủ của người dùng." },
      email: {
        type: String,
        match: /.+\@.+\..+/,
        description: "Email của người dùng (nếu có).",
      },
      profilePicture: {
        type: String,
        description: "URL của ảnh đại diện người dùng.",
      },
      mentorSpecialization: {
        type: String,
        description:
          "Chuyên môn của mentor (chỉ áp dụng với người dùng có vai trò mentor).",
      },
    },
    preferences: {
      theme: {
        type: String,
        enum: ["light", "dark"],
        description: "Chế độ giao diện của người dùng (sáng hoặc tối).",
      },
      language: {
        type: String,
        default: "en",
        description:
          "Ngôn ngữ của người dùng (mã ISO 639-1, ví dụ: 'en', 'vi').",
      },
    },
    mentorData: {
      activeSessions: {
        type: Number,
        description: "Số lượng buổi tư vấn hiện tại của mentor.",
      },
      rating: {
        type: Number,
        min: 0,
        max: 5,
        description: "Đánh giá trung bình của mentor.",
      },
    },
    menteeData: {
      currentMentor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        description: "ID của mentor hiện tại mà mentee đang được tư vấn.",
      },
      sessionCount: {
        type: Number,
        description: "Số lượng buổi đã tham gia của mentee.",
      },
    },
    deviceInfo: {
      deviceType: {
        type: String,
        description: "Loại thiết bị đang sử dụng (mobile, desktop, tablet).",
      },
      os: { type: String, description: "Hệ điều hành của thiết bị." },
      browser: {
        type: String,
        description: "Trình duyệt người dùng đang sử dụng.",
      },
      ipAddress: { type: String, description: "Địa chỉ IP của người dùng." },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Cookie", CookieSchema);
