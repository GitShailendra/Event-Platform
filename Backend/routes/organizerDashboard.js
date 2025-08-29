// routes/organizerDashboardRoutes.js
const express = require('express');
const router = express.Router();
const organizerDashboardController = require('../controllers/organizerDashboardController');
const auth = require('../middleware/auth');

// Middleware to check if user is organizer
const checkOrganizer = (req, res, next) => {
  if (req.user.role !== 'organizer' && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Organizer role required.'
    });
  }
  next();
};

// All routes require authentication and organizer role
router.use(auth);
router.use(checkOrganizer);

// Dashboard overview route
router.get('/overview', organizerDashboardController.getDashboardOverview);

module.exports = router;
