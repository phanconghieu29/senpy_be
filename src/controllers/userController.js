const db = require('../config/db');
const User = require('../models/User');

exports.createUser = (req, res) => {
    const { name, gender, email, phone, facebook_link, role, password } = req.body;
    const user = new User(name, gender, email, phone, facebook_link, role, password);

    const query = `INSERT INTO Users (name, gender, email, phone, facebook_link, role, password) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    
    db.query(query, [user.name, user.gender, user.email, user.phone, user.facebook_link, user.role, user.password], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Có lỗi xảy ra khi thêm người dùng', error: err });
        }
        res.status(201).json({ message: 'Thêm người dùng thành công', userId: result.insertId });
    });
};