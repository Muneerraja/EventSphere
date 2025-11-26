const express = require('express');
const router = express.Router();
const { notificationController } = require('../controllers');
const { authenticate } = require('../middlewares/auth');

router.get('/', authenticate, notificationController.getNotifications);
router.put('/:id/read', authenticate, notificationController.markAsRead);

module.exports = router;
