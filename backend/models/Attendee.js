const mongoose = require('mongoose');

const attendeeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  registeredExpos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Expo' }],
  registeredSessions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Session' }],
  bookmarkedSessions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Session' }],
  createdAt: { type: Date, default: Date.now }
});

const Attendee = mongoose.model('Attendee', attendeeSchema);
module.exports = Attendee;
