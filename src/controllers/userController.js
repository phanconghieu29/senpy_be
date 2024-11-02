const getUser = async (req, res) => {
  try {
    res.json({ message: "Get User successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getUser };
