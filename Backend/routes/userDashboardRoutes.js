// routes/userDashboardRoutes.js
const express = require('express');
const router = express.Router();
const userDashboardController = require('../controllers/userDashboardController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Dashboard overview route
router.get('/overview', userDashboardController.getUserDashboard);

// User stats route
router.get('/stats', userDashboardController.getUserStats);

module.exports = router;
