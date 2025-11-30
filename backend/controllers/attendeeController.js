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
    let attendee = await Attendee.findOne({ user: userId }).populate('user').populate('registeredExpos').populate('bookmarkedSessions');

    // If attendee profile doesn't exist, create a default one
    if (!attendee) {
      attendee = new Attendee({
        user: userId,
        registeredExpos: [],
        bookmarkedSessions: []
      });
      await attendee.save();
      // Populate after saving
      attendee = await Attendee.findById(attendee._id).populate('user').populate('registeredExpos').populate('bookmarkedSessions');
    }

    res.json(attendee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMyAttendeeProfile = async (req, res) => {
  try {
    const attendee = await Attendee.findOne({ user: req.user.id }).populate('user').populate('registeredExpos').populate('bookmarkedSessions');
    if (!attendee) return res.status(404).json({ error: 'Attendee profile not found' });
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
    let attendee = await Attendee.findOne({ user: req.user.id });

    // If attendee profile doesn't exist, create one
    if (!attendee) {
      attendee = new Attendee({
        user: req.user.id,
        registeredExpos: [],
        bookmarkedSessions: []
      });
    }

    if (!attendee.registeredExpos.includes(expoId)) {
      attendee.registeredExpos.push(expoId);
      await attendee.save();

      // Populate for response
      attendee = await Attendee.findById(attendee._id).populate('user').populate('registeredExpos').populate('bookmarkedSessions');

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

    let attendee = await Attendee.findOne({ user: req.user.id });

    // If attendee profile doesn't exist, create one
    if (!attendee) {
      attendee = new Attendee({
        user: req.user.id,
        registeredExpos: [],
        bookmarkedSessions: []
      });
    }

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

    // Populate for response
    attendee = await Attendee.findById(attendee._id).populate('user').populate('registeredExpos').populate('bookmarkedSessions');

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
    let attendee = await Attendee.findOne({ user: req.user.id });

    // If attendee profile doesn't exist, create one
    if (!attendee) {
      attendee = new Attendee({
        user: req.user.id,
        registeredExpos: [],
        bookmarkedSessions: []
      });
    }

    if (!attendee.bookmarkedSessions.includes(sessionId)) {
      attendee.bookmarkedSessions.push(sessionId);
      await attendee.save();

      // Populate for response
      attendee = await Attendee.findById(attendee._id).populate('user').populate('registeredExpos').populate('bookmarkedSessions');

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
    const { sessionId } = req.params;
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

exports.bookmarkExpo = async (req, res) => {
  try {
    const { expoId } = req.body;
    let attendee = await Attendee.findOne({ user: req.user.id });

    // If attendee profile doesn't exist, create one
    if (!attendee) {
      attendee = new Attendee({
        user: req.user.id,
        registeredExpos: [],
        registeredSessions: [],
        bookmarkedSessions: [],
        bookmarkedExpos: []
      });
    }

    if (!attendee.bookmarkedExpos.includes(expoId)) {
      attendee.bookmarkedExpos.push(expoId);
      await attendee.save();

      // Populate for response
      attendee = await Attendee.findById(attendee._id).populate('user').populate('registeredExpos').populate('bookmarkedExpos').populate('bookmarkedSessions');

      // Emit real-time bookmark update
      if (global.emitToUser) {
        global.emitToUser(req.user.id, 'expo-bookmarked', {
          expoId,
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

exports.unbookmarkExpo = async (req, res) => {
  try {
    const { expoId } = req.params;
    const attendee = await Attendee.findOne({ user: req.user.id });
    if (!attendee) return res.status(404).json({ error: 'Attendee not found' });

    attendee.bookmarkedExpos = attendee.bookmarkedExpos.filter(id => id.toString() !== expoId);
    await attendee.save();

    // Emit real-time unbookmark update
    if (global.emitToUser) {
      global.emitToUser(req.user.id, 'expo-unbookmarked', {
        expoId,
        userId: req.user.id,
        timestamp: new Date()
      });
    }

    res.json(attendee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
