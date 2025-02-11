const mongoose = require("mongoose");

// Mentor schema
const MentorSchema = new mongoose.Schema({
  user_id: { type: Number, required: true },
  full_name: { type: String },
  gender: { type: String, enum: ["male", "female"] },
  email: { type: String, match: /.+\@.+\..+/ },
  facebook_link: { type: String },
  expertise: { type: String, required: true },
  strengths: { type: String },
  weaknesses: { type: String },
  goals: { type: String },
  mentoring_expectations: { type: String },
});

// Mentee schema
const MenteeSchema = new mongoose.Schema({
  user_id: { type: Number, required: true },
  full_name: { type: String, required: true },
  gender: { type: String, enum: ["male", "female"], required: true },
  email: { type: String, match: /.+\@.+\..+/ },
  facebook_link: { type: String },
  year_in_school: { type: String, required: true },
  major: { type: String, required: true },
  strengths: { type: String },
  weaknesses: { type: String },
  goals: { type: String },
  mentoring_expectations: { type: String },
  mentoring_activity_desires: { type: String },
});

// Register details schema
const RegisterDetailsSchema = new mongoose.Schema({
  role: { type: String, enum: ["mentor", "mentee"], required: true },
  mentor_details: { type: MentorSchema, default: null },
  mentee_details: { type: MenteeSchema, default: null },
});

// Login details schema
const LoginDetailsSchema = new mongoose.Schema({
  username_or_email: { type: String, required: true },
  status: { type: String, enum: ["success", "failed"], required: true },
  reason: { type: String, default: null },
});

// Event details schema (supports both login and register events)
const EventDetailsSchema = new mongoose.Schema({
  login: { type: LoginDetailsSchema, default: null },
  register: { type: RegisterDetailsSchema, default: null },
});

// Main schema for tracking user authentication events
const UserAuthEventSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.Mixed, default: null }, // Integer or null
    session_id: { type: String, required: true },
    ip_address: { type: String, required: true },
    user_agent: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    event_type: {
      type: String,
      enum: ["register", "login", "logout", "failed_login", "password_reset"],
      required: true,
    },
    event_details: { type: EventDetailsSchema, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserAuthEvent", UserAuthEventSchema);
