const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const auth = require('../middleware/auth');
// const adminAuth = require('../middleware/adminAuth');

// Protected routes
router.post('/', auth, bookingController.createBooking);
router.post('/payment', auth, bookingController.processPayment);
router.get('/my-bookings', auth, bookingController.getUserBookings);
router.get('/:id', auth, bookingController.getBookingById);
router.put('/:id/cancel', auth, bookingController.cancelBooking);

// Admin only routes
router.get('/', auth,  bookingController.getAllBookings);

module.exports = router;
