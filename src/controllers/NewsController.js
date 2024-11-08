const NewsModel = require("../models/NewsModel");

class NewsController {
  // Existing create method
  static async create(req, res) {
    const { title, content, author_id } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null; // Đường dẫn lưu ảnh

    if (!title || !content || !author_id) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    try {
      const newsId = await NewsModel.createNews({ title, content, author_id, image_url });
      return res.status(201).json({
        message: "Tạo tin tức thành công",
        news_id: newsId,
        image_url: image_url,
      });
    } catch (err) {
      return res.status(500).json({
        message: "Tạo tin tức thất bại",
        error: err.message,
      });
    }
  }

  // Add getAll method to fetch all news
  static async getAll(req, res) {
    try {
      const news = await NewsModel.getAllNews(); // Ensure you have this method in the NewsModel
      return res.status(200).json(news);
    } catch (err) {
      return res.status(500).json({
        message: "Failed to fetch news",
        error: err.message,
      });
    }
  }
}

module.exports = NewsController;
