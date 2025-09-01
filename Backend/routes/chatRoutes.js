// routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const mongoose = require('mongoose');
// Get conversations for logged-in user
router.get('/conversations', auth, async (req, res) => {
  try {
    console.log('User ID from auth middleware:', req.user.id);
    const userId = req.user.id;

    let conversations;

    console.log('Fetching conversations for user:', userId, 'isOrganizer:', req.user.isOrganizer);

    if (req.user.isOrganizer) {
      // **SIMPLIFIED APPROACH** - Get conversations directly without complex aggregation
      conversations = await Conversation.find({ 
        organizer: new mongoose.Types.ObjectId(userId),
        isActive: true 
      })
      .populate({
        path: 'participant',
        select: 'firstName lastName profileImage username email'
      })
      .populate({
        path: 'event',
        select: 'title date location'
      })
      .populate({
        path: 'lastMessage',
        select: 'content createdAt sender',
        populate: {
          path: 'sender',
          select: 'firstName lastName'
        }
      })
      .sort({ lastMessageTime: -1 });

    } else {
      // For users: get conversations where they are participants
      conversations = await Conversation.find({ 
        participant: new mongoose.Types.ObjectId(userId),
        isActive: true 
      })
      .populate({
        path: 'organizer',
        select: 'firstName lastName profileImage username email'
      })
      .populate({
        path: 'event',
        select: 'title date location'
      })
      .populate({
        path: 'lastMessage',
        select: 'content createdAt sender',
        populate: {
          path: 'sender',
          select: 'firstName lastName'
        }
      })
      .sort({ lastMessageTime: -1 });
    }

    console.log(`Found ${conversations.length} conversations for user ${userId}`, conversations);
    
    // **REMOVE DUPLICATES MANUALLY** if needed (for the unified conversation feature)
    if (req.user.isOrganizer) {
      // Group by participant and keep only the most recent conversation
      const conversationMap = new Map();
      conversations.forEach(conv => {
        const participantId = conv.participant._id.toString();
        if (!conversationMap.has(participantId) || 
            conv.lastMessageTime > conversationMap.get(participantId).lastMessageTime) {
          conversationMap.set(participantId, conv);
        }
      });
      conversations = Array.from(conversationMap.values());
    } else {
      // Group by organizer and keep only the most recent conversation
      const conversationMap = new Map();
      conversations.forEach(conv => {
        const organizerId = conv.organizer._id.toString();
        if (!conversationMap.has(organizerId) || 
            conv.lastMessageTime > conversationMap.get(organizerId).lastMessageTime) {
          conversationMap.set(organizerId, conv);
        }
      });
      conversations = Array.from(conversationMap.values());
    }

    // Sort again after deduplication
    conversations.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));

    console.log(`After deduplication: ${conversations.length} unique conversations`);
    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
// **MISSING ROUTE** - Get messages for a specific conversation
router.get('/conversations/:conversationId/messages', auth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    console.log(`Fetching messages for conversation: ${conversationId}`);

    // Verify conversation exists and user is part of it
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const userId = req.user.id;
    if (conversation.organizer.toString() !== userId && conversation.participant.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied to this conversation' });
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'firstName lastName profileImage email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

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

    const sortedMessages = messages.reverse();
    console.log(`Retrieved ${sortedMessages.length} messages for conversation ${conversationId}`);
    res.json(sortedMessages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// **MISSING ROUTE** - Send a message
router.post('/conversations/:conversationId/messages', auth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    console.log(`Sending message to conversation: ${conversationId}`);

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    // Verify conversation exists and user is part of it
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (conversation.organizer.toString() !== userId && conversation.participant.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied to this conversation' });
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
    await message.populate('sender', 'firstName lastName profileImage email');

    // Emit to socket room
    const io = req.app.get('io');
    if (io) {
      io.to(conversationId).emit('newMessage', message);
      console.log(`Message emitted to room ${conversationId}`);
    }

    console.log(`Message sent in conversation ${conversationId} by user ${userId}`);
    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Updated start conversation - find or create unified conversation
router.post('/conversations/start', auth, async (req, res) => {
  try {
    const { eventId } = req.body;
    const userId = req.user.id;

    if (!eventId) {
      return res.status(400).json({ message: 'Event ID is required' });
    }

    // Verify user has booked this event
    const booking = await Booking.findOne({ 
      user: userId, 
      event: eventId, 
      status: 'confirmed' 
    });

    if (!booking) {
      return res.status(403).json({ 
        message: 'You can only chat with organizers of events you have booked with confirmed status' 
      });
    }

    // Get event and organizer
    const event = await Event.findById(eventId).populate('createdBy', 'firstName lastName profileImage email');
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const organizerId = event.createdBy._id;

    // Look for ANY existing conversation between this user and organizer
    let conversation = await Conversation.findOne({
      participant: userId,
      organizer: organizerId
    }).sort({ lastMessageTime: -1 }); // Get the most recent one

    if (!conversation) {
      // Create new unified conversation
      conversation = new Conversation({
        event: eventId, // Initial event, but this represents the user-organizer relationship
        organizer: organizerId,
        participant: userId
      });
      await conversation.save();
      console.log(`New unified conversation created: ${conversation._id}`);
    } else {
      // Update the event reference to the most recent event they're interacting about
      conversation.event = eventId;
      await conversation.save();
    }

    // Populate conversation details
    await conversation.populate([
      { path: 'organizer', select: 'firstName lastName profileImage username email' },
      { path: 'event', select: 'title date location' }
    ]);

    res.json(conversation);
  } catch (error) {
    console.error('Error starting conversation:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Updated start organizer conversation - find or create unified conversation
router.post('/conversations/start-organizer', auth, async (req, res) => {
  try {
    const { eventId, attendeeId } = req.body;
    const organizerId = req.user.id;

    console.log('Starting unified organizer conversation:', { eventId, attendeeId, organizerId });

    if (!eventId || !attendeeId) {
      return res.status(400).json({ message: 'Event ID and Attendee ID are required' });
    }

    // Verify the organizer owns this event
    const event = await Event.findById(eventId);
    if (!event || event.createdBy.toString() !== organizerId) {
      return res.status(403).json({ 
        message: 'Access denied: You are not the organizer of this event' 
      });
    }

    // Verify the attendee has at least one confirmed booking with this organizer
    const organizerEvents = await Event.find({ createdBy: organizerId }).select('_id');
    const hasBookingWithOrganizer = await Booking.findOne({
      user: attendeeId,
      status: 'confirmed',
      event: { $in: organizerEvents.map(e => e._id) }
    });

    if (!hasBookingWithOrganizer) {
      return res.status(403).json({ 
        message: 'This user does not have any confirmed bookings for your events' 
      });
    }

    // Look for ANY existing conversation between this organizer and user
    let conversation = await Conversation.findOne({
      organizer: organizerId,
      participant: attendeeId
    }).sort({ lastMessageTime: -1 }); // Get the most recent one

    if (!conversation) {
      // Create new unified conversation
      conversation = new Conversation({
        event: eventId, // Initial event, but this represents the organizer-user relationship
        organizer: organizerId,
        participant: attendeeId
      });
      await conversation.save();
      console.log(`New unified organizer conversation created: ${conversation._id}`);
    } else {
      // Update the event reference to the current event they're discussing
      conversation.event = eventId;
      await conversation.save();
    }

    // Populate conversation details
    await conversation.populate([
      { path: 'participant', select: 'firstName lastName profileImage username email' },
      { path: 'organizer', select: 'firstName lastName profileImage username email' },
      { path: 'event', select: 'title date location' }
    ]);

    console.log('Created/Found unified conversation:', conversation._id);
    res.json(conversation);
  } catch (error) {
    console.error('Error starting organizer conversation:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// **MISSING ROUTE** - Mark messages as read
router.patch('/conversations/:conversationId/read', auth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    // Verify user is part of this conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (conversation.organizer.toString() !== userId && conversation.participant.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Mark messages as read
    const result = await Message.updateMany(
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

    res.json({ 
      message: 'Messages marked as read',
      modifiedCount: result.modifiedCount 
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new endpoint to get shared events between organizer and user
router.get('/conversations/:conversationId/shared-events', auth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    // Verify user is part of this conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (conversation.organizer.toString() !== userId && conversation.participant.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get all events where this organizer-participant pair have interactions
    const organizerId = conversation.organizer;
    const participantId = conversation.participant;

    const sharedEventIds = await Booking.find({ 
      user: participantId, 
      status: 'confirmed' 
    }).distinct('event');
    
    const sharedEvents = await Event.find({
      createdBy: organizerId,
      _id: { $in: sharedEventIds }
    }).select('title date location').sort({ date: -1 });

    res.json(sharedEvents);
  } catch (error) {
    console.error('Error fetching shared events:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
