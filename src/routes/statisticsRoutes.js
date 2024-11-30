const express = require("express");
const router = express.Router();
const statisticsController = require("../controllers/statisticsController");

router.get("/", statisticsController.getStatistics);
router.get("/monthly-article-statistics", statisticsController.getMonthlyArticleStatistics);    

module.exports = router;