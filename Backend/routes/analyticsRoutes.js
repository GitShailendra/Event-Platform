// routes/analytics.js
const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
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

// Analytics routes
router.get('/dashboard', analyticsController.getOrganizerAnalytics);
router.get('/event/:eventId', analyticsController.getEventAnalytics);
router.get('/revenue', analyticsController.getRevenueAnalytics);
router.get('/audience', analyticsController.getAudienceAnalytics);

module.exports = router;
