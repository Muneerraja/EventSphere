const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/auth');

// Import feedback controller
const feedbackController = require('../controllers/feedbackController');

router.post('/', authenticate, feedbackController.createFeedback);
router.get('/', authenticate, feedbackController.getFeedbacks);
router.get('/user/:userId', authenticate, feedbackController.getUserFeedbacks);
router.get('/:id', authenticate, feedbackController.getFeedback);
router.put('/:id/status', authenticate, authorize('admin'), feedbackController.updateFeedbackStatus);
router.delete('/:id', authenticate, feedbackController.deleteFeedback);

module.exports = router;
