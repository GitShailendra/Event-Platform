const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { nanoid } = require('nanoid'); // Add this import

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
    
    const { password: _, ...userWithoutPassword } = savedUser.toObject();
    
    console.log('User registered successfully:', userWithoutPassword.email);
    
    res.status(201).json({
      message: 'User registered successfully',
      user: userWithoutPassword
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

// Get all users (Admin only) - no changes needed
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
