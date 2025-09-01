// models/Conversation.js
const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
  organizer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  participant: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  event: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Event', 
    required: true 
    // This now represents the "current context" event, not necessarily the only event
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastMessageTime: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// Updated index: ensure one conversation per organizer-participant pair
ConversationSchema.index({ organizer: 1, participant: 1 }, { unique: true });

module.exports = mongoose.model('Conversation', ConversationSchema);
