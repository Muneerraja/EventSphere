const mongoose = require('mongoose');

const boothSchema = new mongoose.Schema({
  expo: { type: mongoose.Schema.Types.ObjectId, ref: 'Expo', required: true },
  exhibitor: { type: mongoose.Schema.Types.ObjectId, ref: 'Exhibitor' },
  boothNumber: { type: String, required: true },
  size: { type: String, enum: ['basic', 'standard', 'premium', 'deluxe'], default: 'standard' },
  price: { type: Number, default: 0 },
  location: { type: String },
  features: [{ type: String }],
  status: { type: String, enum: ['available', 'assigned', 'occupied', 'maintenance'], default: 'available' },
  assignedTo: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'Exhibitor' },
    companyName: { type: String },
    contactEmail: { type: String }
  },
  space: { type: String }, // For backward compatibility
  products: [{ type: String }],
  contact: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const Booth = mongoose.model('Booth', boothSchema);
module.exports = Booth;
