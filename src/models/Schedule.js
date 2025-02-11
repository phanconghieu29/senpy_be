const mongoose = require("mongoose");

// Định nghĩa Schema cho Schedule
const scheduleSchema = new mongoose.Schema({
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
  scheduled_time: { type: Date, required: true },
  status: {
    type: String,
    enum: ["scheduled", "completed", "canceled"],
    required: true,
  },
  title: { type: String, required: true },
  location: { type: String },
  reason_for_cancel: { type: String },
  created_at: { type: Date, default: Date.now },
});

const Schedule = mongoose.model("Schedule", scheduleSchema);

// Hàm lấy danh sách lịch (getSchedules)
const getSchedules = async () => {
  try {
    const schedules = await Schedule.find()
      .populate("mentor_id", "name")
      .populate("mentee_id", "name");
    return schedules;
  } catch (error) {
    console.error("Lỗi khi tải lịch trình:", error);
    throw new Error("Failed to get schedules");
  }
};

// Hàm lấy danh sách lịch dựa trên vai trò và torteeId (getSchedulesByRole)
const getSchedulesByRole = async (role, torteeId) => {
  try {
    let filter = {};
    if (role === "mentor") {
      filter = { mentor_id: torteeId };
    } else if (role === "mentee") {
      filter = { mentee_id: torteeId };
    }

    const schedules = await Schedule.find(filter)
      .populate("mentor_id", "name")
      .populate("mentee_id", "name");
    return schedules;
  } catch (error) {
    console.error("Lỗi khi tìm lịch trình theo vai trò:", error);
    throw new Error("Failed to get schedules by role");
  }
};

// Hàm thêm lịch mới (addSchedule)
const addSchedule = async (schedule) => {
  try {
    const {
      mentee_id,
      scheduled_time,
      status,
      title,
      location,
      reason_for_cancel,
    } = schedule;

    // Kiểm tra kết nối với Mentor (giả định có collection MentorConnections)
    const connection = await mongoose.model("MentorConnection").findOne({
      mentee_id,
      status: "Đã kết nối",
    });

    if (!connection || !connection.mentor_id) {
      throw new Error(
        "Không tìm thấy kết nối được chấp thuận cho mentee đã cho."
      );
    }

    const newSchedule = new Schedule({
      mentor_id: connection.mentor_id,
      mentee_id,
      scheduled_time,
      status,
      title,
      location,
      reason_for_cancel,
    });

    const result = await newSchedule.save();
    return result;
  } catch (error) {
    console.error("Lỗi khi thêm lịch:", error);
    throw new Error("Failed to add schedule");
  }
};

// Hàm cập nhật trạng thái lịch (updateStatus)
const updateStatus = async (scheduleId, status) => {
  try {
    const result = await Schedule.findByIdAndUpdate(
      scheduleId,
      { status },
      { new: true }
    );
    if (!result) {
      throw new Error("Lịch không tồn tại");
    }
    return result;
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái lịch:", error);
    throw new Error("Failed to update schedule status");
  }
};

// Hàm xóa lịch (deleteSchedule)
const deleteSchedule = async (scheduleId) => {
  try {
    const result = await Schedule.findByIdAndDelete(scheduleId);
    if (!result) {
      throw new Error("Lịch không tồn tại");
    }
    return result;
  } catch (error) {
    console.error("Lỗi khi xóa lịch:", error);
    throw new Error("Failed to delete schedule");
  }
};

// Hàm lấy danh sách lịch có thứ tự cho mentee (getOrderedSchedulesForMentee)
const getOrderedSchedulesForMentee = async (menteeId) => {
  try {
    const schedules = await Schedule.aggregate([
      {
        $match: {
          mentee_id: mongoose.Types.ObjectId(menteeId),
          status: "scheduled",
        },
      },
      {
        $lookup: {
          from: "sessionsummaries",
          localField: "_id",
          foreignField: "schedule_id",
          as: "summary",
        },
      },
      {
        $addFields: {
          meeting_order: { $rowNumber: {} }, // Thêm thứ tự (meeting_order)
          has_report: { $cond: [{ $size: "$summary" }, true, false] },
        },
      },
      { $sort: { scheduled_time: 1 } },
    ]);
    return schedules;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách lịch trình có thứ tự:", error);
    throw new Error("Failed to get ordered schedules for mentee");
  }
};

module.exports = {
  getSchedules,
  getSchedulesByRole,
  addSchedule,
  updateStatus,
  deleteSchedule,
  getOrderedSchedulesForMentee,
};
