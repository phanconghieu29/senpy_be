const { sql, poolPromise } = require("../config/db");

class NewsModel {
  static async createNews({ title, content, author_id, image_url }) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("title", title)
        .input("content", content)
        .input("author_id", author_id)
        .input("image_url", image_url) // Truyền đường dẫn ảnh vào query
        .query(`
          INSERT INTO News (title, content, author_id, image_url)
          VALUES (@title, @content, @author_id, @image_url);
          SELECT SCOPE_IDENTITY() AS news_id;
        `);

      return result.recordset[0].news_id; // Trả về ID của bài viết mới
    } catch (err) {
      console.error("Lỗi khi tạo tin tức:", err);
      throw err;
    }
  }

  // static async getAllNews() {
  //   try {
  //     const pool = await poolPromise;
  //     const result = await pool.request().query("SELECT * FROM News");
  //     return result.recordset;
  //   } catch (err) {
  //     console.error("Error fetching news:", err);
  //     throw err;
  //   }
  // }
  static async getAllNews() {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query(`
        SELECT 
          News.news_id, 
          News.title, 
          News.content, 
          News.post_date, 
          News.image_url, 
          Users.name AS author_name
        FROM 
          News
        INNER JOIN 
          Users ON News.author_id = Users.user_id
        ORDER BY 
          News.post_date DESC
      `);
      return result.recordset;
    } catch (err) {
      console.error("Lỗi khi lấy danh sách tin tức:", err);
      throw err;
    }
  }

  static async getNewsById(news_id) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("news_id", sql.Int, parseInt(news_id, 10)) // Parse news_id as integer and set type to Int
        .query(`
          SELECT 
            News.news_id, 
            News.title, 
            News.content, 
            News.post_date, 
            News.image_url, 
            Users.name AS author_name
          FROM 
            News
          INNER JOIN 
            Users ON News.author_id = Users.user_id
          WHERE 
            News.news_id = @news_id
        `);

      return result.recordset[0]; // Return the first record
    } catch (err) {
      console.error("Lỗi khi lấy chi tiết tin tức:", err);
      throw err;
    }
  }

  static async updateNews({ news_id, title, content, image_url }) {
    try {
      const pool = await poolPromise;
      const request = pool
        .request()
        .input("news_id", news_id)
        .input("title", title)
        .input("content", content);

      if (image_url) {
        request.input("image_url", image_url);
        await request.query(`
          UPDATE News 
          SET title = @title, content = @content, image_url = @image_url 
          WHERE news_id = @news_id
        `);
      } else {
        await request.query(`
          UPDATE News 
          SET title = @title, content = @content 
          WHERE news_id = @news_id
        `);
      }
    } catch (err) {
      console.error("Lỗi khi cập nhật tin tức:", err);
      throw err;
    }
  }

  static async deleteNews(news_id) {
    try {
      const pool = await poolPromise; // Đảm bảo rằng pool đã kết nối
      const result = await pool
        .request()
        .input("news_id", sql.Int, news_id) // Chỉ định kiểu dữ liệu cho news_id
        .query("DELETE FROM News WHERE news_id = @news_id"); // Sử dụng tham số SQL

      return result;
    } catch (err) {
      throw new Error(`Lỗi khi xóa bài viết: ${err.message}`);
    }
  }
}

module.exports = NewsModel;
