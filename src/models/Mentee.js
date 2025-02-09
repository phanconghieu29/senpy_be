const mongoose = require("mongoose");

const MenteeSchema = new mongoose.Schema(
  {
    user_id: {
      type: Number,
      required: true,
    },
    full_name: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      required: true,
    },
    email: {
      type: String,
      required: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    facebook_link: {
      type: String,
      match: [
        /^https?:\/\/(www\.)?facebook\.com\/[A-Za-z0-9_.-]+$/,
        "Invalid Facebook URL format",
      ],
    },
    year_in_school: {
      type: String,
      required: true,
    },
    major: {
      type: String,
      required: true,
    },
    strengths: {
      type: String,
    },
    weaknesses: {
      type: String,
    },
    goals: {
      type: String,
    },
    mentoring_expectations: {
      type: String,
    },
    mentoring_activity_desires: {
      type: String,
    },
  },
  { timestamps: true }
); // Thêm timestamps để tự động lưu createdAt và updatedAt

const Mentee = mongoose.model("Mentee", MenteeSchema);

async function createMentee(menteeData) {
  try {
    const mentee = new Mentee(menteeData);
    const savedMentee = await mentee.save();
    return savedMentee;
  } catch (error) {
    console.error("Error creating mentee:", error);
    throw error;
  }
}

module.exports = { Mentee, createMentee };