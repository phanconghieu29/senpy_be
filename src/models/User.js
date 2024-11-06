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
