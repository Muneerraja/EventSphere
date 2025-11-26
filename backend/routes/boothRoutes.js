const express = require('express');
const router = express.Router();
const { boothController } = require('../controllers');
const { authenticate } = require('../middlewares/auth');

router.post('/', authenticate, boothController.createBooth);
router.post('/assign', authenticate, boothController.assignBooth);
router.put('/:id', authenticate, boothController.updateBooth);
router.get('/', authenticate, boothController.getBooths);
router.get('/:id', authenticate, boothController.getBooth);

module.exports = router;
