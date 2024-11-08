const { poolPromise } = require("../config/db");

class NewsModel {
  // Existing createNews method
  static async createNews({ title, content, author_id, image_url }) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('title', title)
        .input('content', content)
        .input('author_id', author_id)
        .input('image_url', image_url)
        .query(`
          INSERT INTO News (title, content, author_id, image_url)
          VALUES (@title, @content, @author_id, @image_url);
          SELECT SCOPE_IDENTITY() AS news_id;
        `);

      return result.recordset[0].news_id; // Trả về ID của bài viết mới
    } catch (err) {
      console.error("Error creating news:", err);
      throw err;
    }
  }

  // Method to fetch all news
  static async getAllNews() {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .query("SELECT * FROM News");
      return result.recordset;
    } catch (err) {
      console.error("Error fetching news:", err);
      throw err;
    }
  }
}

module.exports = NewsModel;
