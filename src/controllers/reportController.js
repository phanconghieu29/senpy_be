const { createReportSession, getAllReports, getReportsByStatus, updateReportStatusById } = require('../models/reportModel');

const path = require('path');

const createReport = async (req, res) => {
  const {
    schedule_id,
    mentor_id,
    mentee_id,
    crossMentor,
    meetingNumber,
    resultsAchieved,
    currentIssue,
    mentorGuidance,
    nextActions,
    // image,
  } = req.body;
  // const image = req.file ? req.file.path : null; // Lấy đường dẫn ảnh
  // Đảm bảo ảnh được upload vào thư mục uploads
  const image = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    // Lưu dữ liệu vào cơ sở dữ liệu
    const result = await createReportSession({
      schedule_id,
      mentor_id,
      mentee_id,
      cross_mentor: crossMentor,
      meeting_number: meetingNumber,
      achieved_results: resultsAchieved,
      current_issues: currentIssue,
      mentor_guidance: mentorGuidance,
      next_steps_and_commitments: nextActions,
      image,
      status: 'pending',  // Trạng thái mặc định
    });

    res.status(201).json({
      message: 'Report session created successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error creating report session:', error);
    res.status(500).json({ message: 'Failed to create report session' });
  }
};

const fetchReports = async (req, res) => {
  try {
    const reports = await getAllReports();
    res.status(200).json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Failed to fetch reports' });
  }
};

const getReports = async (req, res) => {
  try {
    const reports = await getAllSessionSummaries();
    res.status(200).json(reports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ message: "Failed to fetch reports" });
  }
};

// Lấy báo cáo theo trạng thái
const fetchReportsByStatus = async (req, res) => {
  const { status } = req.params; // Lấy trạng thái từ URL

  try {
    const reports = await getReportsByStatus(status);
    if (reports.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy báo cáo nào với trạng thái này' });
    }
    res.status(200).json(reports);
  } catch (error) {
    console.error('Lỗi khi lấy báo cáo theo trạng thái:', error);
    res.status(500).json({ message: 'Không thể lấy báo cáo theo trạng thái' });
  }
};


const updateReportStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'ID is required' });
  }

  try {
    const result = await updateReportStatusById(id, status); // This will call the refactored function
    if (result.success) {
      res.status(200).json({ message: 'Status updated successfully' });
    } else {
      res.status(404).json({ message: 'Report not found' });
    }
  } catch (error) {
    console.error('Error updating report status:', error);
    res.status(500).json({ message: 'Failed to update report status' });
  }
};

module.exports = {
  createReport,
  fetchReports,
  getReports,
  updateReportStatus,
  fetchReportsByStatus,
};
