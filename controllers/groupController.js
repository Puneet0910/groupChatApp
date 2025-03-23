const Group = require('../models/group');
const User = require('../models/userModel');
const GroupMember = require('../models/groupMember');

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
          model: GroupMember,
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
