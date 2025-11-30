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
router.delete('/unbookmark-session/:sessionId', authenticate, attendeeController.unbookmarkSession);
router.post('/bookmark-expo', authenticate, attendeeController.bookmarkExpo);
router.delete('/unbookmark-expo/:expoId', authenticate, attendeeController.unbookmarkExpo);
router.post('/schedule-appointment', authenticate, require('../controllers/appointmentController').createAppointment);
router.get('/', authenticate, attendeeController.getAttendees);
router.get('/:id', authenticate, attendeeController.getAttendee);
router.get('/public/profile/:userId', attendeeController.getPublicAttendeeProfile);
router.get('/profile/me', authenticate, attendeeController.getMyAttendeeProfile);

module.exports = router;
