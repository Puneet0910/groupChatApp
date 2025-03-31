const Group = require('../models/group');
const User = require('../models/userModel');
const groupMember = require('../models/groupMember');

exports.createGroup = async (req, res) => {
  const { name } = req.body;
  const createdBy = req.user.userId; // From auth middleware

  try {
    const group = await Group.create({
      name,
      createdBy,
    });

    // Automatically add the group creator as a member
    await groupMember.create({
      userId: createdBy,
      groupId: group.id,
      isAdmin:true,
    });

    res.status(201).json({ message: "Group created successfully", group });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to create group" });
  }
};

exports.getGroups = async (req, res, next) => {
  const userId = req.user.userId;

  try {
    // Find group names using a join on GroupUsers
    const groups = await Group.findAll({
      include: [
        {
          model: groupMember,
          where: { userId },
          attributes: [], // No need to return GroupUsers data
        },
      ],
      attributes: ["name"], // Extract only the group names
    });

    // Extract group names from the result
    const groupNames = groups.map((group) => group.name);

    res.status(200).json({ success: true, groups: groupNames });
  } catch (error) {
    console.error("Error fetching group names:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch group names" });
  }
};

exports.addUserToGroup = async (req, res) => {
  const { groupName, userName } = req.body;

  try {
    const group = await Group.findOne({ where: { name: groupName } });
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    const user = await User.findOne({ where: { name: userName } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the user is already in the group
    const existingMember = await groupMember.findOne({
      where: { groupId: group.id, userId: user.id },
    });

    if (existingMember) {
      return res.status(400).json({ error: "User is already in the group" });
    }

    // Add the user to the group
    await groupMember.create({ groupId: group.id, userId: user.id });

    res.status(200).json({ message: `${userName} added to ${groupName}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const Message = require("../models/msgModel"); 

exports.deleteGroup = async (req, res) => {
  const { groupName } = req.body;
  const userId = req.user.userId;

  try {
    // Find the group
    const group = await Group.findOne({ where: { name: groupName } });

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Check if the user is the admin (assuming `createdBy` is the admin ID)
    if (group.createdBy !== userId) {
      return res
        .status(403)
        .json({ error: "You are not authorized to delete this group" });
    }

    // Delete related data (messages and group members)
    await groupMember.destroy({ where: { groupId: group.id } });
    await Message.destroy({ where: { groupId: group.id } });

    // Delete the group
    await Group.destroy({ where: { id: group.id } });

    res.status(200).json({ message: "Group deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete group" });
  }
}
exports.getGroupMessages = async (req, res) => {
  const { groupName } = req.query;

  try {
    // Find the group by name
    const group = await Group.findOne({ where: { name: groupName } });

    if (!group) {
      return res
        .status(404)
        .json({ success: false, message: "Group not found" });
    }

    // Fetch messages for this group
    const messages = await Message.findAll({
      where: { groupId: group.id }, // Ensure messages are linked to the correct group
      include: [{ model: User, attributes: ["name"] }], // Include user details
      order: [["createdAt", "ASC"]],
    });

    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error("Error fetching group messages:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch messages" });
  }
};

exports.getGroupMembers = async (req, res, next) => {
  const { groupName } = req.query;
  const userId = req.user.userId;

  try {
    // Find the group and include members using correct associations
    const group = await Group.findOne({
      where: { name: groupName },
      include: [
        {
          model: groupMember,
          include: [
            {
              model: User,
              attributes: ["id", "name"], // Fetch user details
            },
          ],
        },
        {
          model: User,
          as: "creator",
          attributes: ["id", "name"],
        },
      ],
    });

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Check if the current user is an admin
    const isAdmin = group.createdBy === userId;

    // Extract members data
    const members = group.groupMembers.map((member) => ({
      name: member.user?.name || "Unknown User",
      userId: member.user?.id || "N/A",
      isAdmin: member.userId === group.createdBy,
    }));


    res.json({ members, userId, isAdmin });
  } catch (error) {
    console.error("Error fetching group members:", error);
    res.status(500).json({ error: "An error occurred. Please try again." });
  }
};

exports.removeUserFromGroup = async (req, res, next) => {
  const { groupName, userId } = req.body;
  const adminId = req.user.userId;

  try {
    // Find the group
    const group = await Group.findOne({ where: { name: groupName } });

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Check if the current user is the admin (using createdBy field)
    if (group.createdBy !== adminId) {
      return res.status(403).json({ error: "Only the admin can remove users" });
    }

    // Check if the user is a member of the group
    const member = await groupMember.findOne({
      where: { groupId: group.id, userId },
    });

    if (!member) {
      return res.status(404).json({ error: "User not found in the group" });
    }

    // Remove the user from the group
    await groupMember.destroy({ where: { groupId: group.id, userId } });

    res.status(200).json({ message: "User removed successfully" });
  } catch (error) {
    console.error("Error removing user from group:", error);
    res.status(500).json({ error: "An error occurred. Please try again." });
  }
};
