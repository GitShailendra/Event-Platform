const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Public routes
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);

// Protected routes
router.get('/profile', auth, userController.getUserProfile);
router.put('/profile', auth, userController.updateUserProfile);

// Admin only routes
router.get('/', auth, adminAuth, userController.getAllUsers);

module.exports = router;
