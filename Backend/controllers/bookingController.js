// controllers/bookingController.js
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const Razorpay = require('razorpay');
const mongoose = require('mongoose');
const crypto = require('crypto');

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create new booking
exports.createBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { eventId, quantity, attendeeInfo } = req.body;
    const userId = req.user.id;

    // Validate event exists and has available seats
    const event = await Event.findById(eventId).session(session);
    if (!event) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if event is still bookable
    const now = new Date();
    const eventDate = new Date(event.date);
    if (eventDate < now) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Cannot book tickets for past events'
      });
    }

    // Check available seats
    if (event.availableSeats < quantity) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: `Only ${event.availableSeats} seats available`
      });
    }

    // Calculate total amount
    const totalAmount = event.price * quantity;

    // Create booking
    const booking = new Booking({
      user: userId,
      event: eventId,
      quantity,
      totalAmount,
      attendeeInfo,
      status: totalAmount === 0 ? 'confirmed' : 'pending',
      paymentInfo: {
        paymentMethod: totalAmount === 0 ? 'free' : 'razorpay',
        paymentStatus: totalAmount === 0 ? 'completed' : 'pending'
      }
    });

    await booking.save({ session });

    // For free events, immediately update seats and confirm booking
    if (totalAmount === 0) {
      await Event.findByIdAndUpdate(
        eventId,
        { 
          $inc: { 
            availableSeats: -quantity,
            totalEarnings: 0
          }
        },
        { session }
      );
    }

    await session.commitTransaction();

    // Populate booking for response
    await booking.populate([
      { path: 'user', select: 'firstName lastName email' },
      { path: 'event', select: 'title date location price images' }
    ]);

    res.status(201).json({
      success: true,
      message: totalAmount === 0 ? 'Registration successful!' : 'Booking created successfully',
      data: {
        booking,
        requiresPayment: totalAmount > 0,
        nextStep: totalAmount === 0 ? 'confirmed' : 'payment'
      }
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Create Booking Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking',
      error: error.message
    });
  } finally {
    session.endSession();
  }
};

// Create Razorpay order for payment
exports.createPaymentOrder = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const userId = req.user.id;

    const booking = await Booking.findOne({
      _id: bookingId,
      user: userId
    }).populate('event');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Booking is not in pending state'
      });
    }

    if (booking.totalAmount === 0) {
      return res.status(400).json({
        success: false,
        message: 'No payment required for free events'
      });
    }

    // Create Razorpay order
    const orderOptions = {
      amount: Math.round(booking.totalAmount * 100), // Amount in paise
      currency: 'INR',
      receipt: booking.bookingReference,
      payment_capture: 1, // Auto capture payment
      notes: {
        bookingId: booking._id.toString(),
        eventTitle: booking.event.title,
        quantity: booking.quantity.toString()
      }
    };

    const razorpayOrder = await razorpay.orders.create(orderOptions);

    // Update booking with order details
    booking.paymentInfo.paymentId = razorpayOrder.id;
    await booking.save();

    res.json({
      success: true,
      data: {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        booking: booking,
        razorpayKeyId: process.env.RAZORPAY_KEY_ID
      }
    });

  } catch (error) {
    console.error('Create Payment Order Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order',
      error: error.message
    });
  }
};

// Verify Razorpay payment and confirm booking
exports.verifyPayment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { 
      bookingId, 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature 
    } = req.body;
    const userId = req.user.id;

    const booking = await Booking.findOne({
      _id: bookingId,
      user: userId
    }).session(session);

    if (!booking) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Verify payment signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // Update booking with payment details
    booking.paymentInfo = {
      paymentId: razorpay_order_id,
      paymentMethod: 'razorpay',
      transactionId: razorpay_payment_id,
      paymentStatus: 'completed'
    };
    booking.status = 'confirmed';
    await booking.save({ session });

    // Update event seats and earnings
    await Event.findByIdAndUpdate(
      booking.event,
      { 
        $inc: { 
          availableSeats: -booking.quantity,
          totalEarnings: booking.totalAmount
        }
      },
      { session }
    );

    await session.commitTransaction();

    // Populate booking for response
    await booking.populate([
      { path: 'user', select: 'firstName lastName email' },
      { path: 'event', select: 'title date location price images' }
    ]);

    res.json({
      success: true,
      message: 'Payment verified and booking confirmed!',
      data: { booking }
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Verify Payment Error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message
    });
  } finally {
    session.endSession();
  }
};

// Handle payment failure
exports.handlePaymentFailure = async (req, res) => {
  try {
    const { bookingId, error_description } = req.body;
    const userId = req.user.id;

    const booking = await Booking.findOne({
      _id: bookingId,
      user: userId
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    booking.paymentInfo.paymentStatus = 'failed';
    booking.status = 'pending'; // Keep booking pending for retry
    await booking.save();

    res.json({
      success: false,
      message: 'Payment failed',
      data: { 
        booking,
        error: error_description,
        canRetry: true
      }
    });

  } catch (error) {
    console.error('Handle Payment Failure Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to handle payment failure',
      error: error.message
    });
  }
};

// Get user's bookings
exports.getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    let query = { user: userId };
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate({
        path: 'event',
        select: 'title date location price images category status'
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalBookings: total
        }
      }
    });

  } catch (error) {
    console.error('Get User Bookings Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: error.message
    });
  }
};

// Get booking by ID
exports.getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const booking = await Booking.findById(id)
      .populate('user', 'firstName lastName email')
      .populate('event');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization
    if (booking.user._id.toString() !== userId && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking'
      });
    }

    res.json({
      success: true,
      data: { booking }
    });

  } catch (error) {
    console.error('Get Booking Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking',
      error: error.message
    });
  }
};

// Cancel booking and process refund if applicable
exports.cancelBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const userId = req.user.id;

    const booking = await Booking.findOne({
      _id: id,
      user: userId
    }).populate('event').session(session);

    if (!booking) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.status === 'cancelled') {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }

    // Check cancellation policy (24 hours before event)
    const eventDate = new Date(booking.event.date);
    const now = new Date();
    const hoursDiff = (eventDate - now) / (1000 * 60 * 60);

    if (hoursDiff < 24) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel booking less than 24 hours before the event'
      });
    }

    // Update booking status
    booking.status = 'cancelled';
    await booking.save({ session });

    // Restore event seats
    await Event.findByIdAndUpdate(
      booking.event._id,
      { 
        $inc: { 
          availableSeats: booking.quantity,
          totalEarnings: -booking.totalAmount
        }
      },
      { session }
    );

    // Process refund if payment was completed
    if (booking.paymentInfo.paymentStatus === 'completed' && booking.totalAmount > 0) {
      try {
        const refund = await razorpay.payments.refund(booking.paymentInfo.transactionId, {
          amount: Math.round(booking.totalAmount * 100), // Amount in paise
          speed: 'normal',
          notes: {
            reason: 'User cancellation',
            bookingId: booking._id.toString()
          }
        });

        booking.paymentInfo.paymentStatus = 'refunded';
        booking.paymentInfo.refundId = refund.id;
        await booking.save({ session });

      } catch (refundError) {
        console.error('Refund Error:', refundError);
        // Continue with cancellation even if refund fails
      }
    }

    await session.commitTransaction();

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: { booking }
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Cancel Booking Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel booking',
      error: error.message
    });
  } finally {
    session.endSession();
  }
};

// Get all bookings (Admin only)
exports.getAllBookings = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, eventId } = req.query;

    let query = {};
    if (status) query.status = status;
    if (eventId) query.event = eventId;

    const bookings = await Booking.find(query)
      .populate('user', 'firstName lastName email')
      .populate('event', 'title date location price')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalBookings: total
        }
      }
    });

  } catch (error) {
    console.error('Get All Bookings Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: error.message
    });
  }
};
exports.getAttendeeBooking = async (req,res)=>{
  try {
    const { eventId } = req.params;
    const organizerId = req.user.id;

    // First verify that the event exists and the logged-in user is the organizer
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ 
        success: false,
        message: 'Event not found' 
      });
    }

    // Check if the logged-in user is the organizer of this event
    if (event.createdBy.toString() !== organizerId) {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied: You are not the organizer of this event' 
      });
    }

    // Fetch all confirmed bookings for this event
    const attendees = await Booking.find({
      event: eventId,
      status: 'confirmed'
    })
    .populate('user', 'firstName lastName profileImage email username')
    .populate('event', 'title date location')
    .sort({ createdAt: -1 });

    // Remove duplicate users (in case someone has multiple bookings)
    const uniqueAttendees = [];
    const seenUserIds = new Set();

    attendees.forEach(booking => {
      if (!seenUserIds.has(booking.user._id.toString())) {
        seenUserIds.add(booking.user._id.toString());
        uniqueAttendees.push(booking);
      }
    });

    res.json({
      success: true,
      data: uniqueAttendees,
      total: uniqueAttendees.length
    });

  } catch (error) {
    res.status(500).json({
      success:false,
      message:'Failed to get Attendee',
      error: error.message
    })
  }
}