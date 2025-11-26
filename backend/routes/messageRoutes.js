const express = require('express');
const router = express.Router();
const { messageController } = require('../controllers');
const { authenticate } = require('../middlewares/auth');

router.post('/', authenticate, messageController.sendMessage);
router.get('/conversations', authenticate, messageController.getUserConversations);
router.get('/conversation/:userId', authenticate, messageController.getConversation);
router.put('/read/:userId', authenticate, messageController.markMessagesAsRead);

module.exports = router;
