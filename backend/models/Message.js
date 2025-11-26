const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  conversationId: {
    type: String,
    required: true,
    default: function() {
      // Generate conversationId from sorted user IDs
      const ids = [this.sender.toString(), this.receiver.toString()].sort();
      return `${ids[0]}-${ids[1]}`;
    }
  },
  content: { type: String, required: true },
  type: { type: String, enum: ['text', 'appointment_request', 'system'], default: 'text' },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Index for conversation queries
messageSchema.index({ conversationId: 1, createdAt: -1 });

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;
