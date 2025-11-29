const mongoose = require('mongoose');

const expoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  description: { type: String },
  theme: { type: String },
  image: { type: String }, // file path
  floorPlan: [{
    boothId: { type: String, required: true },
    position: { x: Number, y: Number },
    size: { width: Number, height: Number },
    available: { type: Boolean, default: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Exhibitor' }
  }],
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  revenue: { type: Number, default: 0 },
  totalAttendees: { type: Number, default: 0 },
  totalExhibitors: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

const Expo = mongoose.model('Expo', expoSchema);
module.exports = Expo;
