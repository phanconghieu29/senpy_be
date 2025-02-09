// const sql = require("mssql");

// const config = {
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   server: process.env.DB_HOST,
//   database: process.env.DB_NAME,
//   options: {
//     enableArithAbort: true,
//     trustServerCertificate: true,
//   },
// };

// const poolPromise = new sql.ConnectionPool(config)
//   .connect()
//   .then((pool) => {
//     console.log("Connected to MSSQL");
//     return pool;
//   })
//   .catch((err) => console.log("Database connection failed:", err));

// module.exports = {
//   sql,
//   poolPromise,
// };
const mongoose = require("mongoose");

const mongoUri = process.env.REACT_APP_MONGO_CONNECTION_STRING;

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

module.exports = mongoose;
