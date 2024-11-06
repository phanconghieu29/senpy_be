const express = require('express');
const { registerMentee } = require('../controllers/menteeController');
const router = express.Router();

router.post('/register', registerMentee);

module.exports = router;
