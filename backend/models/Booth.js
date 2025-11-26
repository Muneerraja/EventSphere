const mongoose = require('mongoose');

const boothSchema = new mongoose.Schema({
  expo: { type: mongoose.Schema.Types.ObjectId, ref: 'Expo', required: true },
  exhibitor: { type: mongoose.Schema.Types.ObjectId, ref: 'Exhibitor', required: true },
  space: { type: String },
  products: [{ type: String }],
  contact: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const Booth = mongoose.model('Booth', boothSchema);
module.exports = Booth;
