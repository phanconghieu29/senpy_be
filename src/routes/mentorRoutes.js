const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  registerMentor,
  getMentors,
  addConnection,
} = require("../controllers/mentorController");
const router = express.Router();

router.get("/get-mentors", getMentors);
router.post("/register", registerMentor);
router.post("/connect", addConnection);

module.exports = router;
