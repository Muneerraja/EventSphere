const express = require('express');
const router = express.Router();
const { settingsController } = require('../controllers');
const { authenticate, authorize } = require('../middlewares/auth');

router.get('/', authenticate, settingsController.getSettings);
router.put('/', authenticate, authorize('admin'), settingsController.updateSettings);

module.exports = router;
