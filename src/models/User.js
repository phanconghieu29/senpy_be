const mongoose = require("mongoose");

const EventDetailsSchema = new mongoose.Schema({
  username_or_email: {
    type: String,
    required: true,
    description: "Tên tài khoản hoặc email dùng để đăng nhập",
  },
  status: {
    type: String,
    enum: ["success", "failed"],
    required: true,
    description: "Trạng thái đăng nhập",
  },
  reason: {
    type: String,
    default: null,
    description: "Lý do thất bại nếu đăng nhập không thành công",
  },
});

const LoginSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.Mixed, // Có thể là Integer hoặc null
      default: null,
      description:
        "ID của người dùng (null nếu chưa đăng ký hoặc chưa xác định)",
    },
    session_id: {
      type: String,
      required: true,
      description:
        "Mã phiên đăng nhập, dùng để theo dõi liên tục các sự kiện trong một phiên",
    },
    ip_address: {
      type: String,
      required: true,
      description: "Địa chỉ IP của người dùng",
    },
    user_agent: {
      type: String,
      required: true,
      description: "Thông tin user agent của trình duyệt hoặc thiết bị",
    },
    timestamp: {
      type: Date,
      default: Date.now,
      description: "Thời gian sự kiện xảy ra",
    },
    event_type: {
      type: String,
      enum: ["login"],
      required: true,
      description: "Loại sự kiện: ở đây chỉ là login",
    },
    event_details: EventDetailsSchema, // Chi tiết sự kiện login
  },
  { timestamps: true } // Tự động thêm createdAt và updatedAt
);

module.exports = mongoose.model("LoginEvent", LoginSchema);
