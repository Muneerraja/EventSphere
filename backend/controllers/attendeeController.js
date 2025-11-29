const { Attendee } = require('../models');

exports.createAttendee = async (req, res) => {
  try {
    const { registeredExpos, bookmarkedSessions } = req.body;
    const user = req.user.id;
    const attendee = new Attendee({ user, registeredExpos, bookmarkedSessions });
    await attendee.save();
    res.status(201).json(attendee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAttendees = async (req, res) => {
  try {
    const attendees = await Attendee.find().populate('user').populate('registeredExpos').populate('bookmarkedSessions');
    res.json(attendees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAttendee = async (req, res) => {
  try {
    const attendee = await Attendee.findById(req.params.id).populate('user').populate('registeredExpos').populate('bookmarkedSessions');
    if (!attendee) return res.status(404).json({ error: 'Attendee not found' });
    res.json(attendee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPublicAttendeeProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const attendee = await Attendee.findOne({ user: userId }).populate('user').populate('registeredExpos').populate('bookmarkedSessions');
    if (!attendee) return res.status(404).json({ error: 'Attendee not found' });
    res.json(attendee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateAttendee = async (req, res) => {
  try {
    const attendee = await Attendee.findById(req.params.id);
    if (!attendee) return res.status(404).json({ error: 'Attendee not found' });
    if (attendee.user.toString() !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });

    const updatedAttendee = await Attendee.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedAttendee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteAttendee = async (req, res) => {
  try {
    const attendee = await Attendee.findById(req.params.id);
    if (!attendee) return res.status(404).json({ error: 'Attendee not found' });
    if (attendee.user.toString() !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });

    await Attendee.findByIdAndDelete(req.params.id);
    res.json({ message: 'Attendee deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.registerForExpo = async (req, res) => {
  try {
    const { expoId } = req.body;
    const attendee = await Attendee.findOne({ user: req.user.id });
    if (!attendee) return res.status(404).json({ error: 'Attendee not found' });

    if (!attendee.registeredExpos.includes(expoId)) {
      attendee.registeredExpos.push(expoId);
      await attendee.save();

      // Emit real-time registration update
      if (global.emitToExpo) {
        global.emitToExpo(expoId, 'attendee-registered', {
          expoId,
          attendeeId: req.user.id,
          timestamp: new Date()
        });
      }
    }
    res.json(attendee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.registerForSession = async (req, res) => {
  try {
    const { sessionId } = req.body;

    // Check if session exists
    const { Session } = require('../models');
    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const attendee = await Attendee.findOne({ user: req.user.id });
    if (!attendee) return res.status(404).json({ error: 'Attendee not found' });

    // Check if attendee is registered for the expo
    if (!attendee.registeredExpos.includes(session.expo.toString())) {
      return res.status(400).json({ error: 'You must be registered for the expo to register for sessions' });
    }

    if (!attendee.registeredSessions.includes(sessionId)) {
      attendee.registeredSessions.push(sessionId);
      await attendee.save();

      // Update session attendance
      if (!session.attendance.includes(req.user.id)) {
        session.attendance.push(req.user.id);
        await session.save();

        // Emit real-time attendance update
        if (global.io) {
          global.io.to(`expo-${session.expo}`).emit('attendance-updated', {
            sessionId: session._id,
            attendanceCount: session.attendance.length
          });
        }
      }
    }

    res.json({
      message: 'Successfully registered for session',
      attendee
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.bookmarkSession = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const attendee = await Attendee.findOne({ user: req.user.id });
    if (!attendee) return res.status(404).json({ error: 'Attendee not found' });

    if (!attendee.bookmarkedSessions.includes(sessionId)) {
      attendee.bookmarkedSessions.push(sessionId);
      await attendee.save();

      // Emit real-time bookmark update
      if (global.emitToUser) {
        global.emitToUser(req.user.id, 'session-bookmarked', {
          sessionId,
          userId: req.user.id,
          timestamp: new Date()
        });
      }
    }
    res.json(attendee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.unbookmarkSession = async (req, res) => {
  try {
    const { sessionId } = req.params.sessionId || req.body.sessionId;
    const attendee = await Attendee.findOne({ user: req.user.id });
    if (!attendee) return res.status(404).json({ error: 'Attendee not found' });

    attendee.bookmarkedSessions = attendee.bookmarkedSessions.filter(id => id.toString() !== sessionId);
    await attendee.save();

    // Emit real-time unbookmark update
    if (global.emitToUser) {
      global.emitToUser(req.user.id, 'session-unbookmarked', {
        sessionId,
        userId: req.user.id,
        timestamp: new Date()
      });
    }

    res.json(attendee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.scheduleAppointment = async (req, res) => {
  try {
    const { exhibitorId, boothId, expoId, dateTime, duration = 30, purpose, notes } = req.body;

    // Validate required fields
    if (!exhibitorId || !expoId || !dateTime) {
      return res.status(400).json({ error: 'Exhibitor ID, Expo ID, and date/time are required' });
    }

    // Check if exhibitor exists and is approved for this expo
    const { Exhibitor, Appointment, Expo, Booth } = require('../models');
    const exhibitor = await Exhibitor.findOne({
      user: exhibitorId,
      expoApplication: expoId,
      status: 'approved'
    });

    if (!exhibitor) {
      return res.status(404).json({ error: 'Exhibitor not found or not approved for this expo' });
    }

    // Check if expo exists
    const expo = await Expo.findById(expoId);
    if (!expo) {
      return res.status(404).json({ error: 'Expo not found' });
    }

    // Check if booth belongs to the exhibitor (if boothId provided)
    let booth = null;
    if (boothId) {
      booth = await Booth.findOne({
        _id: boothId,
        exhibitor: exhibitor._id,
        status: 'assigned'
      });
      if (!booth) {
        return res.status(400).json({ error: 'Invalid booth for this exhibitor' });
      }
    }

    // Check for scheduling conflicts (basic check)
    const appointmentDateTime = new Date(dateTime);
    const endTime = new Date(appointmentDateTime.getTime() + (duration * 60000));

    const conflictingAppointment = await Appointment.findOne({
      exhibitor: exhibitorId,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        {
          dateTime: { $lt: endTime },
          $expr: { $gt: [{ $add: ['$dateTime', { $multiply: ['$duration', 60000] }] }, appointmentDateTime] }
        }
      ]
    });

    if (conflictingAppointment) {
      return res.status(400).json({ error: 'Time slot conflicts with existing appointment' });
    }

    // Create appointment
    const appointment = new Appointment({
      attendee: req.user.id,
      exhibitor: exhibitorId,
      booth: boothId || null,
      expo: expoId,
      dateTime: appointmentDateTime,
      duration,
      purpose,
      notes,
      status: 'pending'
    });

    await appointment.save();

    // Populate for response
    await appointment.populate([
      { path: 'attendee', select: 'username profile.firstName profile.lastName' },
      { path: 'exhibitor', select: 'username profile.firstName profile.lastName' },
      { path: 'booth' },
      { path: 'expo', select: 'title' }
    ]);

    // Create notification for exhibitor
    const { createNotification } = require('./notificationController');
    await createNotification(
      exhibitorId,
      'New Appointment Request',
      `You have a new appointment request from ${req.user.username}`,
      { appointmentId: appointment._id, attendeeId: req.user.id },
      true // Send email notification
    );

    res.status(201).json({
      message: 'Appointment scheduled successfully',
      appointment
    });
  } catch (error) {
    console.error('Error scheduling appointment:', error);
    res.status(500).json({ error: error.message });
  }
};
