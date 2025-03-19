const Group = require('../models/group');
const User = require('../models/userModel');

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