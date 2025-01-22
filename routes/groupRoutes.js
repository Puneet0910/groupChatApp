const express = require("express");
const groupController = require("../controllers/groupController");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.post("/addGroup", authMiddleware, groupController.createGroup);
router.get("/userGroups", authMiddleware, groupController.getUserGroups);

module.exports = router;
