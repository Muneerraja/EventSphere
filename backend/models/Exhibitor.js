const mongoose = require('mongoose');

const exhibitorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  company: { type: String, required: true },
  products: [{ type: String }],
  logo: { type: String },
  contact: { type: String },
  description: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  expoApplication: { type: mongoose.Schema.Types.ObjectId, ref: 'Expo' },
  booths: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Booth' }],
  createdAt: { type: Date, default: Date.now }
});

const Exhibitor = mongoose.model('Exhibitor', exhibitorSchema);
module.exports = Exhibitor;
