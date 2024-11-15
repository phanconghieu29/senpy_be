const express = require("express");
const { registerUser, getUsers } = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/get-users", authMiddleware, getUsers);
router.post("/register", authMiddleware, registerUser);

module.exports = router;
