const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { nanoid } = require('nanoid'); // Add this import
const Booking = require('../models/Booking');

// Register new user - Modified to generate username automatically
exports.registerUser = async (req, res) => {
  console.log('Registration attempt');
  try {
    const { email, password, firstName, lastName, role } = req.body; 

    let username;
    let isUsernameUnique = false;
    
    while (!isUsernameUnique) {
      username = nanoid(10);
      
      const existingUsername = await User.findOne({ username });
      if (!existingUsername) {
        isUsernameUnique = true;
      }
    }
    
    console.log('Generated unique username:', username);
    
    // Check if user exists by email only (since username is auto-generated)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'User already exists with this email address' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new User({
      username, 
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: role || 'user'
    });

    const savedUser = await newUser.save();
    const token = jwt.sign(
      { userId: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    const { password: _, ...userWithoutPassword } = savedUser.toObject();
    
    console.log('User registered successfully:', userWithoutPassword.email);
    
    res.status(201).json({
      message: 'User registered successfully',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Login user (no changes needed)
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    if(user.role==='organizer' && !user.isOrganizer){
      return res.status(403).json({ message: 'Organizer account not approved yet' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...userWithoutPassword } = user.toObject();

    res.json({
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user profile (no changes needed)
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user profile (no changes needed)
exports.updateUserProfile = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.userId, 
      { ...req.body, updatedAt: Date.now() }, 
      { new: true, select: '-password' }
    );
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
// Add these methods to your existing userController.js

// Get current user profile
exports.getCurrentUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Update user profile
exports.updateCurrentUserProfile = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, location, bio } = req.body;
    
    // Check if email is already taken by another user
    if (email) {
      const existingUser = await User.findOne({ 
        email, 
        _id: { $ne: req.userId } 
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email is already taken by another user'
        });
      }
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      req.userId, 
      { 
        firstName, 
        lastName, 
        email, 
        phone, 
        location, 
        bio,
        updatedAt: Date.now() 
      }, 
      { 
        new: true, 
        select: '-password',
        runValidators: true
      }
    );
    
    if (!updatedUser) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: updatedUser }
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }
    
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    
    // Update password
    await User.findByIdAndUpdate(req.userId, { 
      password: hashedNewPassword,
      updatedAt: Date.now()
    });
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Generate user data export
exports.downloadUserData = async (req, res) => {
  try {
    const userId = req.userId;
    console.log('Data export requested for user ID:', userId);
    // Get user data
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    console.log('User data found for export:', user.email);
    // Get user's bookings
    const bookings = await Booking.find({ user: userId })
      .populate('event', 'title date location price category')
      .select('-__v')
      .lean();
    
    // Prepare export data
    const exportData = {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone || '',
        location: user.location || '',
        bio: user.bio || '',
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      bookings: bookings.map(booking => ({
        id: booking._id,
        bookingReference: booking.bookingReference,
        eventTitle: booking.event?.title || 'Event not found',
        eventDate: booking.event?.date || null,
        eventLocation: booking.event?.location || null,
        quantity: booking.quantity,
        totalAmount: booking.totalAmount,
        status: booking.status,
        paymentStatus: booking.paymentInfo?.paymentStatus || 'unknown',
        bookingDate: booking.createdAt,
        attendeeInfo: booking.attendeeInfo
      })),
      statistics: {
        totalBookings: bookings.length,
        totalSpent: bookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0),
        confirmedBookings: bookings.filter(b => b.status === 'confirmed').length,
        exportedAt: new Date().toISOString()
      }
    };
    
    // Set headers for file download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="my_data_${user.username}_${Date.now()}.json"`);
    
    res.json(exportData);
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to export user data',
      error: error.message
    });
  }
};

// Get all users (Admin only) - no changes needed
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
