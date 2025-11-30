const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['event', 'session', 'exhibitor', 'platform', 'general'],
    required: true
  },
  targetId: { type: mongoose.Schema.Types.ObjectId }, // ID of the event/session/exhibitor being rated
  rating: { type: Number, min: 1, max: 5 }, // For ratings
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved'],
    default: 'pending'
  },
  response: { type: String }, // Admin response
  respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  respondedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

const Feedback = mongoose.model('Feedback', feedbackSchema);
module.exports = Feedback;
