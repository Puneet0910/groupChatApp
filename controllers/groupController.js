const Group = require("../models/group");
const GroupMember = require("../models/groupMember");

exports.createGroup = async (req, res) => {
  const { name } = req.body;
  const userId = req.user.userId; // From auth middleware

  try {
    const group = await Group.create({ name, createdBy: userId });
    await GroupMember.create({ groupId: group.id, userId });
    res.status(201).json({ message: "Group created successfully", group });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating group" });
  }
};

exports.getUserGroups = async (req, res) => {
  const userId = req.user.userId;

  try {
    const groups = await Group.findAll({
      include: {
        model: GroupMember,
        where: { userId },
      },
    });
    res.status(200).json(groups);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching groups" });
  }
};
