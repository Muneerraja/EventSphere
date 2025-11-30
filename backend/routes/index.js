const express = require('express');
const router = express.Router();

router.use('/users', require('./userRoutes'));
router.use('/expos', require('./expoRoutes'));
router.use('/exhibitors', require('./exhibitorRoutes'));
router.use('/attendees', require('./attendeeRoutes'));
router.use('/sessions', require('./sessionRoutes'));
router.use('/booths', require('./boothRoutes'));
router.use('/analytics', require('./analyticsRoutes'));
router.use('/applications', require('./applicationRoutes'));
router.use('/settings', require('./settingsRoutes'));
router.use('/notifications', require('./notificationRoutes'));
router.use('/messages', require('./messageRoutes'));
router.use('/feedbacks', require('./feedbackRoutes'));
router.use('/appointments', require('./appointmentRoutes'));
router.use('/contact', require('./contactRoutes'));

module.exports = router;
