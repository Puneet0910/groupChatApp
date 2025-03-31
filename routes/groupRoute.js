const express = require("express");
const groupController = require("../controllers/groupController");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.post("/createGroup", authMiddleware, groupController.createGroup);
router.get("/getGroups", authMiddleware, groupController.getGroups);
router.post("/addUserToGroup", authMiddleware, groupController.addUserToGroup);
router.delete("/deleteGroup", authMiddleware, groupController.deleteGroup);
router.get( "/getGroupMessages", authMiddleware, groupController.getGroupMessages );
router.post( "/removeUserFromGroup", authMiddleware, groupController.removeUserFromGroup );
router.get( "/getGroupMembers", authMiddleware, groupController.getGroupMembers );

module.exports = router;
