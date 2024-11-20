// routes/reportRoutes.js
const express = require("express");
const router = express.Router();
const upload = require("../config/uploadConfig");

const {
  createReport,
  fetchReports,
  getReports,
  updateReportStatus,
  fetchReportsByStatus,
} = require("../controllers/reportController");

router.get("/", fetchReports);
router.post("/create", upload, createReport);
router.get("/reports", getReports);
router.get("/status/:status", fetchReportsByStatus);
router.put("/reports/:id", updateReportStatus);

module.exports = router;
