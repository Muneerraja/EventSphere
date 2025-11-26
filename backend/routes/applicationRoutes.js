const express = require('express');
const router = express.Router();
const { applicationController } = require('../controllers');
const { authenticate, authorize } = require('../middlewares/auth');

router.get('/', authenticate, authorize('admin'), applicationController.getApplications);
router.get('/:id', authenticate, authorize('admin'), applicationController.getApplication);
router.put('/:id/approve', authenticate, authorize('admin'), applicationController.approveApplication);
router.put('/:id/reject', authenticate, authorize('admin'), applicationController.rejectApplication);
router.post('/', authenticate, applicationController.submitApplication);

module.exports = router;
