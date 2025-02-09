const mongoose = require("mongoose");

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: 255,
    trim: true,
    description: "Tiêu đề của bài viết",
  },
  content: {
    type: String,
    required: true,
    description: "Nội dung chi tiết của bài viết",
  },
  author_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    description: "ID của tác giả bài viết (tham chiếu đến bảng Users)",
  },
  image_url: {
    type: String,
    default: null,
    validate: {
      validator: function (v) {
        return v === null || /^https?:\/\/[^\s]+$/.test(v);
      },
      message: "Đường dẫn hình ảnh không hợp lệ!",
    },
    description: "URL của hình ảnh liên quan đến bài viết",
  },
  post_date: {
    type: Date,
    default: Date.now,
    description: "Ngày đăng bài viết",
  },
});

module.exports = mongoose.model("News", newsSchema);
