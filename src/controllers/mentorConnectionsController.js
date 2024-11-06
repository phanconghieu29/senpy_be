const MentorConnection = require("../models/mentorConnections");

const getRequestsByMentor = async (req, res) => {
  const mentorId = req.user.id;
  try {
    const requests = await MentorConnection.getAllRequestsByMentor(mentorId);
    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json({ message: "Error fetching connection requests" });
  }
};

const updateConnectionStatus = async (req, res) => {
  const { connectionId, status } = req.body;
  try {
    const success = await MentorConnection.updateStatus(connectionId, status);
    if (success) {
      res.status(200).json({ message: "Status updated successfully" });
    } else {
      res.status(400).json({ message: "Failed to update status" });
    }
  } catch (err) {
    res.status(500).json({ message: "Error updating status" });
  }
};

module.exports = { getRequestsByMentor, updateConnectionStatus };
