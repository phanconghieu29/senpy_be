const UserAuthEvent = require("../models/User");

// Register Event Controller
const registerEvent = async (req, res) => {
  try {
    const { user_id, session_id, ip_address, user_agent, event_details } =
      req.body;

    const event = new UserAuthEvent({
      user_id,
      session_id,
      ip_address,
      user_agent,
      event_type: "register",
      event_details: {
        register: event_details.register,
      },
    });

    await event.save();
    return res
      .status(201)
      .json({ message: "Register event saved successfully", event });
  } catch (error) {
    console.error("Error saving register event:", error);
    return res
      .status(500)
      .json({ message: "Failed to save register event", error });
  }
};

// Login Event Controller
const loginEvent = async (req, res) => {
  try {
    const { user_id, session_id, ip_address, user_agent, event_details } =
      req.body;

    const event = new UserAuthEvent({
      user_id,
      session_id,
      ip_address,
      user_agent,
      event_type: "login",
      event_details: {
        login: event_details.login,
      },
    });

    await event.save();
    return res
      .status(201)
      .json({ message: "Login event saved successfully", event });
  } catch (error) {
    console.error("Error saving login event:", error);
    return res
      .status(500)
      .json({ message: "Failed to save login event", error });
  }
};

// Logout Event Controller
const logoutEvent = async (req, res) => {
  try {
    const { user_id, session_id, ip_address, user_agent } = req.body;

    const event = new UserAuthEvent({
      user_id,
      session_id,
      ip_address,
      user_agent,
      event_type: "logout",
    });

    await event.save();
    return res
      .status(201)
      .json({ message: "Logout event saved successfully", event });
  } catch (error) {
    console.error("Error saving logout event:", error);
    return res
      .status(500)
      .json({ message: "Failed to save logout event", error });
  }
};

// Password Reset Event Controller
const passwordResetEvent = async (req, res) => {
  try {
    const { user_id, session_id, ip_address, user_agent } = req.body;

    const event = new UserAuthEvent({
      user_id,
      session_id,
      ip_address,
      user_agent,
      event_type: "password_reset",
    });

    await event.save();
    return res
      .status(201)
      .json({ message: "Password reset event saved successfully", event });
  } catch (error) {
    console.error("Error saving password reset event:", error);
    return res
      .status(500)
      .json({ message: "Failed to save password reset event", error });
  }
};

// Get all events (for debugging or logging purposes)
const getAllEvents = async (req, res) => {
  try {
    const events = await UserAuthEvent.find();
    return res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    return res.status(500).json({ message: "Failed to fetch events", error });
  }
};

module.exports = {
  registerEvent,
  loginEvent,
  logoutEvent,
  passwordResetEvent,
  getAllEvents,
};
