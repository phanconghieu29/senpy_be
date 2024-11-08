const express = require("express");
const upload = require("../config/uploadConfig");
const NewsController = require("../controllers/NewsController");

const router = express.Router();

// POST: Tạo bài viết mới kèm ảnh
router.post("/create", upload.single("image"), NewsController.create);

router.get("/all", NewsController.getAll);
module.exports = router;
