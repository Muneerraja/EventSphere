const express = require('express');
const router = express.Router();
const { expoController } = require('../controllers');
const { authenticate } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

router.post('/', authenticate, upload.single('image'), expoController.createExpo);
router.put('/:id', authenticate, upload.single('image'), expoController.updateExpo);
router.delete('/:id', authenticate, expoController.deleteExpo);
router.get('/', authenticate, expoController.getExpos);
router.get('/:id', authenticate, expoController.getExpo);
router.get('/public/expos', expoController.getPublicExpos);
router.get('/public/:id', expoController.getPublicExpo);
router.put('/:id/floor-plan', authenticate, expoController.updateFloorPlan);
router.get('/:id/booths/availability', authenticate, expoController.getBoothAvailability);

module.exports = router;
