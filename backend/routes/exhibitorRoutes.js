const express = require('express');
const router = express.Router();
const { exhibitorController } = require('../controllers');
const { authenticate, authorize } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

router.post('/', authenticate, upload.single('logo'), exhibitorController.createExhibitor);
router.put('/:id', authenticate, upload.single('logo'), exhibitorController.updateExhibitor);
router.delete('/:id', authenticate, exhibitorController.deleteExhibitor);
router.put('/:id/approve', authenticate, authorize('organizer'), exhibitorController.approveExhibitor);
router.put('/:id/reject', authenticate, authorize('organizer'), exhibitorController.rejectExhibitor);
router.get('/search', authenticate, exhibitorController.searchExhibitors);
router.get('/public/search', exhibitorController.searchExhibitors); // Public search endpoint
router.get('/', authenticate, exhibitorController.getExhibitors);
router.get('/:id', authenticate, exhibitorController.getExhibitor);
router.get('/public/by-expo/:expoId', exhibitorController.getPublicExhibitorsByExpo);

module.exports = router;
