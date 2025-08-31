// routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Your authentication middleware
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Booking = require('../models/Booking');
const Event = require('../models/Event');

// Get conversations for logged-in user
router.get('/conversations', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    let conversations;

    if (req.user.isOrganizer) {
      // For organizers: get conversations from their events
      conversations = await Conversation.find({ organizer: userId })
        .populate({
          path: 'participant',
          select: 'firstName lastName profileImage username'
        })
        .populate({
          path: 'event',
          select: 'title'
        })
        .populate({
          path: 'lastMessage',
          select: 'content createdAt sender'
        })
        .sort({ lastMessageTime: -1 });
    } else {
      // For users: get conversations where they are participants
      conversations = await Conversation.find({ participant: userId })
        .populate({
          path: 'organizer',
          select: 'firstName lastName profileImage username'
        })
        .populate({
          path: 'event',
          select: 'title'
        })
        .populate({
          path: 'lastMessage',
          select: 'content createdAt sender'
        })
        .sort({ lastMessageTime: -1 });
    }

    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get messages for a specific conversation
router.get('/conversations/:conversationId/messages', auth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Verify user is part of this conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const userId = req.user.id;
    if (conversation.organizer.toString() !== userId && conversation.participant.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'firstName lastName profileImage')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Mark messages as read if user is the recipient
    await Message.updateMany(
      { 
        conversation: conversationId, 
        sender: { $ne: userId },
        isRead: false 
      },
      { 
        isRead: true, 
        readAt: new Date() 
      }
    );

    res.json(messages.reverse());
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send a message
router.post('/conversations/:conversationId/messages', auth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    // Verify conversation exists and user is part of it
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (conversation.organizer.toString() !== userId && conversation.participant.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Create message
    const message = new Message({
      conversation: conversationId,
      sender: userId,
      content: content.trim()
    });

    await message.save();

    // Update conversation's last message
    conversation.lastMessage = message._id;
    conversation.lastMessageTime = new Date();
    await conversation.save();

    // Populate sender info for response
    await message.populate('sender', 'firstName lastName profileImage');

    // Emit to socket room
    const io = req.app.get('io');
    io.to(conversationId).emit('newMessage', message);

    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start conversation (when user wants to chat with event organizer)
router.post('/conversations/start', auth, async (req, res) => {
  try {
    const { eventId } = req.body;
    const userId = req.user.id;

    // Verify user has booked this event
    const booking = await Booking.findOne({ 
      user: userId, 
      event: eventId, 
      status: 'confirmed' 
    });

    if (!booking) {
      return res.status(403).json({ 
        message: 'You can only chat with organizers of events you have booked' 
      });
    }

    // Get event and organizer
    const event = await Event.findById(eventId).populate('createdBy');
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      event: eventId,
      participant: userId
    });

    if (!conversation) {
      // Create new conversation
      conversation = new Conversation({
        event: eventId,
        organizer: event.createdBy._id,
        participant: userId
      });
      await conversation.save();
    }

    // Populate conversation details
    await conversation.populate([
      { path: 'organizer', select: 'firstName lastName profileImage username' },
      { path: 'event', select: 'title' }
    ]);

    res.json(conversation);
  } catch (error) {
    console.error('Error starting conversation:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
