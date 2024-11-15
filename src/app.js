const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const mentorRoutes = require("./routes/mentorRoutes");
const menteeRoutes = require("./routes/menteeRoutes");
const mentorConnectionsRoutes = require("./routes/mentorConnectionsRoutes");
const userRoutes = require("./routes/userRoutes");
const newsRoutes = require("./routes/newsRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");

const app = express();
app.use(cors());

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/mentors", mentorRoutes);
app.use("/api/mentees", menteeRoutes);
app.use("/api/connections", mentorConnectionsRoutes);
app.use("/api/users", userRoutes);
app.use("/api/news", newsRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/uploads', express.static('uploads'));

module.exports = app;
