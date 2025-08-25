const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const auth = require('../middleware/auth');
// const organizerAuth = require('../middleware/organizerAuth');

// Public routes
router.get('/', eventController.getAllEvents);
router.get('/:id', eventController.getEventById);

// Protected routes (Organizer/Admin only)
router.post('/', auth,  eventController.createEvent);
router.put('/:id', auth,  eventController.updateEvent);
router.delete('/:id', auth,  eventController.deleteEvent);

// Get events by organizer
router.get('/organizer/my-events', auth, eventController.getEventsByOrganizer);

module.exports = router;
