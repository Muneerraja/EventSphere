const express = require('express');
const router = express.Router();
const { applicationController } = require('../controllers');
const { authenticate, authorize } = require('../middlewares/auth');

router.get('/', applicationController.getApplications);
router.get('/my', authenticate, applicationController.getMyApplications);
router.get('/:id', authenticate, authorize(['admin', 'organizer']), applicationController.getApplication);
router.put('/:id/approve', applicationController.approveApplication);
router.put('/:id/reject', applicationController.rejectApplication);
router.post('/', authenticate, applicationController.submitApplication);

module.exports = router;
