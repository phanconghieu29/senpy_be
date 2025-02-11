const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/register", authController.registerEvent);
router.post("/login", authController.loginEvent);
router.post("/logout", authController.logoutEvent);
router.post("/password-reset", authController.passwordResetEvent);
router.get("/events", authController.getAllEvents);

module.exports = router;
