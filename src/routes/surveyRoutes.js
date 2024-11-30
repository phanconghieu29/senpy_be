const express = require('express');
const { create,getAll } = require('../controllers/surveyController');  // Đảm bảo sử dụng đúng hàm 'create'
const router = express.Router();

// Định nghĩa route để tạo feedback
router.post('/', create);

router.get('/', getAll);

module.exports = router;
