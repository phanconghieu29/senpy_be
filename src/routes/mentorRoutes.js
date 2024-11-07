const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  registerMentor,
  getMentors,
  addConnection,
  approveMentor,
} = require("../controllers/mentorController");
const router = express.Router();

router.get("/get-mentors", getMentors);
router.post("/register", registerMentor);
router.post("/connect", addConnection);
router.put('/approve-mentor/:mentorId', approveMentor);

module.exports = router;
