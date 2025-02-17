const User = require("../models/user");
const Message = require("../models/message");
const GroupMember = require("../models/groupMember");

exports.sendMessage = async (req, res) => {
  const { msg, groupId } = req.body;
  const userId = req.user.userId;
  const userName = req.user.userName;

  try {
    // If groupId is provided, make sure the user is a member of the group
    if (groupId) {
      const isMember = await GroupMember.findOne({
        where: { userId, groupId },
      });
      if (!isMember) {
        return res
          .status(403)
          .json({ message: "You are not a member of this group" });
      }
    }

    const message = await Message.create({ userName,content: msg, userId, groupId });

    res.status(200).json({ message: "Message sent successfully", message });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to send message" });
  }
};

exports.getMessages = async (req, res) => {
  const { groupId } = req.query;
  const userId = req.user.userId; // From auth middleware

  try {
    const messages = await Message.findAll({
      where: groupId ? { groupId } : { userId },
      include: [{ model: User, attributes: ["name"] }],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};
