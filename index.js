const morgan = require("morgan");
require("dotenv").config();
const connectDB = require("./src/config/db");
const app = require("./src/app");
const PORT = process.env.PORT || 5000;

app.use(morgan("short"));

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
  });
};

startServer();