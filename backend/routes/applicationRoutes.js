const express = require('express');
const router = express.Router();
const { applicationController } = require('../controllers');
const { authenticate, authorize } = require('../middlewares/auth');

router.get('/', authenticate, authorize(['admin', 'organizer']), applicationController.getApplications);
router.get('/:id', authenticate, authorize(['admin', 'organizer']), applicationController.getApplication);
router.put('/:id/approve', authenticate, authorize(['admin', 'organizer']), applicationController.approveApplication);
router.put('/:id/reject', authenticate, authorize(['admin', 'organizer']), applicationController.rejectApplication);
router.post('/', authenticate, applicationController.submitApplication);

module.exports = router;
