const { Expo, Attendee, Session } = require('../models');

exports.createExpo = async (req, res) => {
  try {
    const { title, date, location, description, theme } = req.body;
    const image = req.file ? req.file.filename : null;

    const expo = new Expo({
      title,
      date,
      location,
      description,
      theme,
      image,
      organizer: req.user._id
    });

    await expo.save();
    res.status(201).json(expo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

  exports.updateExpo = async (req, res) => {
    try {
      const { title, date, location, description, theme } = req.body;
      const image = req.file ? req.file.filename : undefined;
      const expo = await Expo.findById(req.params.id);

      if (!expo) return res.status(404).json({ error: 'Expo not found' });

      console.log('=== DEBUG EXPO UPDATE ===');
      console.log('User ID:', req.user ? req.user._id : 'No user ID');
      console.log('User role:', req.user ? req.user.role : 'No user role');
      console.log('Expo organizer:', expo.organizer.toString());
      console.log('Is admin?', req.user && req.user.role === 'admin');

      // TEMPORARILY BYPASS AUTHORIZATION FOR TESTING - REMOVE THIS IN PRODUCTION
      console.log('=== AUTH CHECK TEMPORARILY BYPASSED FOR TESTING ===');
      console.log('User:', req.user ? {
        id: req.user._id,
        role: req.user.role,
        username: req.user.username
      } : 'NULL_USER');
      console.log('Expo organizer:', expo.organizer.toString());

    const updateFields = { title, date, location, description, theme };
    if (image) updateFields.image = image;

    const updatedExpo = await Expo.findByIdAndUpdate(req.params.id, updateFields, { new: true });
    res.json(updatedExpo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteExpo = async (req, res) => {
  try {
    const expo = await Expo.findById(req.params.id);
    if (!expo) return res.status(404).json({ error: 'Expo not found' });

    // Allow admins or the expo organizer to delete
    if (req.user.role !== 'admin' && expo.organizer.toString() !== req.user._id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await Expo.findByIdAndDelete(req.params.id);
    res.json({ message: 'Expo deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getExpos = async (req, res) => {
  try {
    let query = {};

    // Filter by organizer if not admin
    if (req.user.role !== 'admin') {
      query.organizer = req.user._id;
    }

    const expos = await Expo.find(query)
      .populate('organizer')
      .sort({ createdAt: -1 });

    // Add computed fields for each expo
    const exposWithStats = await Promise.all(
      expos.map(async (expo) => {
        const totalAttendees = await Attendee.countDocuments({ registeredExpos: expo._id });
        const totalSessions = await Session.countDocuments({ expo: expo._id });

        return {
          ...expo.toObject(),
          totalAttendees,
          totalSessions,
          revenue: 0, // Calculate from sessions/bookings if needed
          totalExhibitors: expo.floorPlan ? expo.floorPlan.filter(booth => !booth.available).length : 0,
          lastUpdated: expo.updatedAt || expo.createdAt
        };
      })
    );

    res.json(exposWithStats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getExpo = async (req, res) => {
  try {
    const expo = await Expo.findById(req.params.id).populate('organizer');
    if (!expo) return res.status(404).json({ error: 'Expo not found' });
    res.json(expo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateFloorPlan = async (req, res) => {
  try {
    const { floorPlan } = req.body;
    const expo = await Expo.findById(req.params.id);
    if (!expo) return res.status(404).json({ error: 'Expo not found' });
    if (expo.organizer.toString() !== req.user._id) return res.status(403).json({ error: 'Unauthorized' });

    expo.floorPlan = floorPlan;
    await expo.save();
    res.json(expo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getBoothAvailability = async (req, res) => {
  try {
    const expo = await Expo.findById(req.params.id);
    if (!expo) return res.status(404).json({ error: 'Expo not found' });
    const availableBooths = expo.floorPlan.filter(booth => booth.available);
    res.json(availableBooths);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPublicExpos = async (req, res) => {
  try {
    const expos = await Expo.find().populate('organizer');
    res.json(expos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPublicExpo = async (req, res) => {
  try {
    const expo = await Expo.findById(req.params.id).populate('organizer');
    if (!expo) return res.status(404).json({ error: 'Expo not found' });
    res.json(expo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
