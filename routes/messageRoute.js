const express = require('express');
const authMiddleware = require('../middleware/auth');
const msgController = require('../controllers/messageController');

const router = express.Router();

router.post('/sendMsg',authMiddleware,msgController.sendMessage);
router.get("/getMessages", authMiddleware, msgController.getMessages);


module.exports = router;