const express = require("express");
const groupController = require("../controllers/groupController");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.post("/createGroup", authMiddleware, groupController.createGroup);
router.get("/getGroups", authMiddleware, groupController.getGroups);

module.exports = router;
