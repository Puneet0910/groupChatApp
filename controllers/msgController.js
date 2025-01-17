const msgModel = require("../models/messages");

exports.sendMessage = async (req, res, next) => {
  const { msg } = req.body;
  const userId = req.user.userId;
  const userName = req.user.userName; // Retrieve userId from the middleware
  console.log(userId);
  console.log(userName);

  if (!msg || msg.trim() === "") {
    return res.status(400).json({ message: "Message cannot be empty" });
  }

  try {
    const response = await msgModel.create({
      message: msg,
      userId: userId,
      userName: userName, // Associate the message with the userId
    });
    res.status(201).json({ message: "Message sent successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to send message" });
  }
};

exports.getMsg = async (req, res, next) => {
  try {
    const messages = await msgModel.findAll({
      attributes: ["message", "userName", "createdAt"],
      order: [["createdAt", "ASC"]],
    });
    res.status(200).json(messages);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to retrieve messages" });
  }
};
