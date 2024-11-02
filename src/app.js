const express = require('express');
const { connectDB } = require('./config/db');
const userRoutes = require('./routes/userRoutes');

const app = express();
connectDB();

app.use(express.json());
app.use('/api/users', userRoutes);


module.exports = app;