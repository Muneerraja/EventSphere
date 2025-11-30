const { Expo, Attendee, Session } = require('../models');

exports.createExpo = async (req, res) => {
  try {
    const { title, date, location, description, theme, floorPlan } = req.body;
    const image = req.file ? req.file.filename : null;

    // Parse floor plan data if provided
    let parsedFloorPlan = [];
    if (floorPlan) {
      try {
        parsedFloorPlan = JSON.parse(floorPlan);
      } catch (parseError) {
        console.error('Error parsing floor plan:', parseError);
        // Continue without floor plan if parsing fails
      }
    }

    const expo = new Expo({
      title,
      date,
      location,
      description,
      theme,
      image,
      floorPlan: parsedFloorPlan,
      organizer: req.user._id
    });

    await expo.save();

    // Emit real-time event for new expo creation
    if (global.emitToAll) {
      global.emitToAll('expo-created', {
        expoId: expo._id,
        title: expo.title,
        organizer: req.user._id,
        timestamp: new Date()
      });
    }

    res.status(201).json(expo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

  exports.updateExpo = async (req, res) => {
    try {
      const { title, date, location, description, theme, floorPlan } = req.body;
      const image = req.file ? req.file.filename : undefined;
      const expo = await Expo.findById(req.params.id);

      if (!expo) return res.status(404).json({ error: 'Expo not found' });

    // Check authorization - only admin or expo organizer can update
    if (req.user.role !== 'admin' && expo.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized to update this expo' });
    }

    // Parse floor plan data if provided
    let parsedFloorPlan = expo.floorPlan; // Keep existing by default
    if (floorPlan) {
      try {
        parsedFloorPlan = JSON.parse(floorPlan);
      } catch (parseError) {
        console.error('Error parsing floor plan:', parseError);
        // Keep existing floor plan if parsing fails
      }
    }

    const updateFields = { title, date, location, description, theme, floorPlan: parsedFloorPlan };
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
    const {
      search,
      theme,
      location,
      dateFrom,
      dateTo,
      sortBy = 'date',
      sortOrder = 'asc'
    } = req.query;

    let query = {};

    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { theme: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by theme
    if (theme && theme !== 'all') {
      query.theme = { $regex: theme, $options: 'i' };
    }

    // Filter by location
    if (location && location !== 'all') {
      query.location = { $regex: location, $options: 'i' };
    }

    // Date range filtering
    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) query.date.$gte = new Date(dateFrom);
      if (dateTo) query.date.$lte = new Date(dateTo);
    }

    // Sorting
    let sortOptions = {};
    switch (sortBy) {
      case 'date':
        sortOptions.date = sortOrder === 'desc' ? -1 : 1;
        break;
      case 'title':
        sortOptions.title = sortOrder === 'desc' ? -1 : 1;
        break;
      case 'location':
        sortOptions.location = sortOrder === 'desc' ? -1 : 1;
        break;
      default:
        sortOptions.date = 1;
    }

    const expos = await Expo.find(query)
      .populate('organizer')
      .sort(sortOptions);

    // Get unique themes and locations for filter options
    const allExpos = await Expo.find({}, 'theme location');
    const themes = [...new Set(allExpos.map(expo => expo.theme).filter(Boolean))];
    const locations = [...new Set(allExpos.map(expo => expo.location).filter(Boolean))];

    res.json({
      expos,
      filterOptions: {
        themes,
        locations
      }
    });
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
