const User = require("../models/userModel");
const Message = require("../models/msgModel");
const Group = require('../models/group');

exports.sendMessage = async (req, res) => {
  const { msg, groupName } = req.body; // Accept groupName from request
  const userId = req.user.userId;
  const userName = req.user.userName;

  try {
    let groupId = null;

    // If a group name is provided, fetch the group ID
    if (groupName) {
      const group = await Group.findOne({ where: { name: groupName } });
      if (group) {
        groupId = group.id;
      } else {
        return res
          .status(400)
          .json({ success: false, message: "Invalid group" });
      }
    }

    // Save the message with groupId (null for global messages)
    const message = await Message.create({
      content: msg,
      userId,
      userName,
      groupId,
    });

    res.status(200).json({
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
  const { groupName } = req.query; // Accept group name from request
  const userId = req.user.userId; // From auth middleware

  try {
    let whereCondition = {}; // Default: Fetch all messages

    if (groupName) {
      const group = await Group.findOne({ where: { name: groupName } });

      if (!group) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid group" });
      }

      whereCondition.groupId = group.id; // Fetch messages for the group
    } else {
      whereCondition.groupId = null; // Fetch only global messages
    }

    const messages = await Message.findAll({
      where: whereCondition,
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
