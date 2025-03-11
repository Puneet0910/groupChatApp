const User = require("../models/userModel");
const Message = require("../models/msgModel");

exports.sendMessage = async (req, res) => {
  const { msg } = req.body;
  const userId = req.user.userId;
  const userName = req.user.userName;
  try {
    const message = await Message.create({ userName, content: msg, userId });
    res.status(200).json({ message: "Message sent successfully", message });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to send message" });
  }
};
