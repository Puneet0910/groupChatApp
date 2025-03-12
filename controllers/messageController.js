const User = require("../models/userModel");
const Message = require("../models/msgModel");

exports.sendMessage = async (req, res) => {
  const { msg } = req.body;
  const userId = req.user.userId;
  const userName = req.user.userName;

  try {
    const message = await Message.create({ content: msg, userId,userName });

    res
      .status(200)
      .json({
        success: true,
        message: "Message sent successfully",
        data: message,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to send message" });
  }
};

exports.getMessages = async (req, res) => {
  const userId = req.user.userId; // From auth middleware

  try {
    const messages = await Message.findAll({
      // where: { userId }, // FIX: Properly formatted where condition
      include: [{ model: User, attributes: ["name"] }], // Fetch user name
      order: [["createdAt", "ASC"]], // Ensure messages are sorted correctly
    });

    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch messages" });
  }
};
