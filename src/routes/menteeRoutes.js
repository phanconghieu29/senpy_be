const express = require("express");
const {
  registerMentee,
  getMentees,
  approveMentee,
  rejectMentee,
} = require("../controllers/menteeController");
const router = express.Router();

router.post("/register", registerMentee);
router.get("/get-mentees", getMentees);
router.put("/approve-mentee/:menteeId", approveMentee);
router.delete("/reject-mentee/:menteeId", rejectMentee);

module.exports = router;
