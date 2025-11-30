const { Session, Expo } = require('../models');

exports.createSession = async (req, res) => {
  try {
    const { expo, title, time, speaker, topic, location } = req.body;

    // Auth check: only organizer of the expo can create sessions
    const expoDoc = await Expo.findById(expo);
    if (!expoDoc) return res.status(404).json({ error: 'Expo not found' });
    if (expoDoc.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized to create sessions for this expo' });
    }

    // Check conflict
    const existingSession = await Session.findOne({ expo, time, location });
    if (existingSession) return res.status(400).json({ error: 'Time and location conflict' });

    const session = new Session({ expo, title, time, speaker, topic, location });
    await session.save();

    // Populate expo data for response
    await session.populate('expo');

    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateSession = async (req, res) => {
  try {
    const { title, time, speaker, topic, location } = req.body;
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    // Auth check: only organizer of the expo can modify sessions
    const expo = await Expo.findById(session.expo);
    if (expo.organizer.toString() !== req.user._id.toString()) return res.status(403).json({ error: 'Unauthorized' });

    // Check conflict if time/location changed
    if (time !== session.time || location !== session.location) {
      const conflict = await Session.findOne({ expo: session.expo, time, location, _id: { $ne: req.params.id } });
      if (conflict) return res.status(400).json({ error: 'Time and location conflict' });
    }

    const updatedSession = await Session.findByIdAndUpdate(req.params.id, { title, time, speaker, topic, location }, { new: true });

    // Real-time broadcast to expo room
    if (global.io) {
      global.io.to(`expo-${session.expo}`).emit('session-updated', {
        sessionId: req.params.id,
        session: updatedSession
      });
    }

    res.json(updatedSession);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    // Auth check: only organizer of the expo can delete sessions
    const expo = await Expo.findById(session.expo);
    if (expo.organizer.toString() !== req.user._id.toString()) return res.status(403).json({ error: 'Unauthorized' });

    await Session.findByIdAndDelete(req.params.id);
    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.rateSession = async (req, res) => {
  try {
    const { score, comment } = req.body;
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    // Add or update rating
    const existingRatingIndex = session.ratings.findIndex(r => r.user.toString() === req.user.id);
    if (existingRatingIndex > -1) {
      session.ratings[existingRatingIndex] = { user: req.user.id, score, comment };
    } else {
      session.ratings.push({ user: req.user.id, score, comment });
    }
    await session.save();
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.trackAttendance = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    if (!session.attendance.includes(req.user.id)) {
      session.attendance.push(req.user.id);
      await session.save();

      // Real-time broadcast attendance update
      if (global.io) {
        global.io.to(`expo-${session.expo}`).emit('attendance-updated', {
          sessionId: req.params.id,
          attendanceCount: session.attendance.length
        });
      }
    }
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addMaterials = async (req, res) => {
  try {
    const materials = req.files ? req.files.map(f => f.filename) : [];
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    session.materials.push(...materials);
    await session.save();
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSessions = async (req, res) => {
  try {
    const sessions = await Session.find().populate('expo');
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id).populate('expo');
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPublicSessionsByExpo = async (req, res) => {
  try {
    const { expoId } = req.params;
    const sessions = await Session.find({ expo: expoId }).populate('expo');
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPublicSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id).populate('expo');
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
