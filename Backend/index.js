// server.js
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const http = require('http');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const organizerDashboardRoutes = require('./routes/organizerDashboard');
const organizerEarningsRoutes = require('./routes/organizerEarningsRoutes');
const userDashboardRoutes = require('./routes/userDashboardRoutes');
const chatRoutes = require('./routes/chatRoutes');
const adminRoutes = require('./routes/adminRoute');
const contactRoutes = require('./routes/contactRoute')
// For real-time chat with Socket.io
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/organizer/dashboard', organizerDashboardRoutes);
app.use('/api/organizer/earnings', organizerEarningsRoutes);
app.use('/api/user/dashboard', userDashboardRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact',contactRoutes);
// Example test route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Connect Database
connectDB();

// Setup Socket.io for real-time chat
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join user to their personal room
  socket.on('userOnline', (userId) => {
    socket.userId = userId;
    socket.join(`user_${userId}`);
    socket.broadcast.emit('userOnline', userId);
    console.log(`User ${userId} joined personal room`);
  });

  // Join conversation room
  socket.on('joinConversation', (conversationId) => {
    socket.join(conversationId);
    console.log(`User ${socket.id} joined conversation: ${conversationId}`);
  });

  // Leave conversation room
  socket.on('leaveConversation', (conversationId) => {
    socket.leave(conversationId);
    console.log(`User ${socket.id} left conversation: ${conversationId}`);
  });

  // Handle typing status
  socket.on('typing', ({ conversationId, isTyping, userName }) => {
    console.log('Typing event:', { conversationId, isTyping, userName });
    socket.to(conversationId).emit('userTyping', { 
      isTyping, 
      userName, 
      conversationId 
    });
  });

  // Handle message sending (real-time broadcast)
  socket.on('sendMessage', (messageData) => {
    console.log('Broadcasting message:', messageData);
    socket.to(messageData.conversationId).emit('newMessage', messageData);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    if (socket.userId) {
      socket.broadcast.emit('userOffline', socket.userId);
    }
  });
});

app.set('io', io);

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
