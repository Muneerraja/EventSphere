const express = require('express');
const router = express.Router();
const { attendeeController } = require('../controllers');
const { authenticate } = require('../middlewares/auth');

router.post('/', authenticate, attendeeController.createAttendee);
router.put('/:id', authenticate, attendeeController.updateAttendee);
router.delete('/:id', authenticate, attendeeController.deleteAttendee);
router.post('/register-expo', authenticate, attendeeController.registerForExpo);
router.post('/register-session', authenticate, attendeeController.registerForSession);
router.post('/bookmark-session', authenticate, attendeeController.bookmarkSession);
router.post('/schedule-appointment', authenticate, attendeeController.scheduleAppointment);
router.get('/', authenticate, attendeeController.getAttendees);
router.get('/:id', authenticate, attendeeController.getAttendee);
router.get('/public/profile/:userId', attendeeController.getPublicAttendeeProfile);

module.exports = router;
