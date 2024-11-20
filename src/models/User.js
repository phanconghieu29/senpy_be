const { sql, poolPromise } = require("../config/db");

class User {
  constructor(name, gender, email, phone, facebook_link, role, password) {
    this.name = name;
    this.gender = gender;
    this.email = email;
    this.phone = phone;
    this.facebook_link = facebook_link;
    this.role = role;
    this.password = password;
  }

  static async findUser(email, password) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("email", sql.VarChar, email)
        .input("password", sql.VarChar, password)
        .query(
          "SELECT * FROM Users WHERE email = @email AND password = @password"
        );
      return result.recordset;
    } catch (err) {
      throw err;
    }
  }

  static async getUserById(userId) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("userId", sql.Int, userId)
        .query(`
          SELECT 
            u.user_id,
            u.name,
            u.gender,
            u.email,
            u.phone,
            u.facebook_link,
            u.role,
            u.avatar,
            u.status,
            u.created_at,
            CASE 
              WHEN u.role = 'mentor' THEN 
                (SELECT JSON_QUERY((
                  SELECT 
                    m.expertise, 
                    m.strengths, 
                    m.weaknesses, 
                    m.goals, 
                    m.mentoring_expectations, 
                    m.reason_for_mentoring
                  FROM Mentor m 
                  WHERE m.user_id = u.user_id
                  FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
                )))
              WHEN u.role = 'mentee' THEN 
                (SELECT JSON_QUERY((
                  SELECT 
                    me.year_in_school, 
                    me.major, 
                    me.strengths, 
                    me.weaknesses, 
                    me.goals, 
                    me.mentoring_expectations
                  FROM Mentee me 
                  WHERE me.user_id = u.user_id
                  FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
                )))
              ELSE NULL
            END AS role_details
          FROM Users u
          WHERE u.user_id = @userId
        `);
      
      if (result.recordset.length === 0) {
        throw new Error("Người dùng không tồn tại");
      }

      return result.recordset[0];
    } catch (error) {
      throw new Error("Lỗi khi tải thông tin người dùng: " + error.message);
    }
  }
}

async function createUser(userData) {
  const pool = await poolPromise;
  const result = await pool
    .request()
    .input("name", sql.NVarChar, userData.name)
    .input("gender", sql.NVarChar, userData.gender)
    .input("email", sql.NVarChar, userData.email)
    .input("phone", sql.NVarChar, userData.phone)
    .input("facebook_link", sql.NVarChar, userData.facebook_link)
    .input("role", sql.NVarChar, userData.role)
    .input("avatar", sql.NVarChar, userData.avatar || null)
    .input("password", sql.NVarChar, userData.password)
    .input("status", sql.NVarChar, userData.status).query(`
      INSERT INTO Users (name, gender, email, phone, facebook_link, role, avatar, password, status)
      OUTPUT inserted.user_id
      VALUES (@name, @gender, @email, @phone, @facebook_link, @role, @avatar, @password, @status)
    `);

  return result.recordset[0].user_id;
}

module.exports = { User, createUser };
