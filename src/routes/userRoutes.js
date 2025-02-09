const express = require("express");
const { registerUser, getUsers, getUserById } = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/get-users", authMiddleware, getUsers);
router.post("/register", registerUser);
router.get("/users/:id", getUserById);

module.exports = router;
