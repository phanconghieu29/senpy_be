const mongoose = require("mongoose");

// Define the schema for the ReportSession
const reportSessionSchema = new mongoose.Schema({
  schedule_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Schedule",
    required: true,
  },
  cross_mentor: { type: String, required: true },
  meeting_number: { type: Number, required: true },
  achieved_results: { type: String, required: true },
  current_issues: { type: String, required: true },
  mentor_guidance: { type: String, required: true },
  next_steps_and_commitments: { type: String, required: true },
  image: { type: String }, // URL or base64 encoded string
  status: { type: String, required: true },
  report_date: { type: Date, default: Date.now },
});

// Create the ReportSession model
const ReportSession = mongoose.model("ReportSession", reportSessionSchema);

// Create a new ReportSession
const createReportSession = async (data) => {
  try {
    const newReport = new ReportSession(data);
    const result = await newReport.save();
    return result;
  } catch (error) {
    console.error("Error creating report session:", error);
    throw new Error("Failed to create report session");
  }
};

// Get all ReportSessions with populated fields
const getAllReports = async () => {
  try {
    const reports = await ReportSession.find()
      .populate({
        path: "schedule_id",
        populate: [
          { path: "mentor_id", select: "name" },
          { path: "mentee_id", select: "name" },
        ],
      })
      .sort({ report_date: -1 }); // Sort by report_date in descending order
    return reports;
  } catch (error) {
    console.error("Error fetching reports:", error);
    throw new Error("Failed to fetch reports");
  }
};

// Update the status of a ReportSession by ID
const updateReportStatus = async (id, status) => {
  try {
    const result = await ReportSession.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    if (!result) {
      throw new Error("Report not found");
    }
    return result;
  } catch (error) {
    console.error("Error updating report status:", error);
    throw new Error("Failed to update report status");
  }
};

// Get all ReportSessions by status
const getReportsByStatus = async (status) => {
  try {
    const reports = await ReportSession.find({ status }).populate({
      path: "schedule_id",
      populate: [
        { path: "mentor_id", select: "name" },
        { path: "mentee_id", select: "name" },
      ],
    });
    return reports;
  } catch (error) {
    console.error("Error fetching reports by status:", error);
    throw new Error("Failed to fetch reports by status");
  }
};

module.exports = {
  createReportSession,
  getAllReports,
  updateReportStatus,
  getReportsByStatus,
};
