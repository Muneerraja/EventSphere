const express = require('express');
const router = express.Router();
const { feedbackController } = require('../controllers');
const { authenticate } = require('../middlewares/auth');

router.post('/', authenticate, feedbackController.createFeedback);
router.get('/', authenticate, feedbackController.getFeedbacks);
router.get('/:id', authenticate, feedbackController.getFeedback);

module.exports = router;
