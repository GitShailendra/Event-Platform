const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const auth = require('../middleware/auth');
const { uploadMultipleImages, uploadLimiter } = require('../middleware/uploadMiddleware');

// Apply rate limiting to upload routes
router.use('/upload', uploadLimiter);

// Public routes
router.get('/', eventController.getAllEvents);
router.get('/:id', eventController.getEventById);

// Protected routes with upload
router.post('/', 
  auth, 
  uploadLimiter,
  uploadMultipleImages, 
  eventController.createEvent
);

router.put('/:id', 
  auth, 
  uploadLimiter,
  uploadMultipleImages, 
  eventController.updateEvent
);

router.delete('/:id', auth, eventController.deleteEvent);
router.get('/organizer/my-events', auth, eventController.getEventsByOrganizer);

module.exports = router;
