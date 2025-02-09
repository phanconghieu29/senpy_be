const mongoose = require("mongoose");

const mentorConnectionSchema = new mongoose.Schema({
  mentor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Mentor",
    required: true,
  },
  mentee_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Mentee",
    required: true,
  },
  introduction: { type: String, required: true },
  status: {
    type: String,
    enum: ["Chờ mentor", "Chờ BĐH", "Đã kết nối", "Từ chối bởi BĐH"],
    default: "Chờ mentor",
  },
  request_date: { type: Date, default: Date.now },
  approval_date: { type: Date },
});

module.exports = mongoose.model("MentorConnection", mentorConnectionSchema);
const MentorConnection = require("../models/MentorConnection");
const Mentor = require("../models/Mentor");
const Mentee = require("../models/Mentee");
const User = require("../models/User");

class MentorConnectionModel {
  // Lấy danh sách yêu cầu từ mentee
  static async getMenteeRequests(menteeId) {
    try {
      return await MentorConnection.find({ mentee_id: menteeId })
        .populate({
          path: "mentor_id",
          populate: { path: "user_id", select: "name" },
        })
        .sort({
          status: {
            $case: [
              { $eq: ["$status", "Chờ mentor"], then: 1 },
              { $eq: ["$status", "Chờ BĐH"], then: 2 },
            ],
          },
          request_date: -1,
        });
    } catch (error) {
      throw new Error("Lỗi khi tìm kiếm yêu cầu của mentee: " + error.message);
    }
  }

  // Lấy danh sách yêu cầu từ mentor
  static async getMentorRequests(mentorId) {
    try {
      return await MentorConnection.find({ mentor_id: mentorId })
        .populate({
          path: "mentee_id",
          populate: { path: "user_id", select: "name" },
        })
        .sort({
          status: {
            $case: [
              { $eq: ["$status", "Chờ mentor"], then: 1 },
              { $eq: ["$status", "Chờ BĐH"], then: 2 },
            ],
          },
          request_date: -1,
        });
    } catch (error) {
      throw new Error("Lỗi khi tìm kiếm yêu cầu của mentor: " + error.message);
    }
  }

  // Hủy yêu cầu kết nối
  static async cancelRequest(connectionId) {
    try {
      const result = await MentorConnection.findByIdAndDelete(connectionId);
      return result !== null;
    } catch (error) {
      throw new Error("Lỗi khi hủy yêu cầu: " + error.message);
    }
  }

  // Cập nhật trạng thái yêu cầu kết nối
  static async updateRequestStatus(connectionId, status) {
    try {
      const result = await MentorConnection.findByIdAndUpdate(
        connectionId,
        { status },
        { new: true }
      );
      return result !== null;
    } catch (error) {
      throw new Error(
        "Lỗi khi cập nhật trạng thái yêu cầu kết nối: " + error.message
      );
    }
  }

  // Lấy các yêu cầu đã được duyệt và chờ BĐH
  static async getApprovedRequests() {
    try {
      return await MentorConnection.find({
        status: { $in: ["Chờ BĐH", "Đã kết nối", "Từ chối bởi BĐH"] },
      })
        .populate("mentee_id", "user_id")
        .populate("mentor_id", "user_id")
        .sort({
          status: {
            $case: [
              { $eq: ["$status", "Chờ BĐH"], then: 1 },
              { $eq: ["$status", "Đã kết nối"], then: 2 },
            ],
          },
          request_date: -1,
        });
    } catch (error) {
      throw new Error(
        "Lỗi khi tìm kiếm yêu cầu đã được chấp thuận cho quản trị viên: " +
          error.message
      );
    }
  }

  // Duyệt yêu cầu kết nối và từ chối các yêu cầu khác
  static async approveConnection(connectionId, mentorId, menteeId) {
    try {
      const connection = await MentorConnection.findById(connectionId);
      if (!connection) throw new Error("Không tìm thấy kết nối để cập nhật");

      // Cập nhật trạng thái thành "Đã kết nối"
      connection.status = "Đã kết nối";
      await connection.save();

      // Từ chối các yêu cầu còn lại
      await MentorConnection.updateMany(
        {
          $or: [{ mentor_id: mentorId }, { mentee_id: menteeId }],
          status: { $in: ["Chờ mentor", "Chờ BĐH"] },
          _id: { $ne: connectionId },
        },
        { status: "Từ chối bởi BĐH" }
      );

      return true;
    } catch (error) {
      throw new Error("Lỗi khi chấp thuận kết nối: " + error.message);
    }
  }

  // Lấy thông tin mentor
  static async getMentorInfo(mentorId) {
    try {
      return await Mentor.findById(mentorId).populate("user_id", "name");
    } catch (error) {
      throw new Error("Lỗi khi tìm thông tin mentor: " + error.message);
    }
  }

  // Lấy thông tin mentee
  static async getMenteeInfo(menteeId) {
    try {
      return await Mentee.findById(menteeId).populate("user_id", "name");
    } catch (error) {
      throw new Error("Lỗi khi tìm thông tin mentee: " + error.message);
    }
  }
}

module.exports = MentorConnectionModel;
