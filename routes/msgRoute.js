const express = require('express');
const authMiddleware = require('../Middleware/auth')
const msgController = require('../controllers/msgController');

const router = express.Router();

router.post('/sendMsg', authMiddleware,msgController.sendMessage);

module.exports = router;