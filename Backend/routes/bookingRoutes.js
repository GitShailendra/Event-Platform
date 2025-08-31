// routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const ticketController = require('../controllers/ticketController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Booking routes
router.post('/', bookingController.createBooking);
router.post('/create-order', bookingController.createPaymentOrder);
router.post('/verify-payment', bookingController.verifyPayment);
router.post('/payment-failure', bookingController.handlePaymentFailure);
router.get('/my-bookings', bookingController.getUserBookings);
router.get('/:id', bookingController.getBookingById);
router.patch('/:id/cancel', bookingController.cancelBooking);
router.get('/:id/download-ticket', ticketController.downloadTicket);

// Admin routes
router.get('/', bookingController.getAllBookings);

module.exports = router;
