const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
// const adminAuth = require('../middleware/adminAuth');

// Public routes
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);

// Protected routes
router.get('/profile', auth, userController.getUserProfile);
router.put('/profile', auth, userController.updateUserProfile);
router.get('/profile/current', auth, userController.getCurrentUserProfile);
router.put('/profile/current', auth, userController.updateCurrentUserProfile);
router.post('/change-password', auth, userController.changePassword);
router.get('/download-data', auth, userController.downloadUserData);
// Admin only routes
router.get('/', auth,  userController.getAllUsers);

module.exports = router;
