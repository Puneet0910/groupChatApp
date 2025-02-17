const Group = require("../models/group");
const GroupMember = require("../models/groupMember");
const User = require("../models/user");

exports.createGroup = async (req, res) => {
  const { name } = req.body;
  const createdBy = req.user.userId; // From auth middleware

  try {
    const group = await Group.create({
      name,
      createdBy,
    });

    // Automatically add the group creator as a member
    await GroupMember.create({
      userId: createdBy,
      groupId: group.id,
    });

    res.status(201).json({ message: "Group created successfully", group });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to create group" });
  }
};

exports.inviteUser = async (req, res) => {
  const { groupId, email } = req.body;
  const inviterId = req.user.userId; // From auth middleware

  try {
    const group = await Group.findByPk(groupId);
    if (!group || group.createdBy !== inviterId) {
      return res
        .status(403)
        .json({ message: "Only the group creator can invite users" });
    }

    const invitedUser = await User.findOne({ where: { email } });
    if (!invitedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user is already a member of the group
    const isMember = await GroupMember.findOne({
      where: { userId: invitedUser.id, groupId },
    });
    if (isMember) {
      return res
        .status(400)
        .json({ message: "User is already a member of the group" });
    }

    // Add the user to the group
    await GroupMember.create({
      userId: invitedUser.id,
      groupId,
    });

    res.status(200).json({ message: "User invited successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to invite user" });
  }
};

exports.getUserGroups = async (req, res) => {
  const userId = req.user.userId; // From auth middleware

  try {
    const groups = await Group.findAll({
      include: {
        model: GroupMember,
        where: { userId },
        attributes: [],
      },
    });

    res.status(200).json(groups);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to fetch user groups" });
  }
};

exports.leaveGroup = async (req, res) => {
  const { groupId } = req.params;
  const userId = req.user.userId; // From auth middleware

  try {
    const groupMember = await GroupMember.findOne({
      where: { userId, groupId },
    });
    if (!groupMember) {
      return res
        .status(404)
        .json({ message: "User is not a member of this group" });
    }

    // Remove the user from the group
    await groupMember.destroy();

    res.status(200).json({ message: "Left group successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to leave group" });
  }
};
