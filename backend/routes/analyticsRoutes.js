const express = require('express');
const router = express.Router();
const { analyticsController } = require('../controllers');
const { authenticate } = require('../middlewares/auth');

router.get('/', authenticate, analyticsController.getPlatformAnalytics);
router.get('/expo/:id', authenticate, analyticsController.getExpoAnalytics);

module.exports = router;
