const NewsModel = require("../models/NewsModel");

class NewsController {
  static async create(req, res) {
    const { title, content, author_id } = req.body;

    // Kiểm tra xem có ảnh hay không
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;
    //const image_url = req.file ? `uploads/${req.file.filename}` : null;

    // Kiểm tra các trường dữ liệu bắt buộc
    if (!title || !content || !author_id) {
      return res.status(400).json({ message: "Thiếu trường dữ liệu bắt buộc" });
    }

    try {
      const newsId = await NewsModel.createNews({
        title,
        content,
        author_id,
        image_url,
      });
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

  // Method để lấy tất cả các bài viết
  static async getAll(req, res) {
    try {
      const news = await NewsModel.getAllNews(); // Lấy tất cả bài viết
      return res.status(200).json(news);
    } catch (err) {
      return res.status(500).json({
        message: "Không thể lấy danh sách tin tức",
        error: err.message,
      });
    }
  }

  static async getNewsById(req, res) {
    const { news_id } = req.params;

    try {
      const news = await NewsModel.getNewsById(news_id);
      if (!news) {
        return res.status(404).json({ message: "Không tìm thấy bài viết" });
      }
      return res.status(200).json(news);
    } catch (err) {
      return res
        .status(500)
        .json({ message: "Lỗi khi lấy chi tiết tin tức", error: err.message });
    }
  }

  // Thêm phương thức update vào NewsController.js
  static async update(req, res) {
    const { news_id, title, content } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    if (!news_id || !title || !content) {
      return res.status(400).json({ message: "Thiếu trường dữ liệu bắt buộc" });
    }

    try {
      await NewsModel.updateNews({ news_id, title, content, image_url });
      return res.status(200).json({
        message: "Cập nhật tin tức thành công",
      });
    } catch (err) {
      return res.status(500).json({
        message: "Cập nhật tin tức thất bại",
        error: err.message,
      });
    }
  }
  static async delete(req, res) {
    const news_id = req.params.news_id; // Lấy ID bài viết từ URL
    try {
      const result = await NewsModel.deleteNews(news_id);
      if (result.rowsAffected[0] > 0) {
        return res.json({
          success: true,
          message: "News deleted successfully",
        });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "News not found" });
      }
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ success: false, message: "Failed to delete news" });
    }
  }
}

module.exports = NewsController;
