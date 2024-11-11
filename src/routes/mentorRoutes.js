const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  registerMentor,
  getMentors,
  addConnection,
  approveMentor,
  rejectMentor,
} = require("../controllers/mentorController");
const router = express.Router();

router.get("/get-mentors", getMentors);
router.post("/register", registerMentor);
router.post("/connect", addConnection);
router.put('/approve-mentor/:mentorId', approveMentor);
router.delete('/reject-mentor/:mentorId', rejectMentor);

module.exports = router;
