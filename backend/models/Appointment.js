const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  attendee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  exhibitor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  booth: { type: mongoose.Schema.Types.ObjectId, ref: 'Booth' },
  expo: { type: mongoose.Schema.Types.ObjectId, ref: 'Expo', required: true },
  dateTime: { type: Date, required: true },
  duration: { type: Number, default: 30 }, // Duration in minutes
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed'], default: 'pending' },
  purpose: { type: String },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const Appointment = mongoose.model('Appointment', appointmentSchema);
module.exports = Appointment;
