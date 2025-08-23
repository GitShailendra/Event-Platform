const Booking = require('../models/Booking');
const Event = require('../models/Event');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create new booking
exports.createBooking = async (req, res) => {
  try {
    const { eventId, quantity, attendeeInfo } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.availableSeats < quantity) {
      return res.status(400).json({ message: 'Not enough available seats' });
    }

    const totalAmount = event.price * quantity;

    const booking = new Booking({
      user: req.userId,
      event: eventId,
      quantity,
      totalAmount,
      attendeeInfo
    });

    const savedBooking = await booking.save();
    
    // Update available seats
    await Event.findByIdAndUpdate(eventId, {
      $inc: { availableSeats: -quantity }
    });

    await savedBooking.populate(['user', 'event']);

    res.status(201).json({
      message: 'Booking created successfully',
      booking: savedBooking
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Process payment
exports.processPayment = async (req, res) => {
  try {
    const { bookingId, paymentMethodId } = req.body;

    const booking = await Booking.findById(bookingId).populate('event');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: booking.totalAmount * 100, // Amount in cents
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: true,
      return_url: `${process.env.FRONTEND_URL}/booking-success`
    });

    // Update booking with payment info
    booking.paymentInfo = {
      paymentId: paymentIntent.id,
      paymentMethod: 'stripe',
      transactionId: paymentIntent.charges.data[0]?.id,
      paymentStatus: paymentIntent.status === 'succeeded' ? 'completed' : 'failed'
    };
    
    booking.status = paymentIntent.status === 'succeeded' ? 'confirmed' : 'pending';
    await booking.save();

    res.json({
      message: 'Payment processed successfully',
      booking,
      paymentIntent: {
        id: paymentIntent.id,
        status: paymentIntent.status
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get user bookings
exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.userId })
      .populate('event', 'title date location price images')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get booking by ID
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'firstName lastName email')
      .populate('event');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user owns this booking or is admin
    if (booking.user._id.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this booking' });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cancel booking
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    booking.status = 'cancelled';
    await booking.save();

    // Restore available seats
    await Event.findByIdAndUpdate(booking.event, {
      $inc: { availableSeats: booking.quantity }
    });

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all bookings (Admin only)
exports.getAllBookings = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = status ? { status } : {};

    const bookings = await Booking.find(query)
      .populate('user', 'firstName lastName email')
      .populate('event', 'title date location')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments(query);

    res.json({
      bookings,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
