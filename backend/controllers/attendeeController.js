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
    }
    res.json(attendee);
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
    }
    res.json(attendee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.scheduleAppointment = async (req, res) => {
  try {
    const { exhibitorId, dateTime, message } = req.body;
    // Simple implementation, perhaps store in Attendee or create Appointment model
    const attendee = await Attendee.findOne({ user: req.user.id });
    if (!attendee) return res.status(404).json({ error: 'Attendee not found' });

    // Add to attendee's appointments or message
    // For now, just return success
    res.json({ message: 'Appointment scheduled' }); // placeholder
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
