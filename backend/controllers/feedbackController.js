const { Feedback, User } = require('../models');

exports.createFeedback = async (req, res) => {
  try {
    const { type, targetId, rating, subject, message } = req.body;

    // Validate required fields
    if (!type || !subject || !message) {
      return res.status(400).json({ error: 'Type, subject, and message are required' });
    }

    // Validate rating if provided
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Validate type
    const validTypes = ['event', 'session', 'exhibitor', 'platform', 'general'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid feedback type' });
    }

    const feedback = new Feedback({
      user: req.user._id,
      type,
      targetId,
      rating,
      subject,
      message
    });

    await feedback.save();

    // Populate user data for response
    await feedback.populate('user', 'username profile.firstName profile.lastName');

    res.status(201).json({
      message: 'Feedback submitted successfully',
      feedback
    });
  } catch (error) {
    console.error('Error creating feedback:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getFeedbacks = async (req, res) => {
  try {
    const { type, status, userId } = req.query;
    let query = {};

    // Filter by type if provided
    if (type) query.type = type;

    // Filter by status if provided
    if (status) query.status = status;

    // Filter by user if provided (for user-specific feedback)
    if (userId) query.user = userId;

    const feedbacks = await Feedback.find(query)
      .populate('user', 'username profile.firstName profile.lastName')
      .populate('respondedBy', 'username profile.firstName profile.lastName')
      .sort({ createdAt: -1 });

    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id)
      .populate('user', 'username profile.firstName profile.lastName')
      .populate('respondedBy', 'username profile.firstName profile.lastName');

    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    // Check if user is authorized to view this feedback
    if (feedback.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to view this feedback' });
    }

    res.json(feedback);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserFeedbacks = async (req, res) => {
  try {
    const userId = req.params.userId || req.user._id;

    // Check if requesting user is the owner or an admin
    if (userId !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const feedbacks = await Feedback.find({ user: userId })
      .populate('respondedBy', 'username profile.firstName profile.lastName')
      .sort({ createdAt: -1 });

    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateFeedbackStatus = async (req, res) => {
  try {
    const { status, response } = req.body;

    // Only admins can update feedback status
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only administrators can update feedback status' });
    }

    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    feedback.status = status;

    if (response) {
      feedback.response = response;
      feedback.respondedBy = req.user._id;
      feedback.respondedAt = new Date();
    }

    await feedback.save();

    await feedback.populate([
      { path: 'user', select: 'username profile.firstName profile.lastName' },
      { path: 'respondedBy', select: 'username profile.firstName profile.lastName' }
    ]);

    res.json(feedback);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    // Only the feedback author or admin can delete
    if (feedback.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to delete this feedback' });
    }

    await Feedback.findByIdAndDelete(req.params.id);

    res.json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
