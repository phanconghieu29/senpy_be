const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    gender: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    facebook_link: { type: String },
    role: { type: String, enum: ["mentor", "mentee", "admin"], required: true },
    avatar: { type: String },
    password: { type: String, required: true },
    status: { type: String, default: "pending" },
    created_at: { type: Date, default: Date.now },
    mentor_details: {
      expertise: String,
      strengths: String,
      weaknesses: String,
      goals: String,
      mentoring_expectations: String,
      reason_for_mentoring: String,
    },
    mentee_details: {
      year_in_school: String,
      major: String,
      strengths: String,
      weaknesses: String,
      goals: String,
      mentoring_expectations: String,
    },
  },
  { timestamps: true }
);

// Mã hóa mật khẩu trước khi lưu
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.statics.findUser = async function (email, password) {
  const user = await this.findOne({ email });
  if (!user) return null;

  const isMatch = await bcrypt.compare(password, user.password);
  return isMatch ? user : null;
};

UserSchema.statics.getUserById = async function (userId) {
  const user = await this.findById(userId).select("-password");
  if (!user) throw new Error("Người dùng không tồn tại");
  return user;
};

const User = mongoose.model("User", UserSchema);

const createUser = async (userData) => {
  const user = new User(userData);
  await user.save();
  return user._id;
};

module.exports = { User, createUser };
