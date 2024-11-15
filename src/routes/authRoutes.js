const express = require("express");
const { loginUser, changePassword } = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/login", loginUser);
router.post("/change-password", authMiddleware, changePassword);

module.exports = router;
