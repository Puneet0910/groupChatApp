const msgModel = require("../models/messages");

exports.sendMessage = async (req, res, next) => {
  const { msg } = req.body;
  const userId = req.user.userId; // Retrieve userId from the middleware
  console.log(userId);
  
  if (!msg || msg.trim() === "") {
    return res.status(400).json({ message: "Message cannot be empty" });
  }

  try {
    const response = await msgModel.create({
      message: msg,
      userId:userId, // Associate the message with the userId
    });
    res.status(201).json({ message: "Message sent successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to send message" });
  }
};
