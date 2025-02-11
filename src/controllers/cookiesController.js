const Cookie = require("../models/Cookie");

const getAllCookies = async (req, res) => {
  try {
    const cookies = await Cookie.find();
    res.status(200).json(cookies);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Lỗi khi lấy cookies", details: err.message });
  }
};

// Lấy một cookie theo sessionId
const getCookieBySessionId = async (req, res) => {
  try {
    const cookie = await Cookie.findOne({ sessionId: req.params.sessionId });
    if (!cookie) return res.status(404).json({ error: "Cookie không tồn tại" });

    res.status(200).json(cookie);
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi lấy cookie", details: err.message });
  }
};

// Tạo cookie mới
const createCookie = async (req, res) => {
  try {
    const newCookie = new Cookie(req.body);
    const savedCookie = await newCookie.save();
    res.status(201).json(savedCookie);
  } catch (err) {
    res.status(400).json({ error: "Lỗi khi tạo cookie", details: err.message });
  }
};

// Cập nhật cookie theo sessionId
const updateCookieBySessionId = async (req, res) => {
  try {
    const updatedCookie = await Cookie.findOneAndUpdate(
      { sessionId: req.params.sessionId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedCookie)
      return res.status(404).json({ error: "Cookie không tồn tại" });

    res.status(200).json(updatedCookie);
  } catch (err) {
    res
      .status(400)
      .json({ error: "Lỗi khi cập nhật cookie", details: err.message });
  }
};

// Xóa cookie theo sessionId
const deleteCookieBySessionId = async (req, res) => {
  try {
    const deletedCookie = await Cookie.findOneAndDelete({
      sessionId: req.params.sessionId,
    });
    if (!deletedCookie)
      return res.status(404).json({ error: "Cookie không tồn tại" });

    res.status(200).json({ message: "Xóa cookie thành công", deletedCookie });
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi xóa cookie", details: err.message });
  }
};

module.exports = {
  getAllCookies,
  getCookieBySessionId,
  createCookie,
  updateCookieBySessionId,
  deleteCookieBySessionId,
};
