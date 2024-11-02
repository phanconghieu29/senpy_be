const sql = require("mssql");

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_HOST,
  database: process.env.DB_NAME,
  options: {
      enableArithAbort: true,
      trustServerCertificate: true,
  },
};

async function connectDB() {
  try {
      await sql.connect(config);
      console.log('Connected to MS SQL Database');
  } catch (error) {
      console.error('Database connection failed:', error);
  }
}

module.exports = { connectDB, sql };