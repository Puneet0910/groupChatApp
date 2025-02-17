const express = require("express");
const groupController = require("../controllers/groupController");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.post("/createGroup", authMiddleware, groupController.createGroup);
router.post("/inviteUser", authMiddleware, groupController.inviteUser);
router.get("/userGroups", authMiddleware, groupController.getUserGroups);
router.delete("/leave/:groupId", authMiddleware, groupController.leaveGroup);

module.exports = router;
