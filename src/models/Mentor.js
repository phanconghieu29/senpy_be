const mongoose = require("mongoose");

const MentorSchema = new mongoose.Schema(
  {
    user_id: {
      type: Number,
      required: true,
    },
    expertise: {
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
    reason_for_mentoring: {
      type: String,
    },
  },
  { timestamps: true }
);

const Mentor = mongoose.model("Mentor", MentorSchema);

async function createMentor(mentorData) {
  try {
    const mentor = new Mentor(mentorData);
    const savedMentor = await mentor.save();
    return savedMentor;
  } catch (error) {
    console.error("Error creating mentor:", error);
    throw error;
  }
}

module.exports = { Mentor, createMentor };
