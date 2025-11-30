const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');

// Import appointment controller (we'll create this)
const appointmentController = require('../controllers/appointmentController');

router.post('/', authenticate, appointmentController.createAppointment);
router.get('/', authenticate, appointmentController.getAppointments);
router.get('/:id', authenticate, appointmentController.getAppointment);
router.put('/:id', authenticate, appointmentController.updateAppointment);
router.delete('/:id', authenticate, appointmentController.deleteAppointment);

// Get appointments for specific attendee
router.get('/attendee/:userId', authenticate, appointmentController.getAppointmentsByAttendee);

// Get appointments for specific exhibitor
router.get('/exhibitor/:userId', authenticate, appointmentController.getAppointmentsByExhibitor);

// Update appointment status (for exhibitors to confirm/cancel)
router.put('/:id/status', authenticate, appointmentController.updateAppointmentStatus);

module.exports = router;
