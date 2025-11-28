const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  expo: { type: mongoose.Schema.Types.ObjectId, ref: 'Expo', required: true },
  title: { type: String, required: true },
  time: { type: Date, required: true },
  speaker: { type: String }, // Changed from ObjectId ref to String for speaker name
  topic: { type: String },
  location: { type: String },
  duration: { type: Number, default: 60 }, // Duration in minutes
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },
  description: { type: String },
  ratings: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, score: Number, comment: String }],
  attendance: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  materials: [{ type: String }], // file paths or URLs
  rejectionReason: { type: String },
  approvedDate: { type: Date },
  rejectedDate: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

const Session = mongoose.model('Session', sessionSchema);
module.exports = Session;
