const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const auth = require('../middleware/auth');
const organizerAuth = require('../middleware/organizerAuth');

// Public routes
router.get('/', eventController.getAllEvents);
router.get('/:id', eventController.getEventById);

// Protected routes (Organizer/Admin only)
router.post('/', auth, organizerAuth, eventController.createEvent);
router.put('/:id', auth, organizerAuth, eventController.updateEvent);
router.delete('/:id', auth, organizerAuth, eventController.deleteEvent);

// Get events by organizer
router.get('/organizer/my-events', auth, organizerAuth, eventController.getEventsByOrganizer);

module.exports = router;
