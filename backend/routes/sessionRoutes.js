const express = require('express');
const router = express.Router();
const { sessionController } = require('../controllers');
const { authenticate } = require('../middlewares/auth');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.post('/', authenticate, sessionController.createSession);
router.put('/:id', authenticate, sessionController.updateSession);
router.delete('/:id', authenticate, sessionController.deleteSession);
router.post('/:id/rate', authenticate, sessionController.rateSession);
router.post('/:id/attend', authenticate, sessionController.trackAttendance);
router.post('/:id/materials', authenticate, upload.array('materials'), sessionController.addMaterials);
router.get('/', authenticate, sessionController.getSessions);
router.get('/:id', authenticate, sessionController.getSession);
router.get('/public/by-expo/:expoId', sessionController.getPublicSessionsByExpo);

module.exports = router;
