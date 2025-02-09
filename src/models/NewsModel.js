const mongoose = require("mongoose");
const News = require("../models/News");

class NewsModel {
  static async createNews({ title, content, author_id, image_url }) {
    try {
      if (!title || !content || !author_id) {
        throw new Error("Thiếu thông tin bắt buộc (title, content, author_id)");
      }

      const news = new News({ title, content, author_id, image_url });
      await news.save();
      return news._id; // Trả về ID của bài viết mới
    } catch (err) {
      console.error("Lỗi khi tạo tin tức:", err);
      throw new Error(`Lỗi khi tạo bài viết: ${err.message}`);
    }
  }

  static async getAllNews({ page = 1, limit = 10 } = {}) {
    try {
      const skip = (page - 1) * limit;
      const newsList = await News.find()
        .populate("author_id", "name")
        .sort({ post_date: -1 })
        .skip(skip)
        .limit(limit);

      const totalNews = await News.countDocuments();
      return {
        data: newsList,
        currentPage: page,
        totalPages: Math.ceil(totalNews / limit),
      };
    } catch (err) {
      console.error("Lỗi khi lấy danh sách tin tức:", err);
      throw new Error(`Lỗi khi lấy danh sách tin tức: ${err.message}`);
    }
  }

  static async getNewsById(news_id) {
    try {
      const news = await News.findById(news_id).populate("author_id", "name");
      if (!news) throw new Error("Bài viết không tồn tại");
      return news;
    } catch (err) {
      console.error("Lỗi khi lấy chi tiết tin tức:", err);
      throw new Error(`Lỗi khi lấy chi tiết tin tức: ${err.message}`);
    }
  }

  static async updateNews({ news_id, title, content, image_url }) {
    try {
      const updateData = { title, content };
      if (image_url) updateData.image_url = image_url;

      const updatedNews = await News.findByIdAndUpdate(news_id, updateData, {
        new: true,
      });
      if (!updatedNews) throw new Error("Không tìm thấy bài viết để cập nhật");
      return updatedNews;
    } catch (err) {
      console.error("Lỗi khi cập nhật tin tức:", err);
      throw new Error(`Lỗi khi cập nhật tin tức: ${err.message}`);
    }
  }

  static async deleteNews(news_id) {
    try {
      const deletedNews = await News.findByIdAndDelete(news_id);
      if (!deletedNews) throw new Error("Không tìm thấy bài viết để xóa");
      return true;
    } catch (err) {
      console.error("Lỗi khi xóa bài viết:", err);
      throw new Error(`Lỗi khi xóa bài viết: ${err.message}`);
    }
  }
}

module.exports = NewsModel;
