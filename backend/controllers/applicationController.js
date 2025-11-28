const { Exhibitor, Expo, User, Session } = require('../models');

exports.getApplications = async (req, res) => {
  try {
    let userExpos = [];
    if (req.user.role === 'organizer') {
      // Get expos organized by this user
      userExpos = await Expo.find({ organizer: req.user.id }).select('_id');
      userExpos = userExpos.map(expo => expo._id.toString());
    }

    // Get all pending applications: exhibitor applications and session requests
    const [exhibitorApplications, pendingSessions] = await Promise.all([
      Exhibitor.find({ status: 'pending' })
        .populate('user', 'profile.firstName profile.lastName username')
        .populate('expoApplication', 'title date location')
        .sort({ createdAt: -1 }),
      Session.find({ status: 'pending' })
        .populate('speaker', 'profile.firstName profile.lastName username')
        .populate('expo', 'title date location')
        .sort({ createdAt: -1 })
    ]);

    // Filter applications if user is organizer
    let filteredExhibitorApps = exhibitorApplications;
    let filteredSessionApps = pendingSessions;

    if (req.user.role === 'organizer') {
      filteredExhibitorApps = exhibitorApplications.filter(app =>
        userExpos.includes(app.expoApplication._id.toString())
      );
      filteredSessionApps = pendingSessions.filter(app =>
        userExpos.includes(app.expo._id.toString())
      );
    }

    // Format exhibitor applications
    const formattedExhibitorApps = filteredExhibitorApps.map(exhibitor => ({
      id: exhibitor._id,
      type: 'exhibitor',
      status: exhibitor.status,
      submittedDate: exhibitor.createdAt,
      applicant: {
        id: exhibitor.user._id,
        name: `${exhibitor.user.profile.firstName} ${exhibitor.user.profile.lastName}`,
        email: exhibitor.contact,
        type: exhibitor.company
      },
      expo: {
        id: exhibitor.expoApplication._id,
        title: exhibitor.expoApplication.title,
        date: exhibitor.expoApplication.date
      },
      documents: [], // Files would be stored separately
      notes: exhibitor.description,
      priority: 'medium' // Can be enhanced later
    }));

    // Format session applications
    const formattedSessionApps = filteredSessionApps.map(session => ({
      id: session._id,
      type: 'session',
      status: session.status,
      submittedDate: session.createdAt,
      applicant: {
        id: session.speaker._id,
        name: `${session.speaker.profile.firstName} ${session.speaker.profile.lastName}`,
        email: '', // Not in session model
        type: 'Speaker'
      },
      expo: {
        id: session.expo._id,
        title: session.expo.title,
        date: session.expo.date
      },
      sessionDetails: {
        title: session.title,
        duration: `${Math.floor(session.duration / 60)} minutes`, // Convert to minutes
        expectedAttendees: 150 // Default estimate
      },
      notes: session.description,
      priority: 'low' // Can be enhanced later
    }));

    res.json([...formattedExhibitorApps, ...formattedSessionApps]);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getApplication = async (req, res) => {
  try {
    const { id } = req.params;

    // Try to find as exhibitor application first
    let application = await Exhibitor.findById(id)
      .populate('user', 'profile.firstName profile.lastName username')
      .populate('expoApplication', 'title date location organizer');

    if (application) {
      // Check if organizer owns the expo
      if (req.user.role === 'organizer' && application.expoApplication.organizer.toString() !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized to view this application' });
      }

      res.json({
        id: application._id,
        type: 'exhibitor',
        status: application.status,
        submittedDate: application.createdAt,
        applicant: {
          id: application.user._id,
          name: `${application.user.profile.firstName} ${application.user.profile.lastName}`,
          email: application.contact,
          type: application.company
        },
        expo: {
          id: application.expoApplication._id,
          title: application.expoApplication.title,
          date: application.expoApplication.date
        },
        documents: [],
        notes: application.description
      });
      return;
    }

    // Try to find as session application
    application = await Session.findById(id)
      .populate('speaker', 'profile.firstName profile.lastName username')
      .populate('expo', 'title date location organizer');

    if (application) {
      // Check if organizer owns the expo
      if (req.user.role === 'organizer' && application.expo.organizer.toString() !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized to view this application' });
      }

      res.json({
        id: application._id,
        type: 'session',
        status: application.status,
        submittedDate: application.createdAt,
        applicant: {
          id: application.speaker._id,
          name: `${application.speaker.profile.firstName} ${application.speaker.profile.lastName}`,
          email: '',
          type: 'Speaker'
        },
        expo: {
          id: application.expo._id,
          title: application.expo.title,
          date: application.expo.date
        },
        sessionDetails: {
          title: application.title,
          duration: `${Math.floor(application.duration / 60)} minutes`,
          expectedAttendees: 150
        },
        notes: application.description
      });
      return;
    }

    res.status(404).json({ error: 'Application not found' });
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.approveApplication = async (req, res) => {
  try {
    const { id } = req.params;

    // Try to approve exhibitor application
    let application = await Exhibitor.findById(id).populate('expoApplication');

    if (application) {
      // Check if organizer owns the expo
      if (req.user.role === 'organizer' && application.expoApplication.organizer.toString() !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized to approve this application' });
      }

      application = await Exhibitor.findByIdAndUpdate(
        id,
        { status: 'approved', approvedDate: new Date() },
        { new: true }
      ).populate('user').populate('expoApplication');

      res.json(application);
      return;
    }

    // Try to approve session application
    application = await Session.findById(id).populate('expo');

    if (application) {
      // Check if organizer owns the expo
      if (req.user.role === 'organizer' && application.expo.organizer.toString() !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized to approve this application' });
      }

      application = await Session.findByIdAndUpdate(
        id,
        { status: 'approved', approvedDate: new Date() },
        { new: true }
      ).populate('speaker').populate('expo');

      res.json(application);
      return;
    }

    res.status(404).json({ error: 'Application not found' });
  } catch (error) {
    console.error('Error approving application:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.rejectApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Try to reject exhibitor application
    let application = await Exhibitor.findById(id).populate('expoApplication');

    if (application) {
      // Check if organizer owns the expo
      if (req.user.role === 'organizer' && application.expoApplication.organizer.toString() !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized to reject this application' });
      }

      application = await Exhibitor.findByIdAndUpdate(
        id,
        { status: 'rejected', rejectionReason: reason, rejectedDate: new Date() },
        { new: true }
      ).populate('user').populate('expoApplication');

      res.json(application);
      return;
    }

    // Try to reject session application
    application = await Session.findById(id).populate('expo');

    if (application) {
      // Check if organizer owns the expo
      if (req.user.role === 'organizer' && application.expo.organizer.toString() !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized to reject this application' });
      }

      application = await Session.findByIdAndUpdate(
        id,
        { status: 'rejected', rejectionReason: reason, rejectedDate: new Date() },
        { new: true }
      ).populate('speaker').populate('expo');

      res.json(application);
      return;
    }

    res.status(404).json({ error: 'Application not found' });
  } catch (error) {
    console.error('Error rejecting application:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.submitApplication = async (req, res) => {
  try {
    const { type, expoId, company, products, description } = req.body;

    if (type === 'exhibitor') {
      const exhibitor = new Exhibitor({
        user: req.user.id,
        company,
        products: products || [],
        contact: req.user.email,
        description,
        status: 'pending',
        expoApplication: expoId
      });
      await exhibitor.save();
      res.status(201).json(exhibitor);
    } else {
      // For session applications, create in Session model
      const { title, duration, expectedAttendees } = req.body;
      const session = new Session({
        title,
        description,
        speaker: req.user.id,
        duration: duration * 60, // Convert to seconds
        expo: expoId,
        status: 'pending'
      });
      await session.save();
      res.status(201).json(session);
    }
  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({ error: error.message });
  }
};
