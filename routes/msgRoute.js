const express = require('express');
const authMiddleware = require('../Middleware/auth')
const msgController = require('../controllers/msgController');

const router = express.Router();

router.post('/sendMsg', authMiddleware,msgController.sendMessage);
router.get('/getChats', authMiddleware, msgController.getMsg);
module.exports = router;