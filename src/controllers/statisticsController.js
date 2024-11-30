const statisticsModel = require("../models/statisticsModel");

exports.getStatistics = async (req, res) => {
    try {
        const { currentYearStats, previousYearStats } = await statisticsModel.fetchStatistics();

        // Tính toán sự thay đổi phần trăm
        const calculatePercentageChange = (current, previous) => {
            if (previous === 0) return "+100%";
            const change = ((current - previous) / previous) * 100;
            return `${change > 0 ? "+" : ""}${change.toFixed(2)}%`;
        };

        // Chuyển đổi `increase` thành số thực để dùng làm `progress`
        const convertIncreaseToProgress = (increase) => {
            const numericValue = parseFloat(increase.replace("%", ""));
            return numericValue / 100; // Chuyển từ phần trăm sang số thập phân
        };

        const statistics = {
            successfulConnections: {
                count: currentYearStats.successfulConnections,
                increase: calculatePercentageChange(
                    currentYearStats.successfulConnections,
                    previousYearStats.successfulConnections
                ),
                progress: convertIncreaseToProgress(
                    calculatePercentageChange(
                        currentYearStats.successfulConnections,
                        previousYearStats.successfulConnections
                    )
                ),
            },
            mentorsThisYear: {
                count: currentYearStats.mentors,
                increase: calculatePercentageChange(
                    currentYearStats.mentors,
                    previousYearStats.mentors
                ),
                progress: convertIncreaseToProgress(
                    calculatePercentageChange(
                        currentYearStats.mentors,
                        previousYearStats.mentors
                    )
                ),
            },
            menteesThisYear: {
                count: currentYearStats.mentees,
                increase: calculatePercentageChange(
                    currentYearStats.mentees,
                    previousYearStats.mentees
                ),
                progress: convertIncreaseToProgress(
                    calculatePercentageChange(
                        currentYearStats.mentees,
                        previousYearStats.mentees
                    )
                ),
            },
            newsThisYear: {
                count: currentYearStats.news,
                increase: calculatePercentageChange(
                    currentYearStats.news,
                    previousYearStats.news
                ),
                progress: convertIncreaseToProgress(
                    calculatePercentageChange(
                        currentYearStats.news,
                        previousYearStats.news
                    )
                ),
            },
        };

        res.status(200).json(statistics);
    } catch (error) {
        console.error("Error fetching statistics:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.getMonthlyArticleStatistics = async (req, res) => {
    try {
        const data = await statisticsModel.fetchMonthlyArticleStatistics();

        const formattedData = Array.from({ length: 12 }, (_, i) => {
            const monthData = data.find((d) => d.month === i + 1);
            return {
                month: i + 1, // 1 -> 12
                article_count: monthData ? monthData.article_count : 0,
            };
        });

        res.status(200).json({ success: true, data: formattedData });
    } catch (error) {
        console.error("Error fetching monthly article statistics:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};