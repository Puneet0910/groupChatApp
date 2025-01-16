const Msg = require("../models/messages");

exports.msgSend = async (req, res, next) => {
  const { userId, groupId, message } = req.body;

  if (!userId || !message) {
    return res.status(400).json({ error: "userId and message are required" });
  }

  try {
    const messageData = await Msg.create({
      userId: userId,
      groupId: groupId || null,
      message: message,
    });

    res
      .status(201)
      .json({ message: "Message sent successfully", data: messageData });
  } catch (error) {
    console.error("Error sending message:", error);
    res
      .status(500)
      .json({ error: "An error occurred while sending the message" });
  }
};
