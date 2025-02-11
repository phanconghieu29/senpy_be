const express = require("express");
const {
  registerUser,
  getUsers,
  getUserById,
} = require("../controllers/userController");
// const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// router.get("/get-users", authMiddleware, getUsers);
// router.post("/register", authMiddleware, registerUser);
// router.get("/users/:id", getUserById);
router.post("/login", authController.login);
router.post("/register", authController.register);
router.post("/logout", authController.logout);

module.exports = router;
