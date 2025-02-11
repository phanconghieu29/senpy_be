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
router.put('/approve-mentor/:id', approveMentor);
router.delete('/reject-mentor/:id', rejectMentor);

module.exports = router;
