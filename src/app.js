const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const mentorRoutes = require("./routes/mentorRoutes");
const menteeRoutes = require("./routes/menteeRoutes");
const connectionRequestsRoutes = require("./routes/mentorConnectionsRoutes");
const newsRoutes = require("./routes/newsRoutes");
const app = express();
app.use(cors());

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/mentors", mentorRoutes);
app.use("/api/mentees", menteeRoutes);
app.use("/api/mentor-connections", connectionRequestsRoutes);
app.use("/api/news", newsRoutes );

module.exports = app;
