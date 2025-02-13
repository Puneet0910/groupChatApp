const msgModel = require("../models/messages");

// Global Messages

exports.sendMessage = async (req, res, next) => {
  const { msg, groupId } = req.body; // Optional groupId
  const userId = req.user.userId;
  const userName = req.user.userName;

  if (!msg || msg.trim() === "") {
    return res.status(400).json({ message: "Message cannot be empty" });
  }

  try {
    await msgModel.create({
      content: msg,
      userId,
      userName,
      groupId: groupId || null, // Null for global messages
    });

    res.status(201).json({ message: "Message sent successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to send message" });
  }
};

exports.getMessages = async (req, res, next) => {
  const { groupId } = req.query; // Optional query parameter

  try {
    const messages = await msgModel.findAll({
      where: groupId ? { groupId } : { groupId: null },
      attributes: ["content", "userName", "createdAt"],
      order: [["createdAt", "ASC"]],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to retrieve messages" });
  }
};
