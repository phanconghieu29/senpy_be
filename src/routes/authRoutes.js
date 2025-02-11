const express = require("express");
const authController = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/login", authController.login);
// router.post("/change-password", authMiddleware, changePassword);

module.exports = router;
