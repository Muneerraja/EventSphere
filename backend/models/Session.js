const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  expo: { type: mongoose.Schema.Types.ObjectId, ref: 'Expo', required: true },
  title: { type: String, required: true },
  time: { type: Date, required: true },
  speaker: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  topic: { type: String },
  location: { type: String },
  ratings: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, score: Number, comment: String }],
  attendance: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  materials: [{ type: String }], // file paths or URLs
  createdAt: { type: Date, default: Date.now }
});

const Session = mongoose.model('Session', sessionSchema);
module.exports = Session;
