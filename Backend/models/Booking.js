const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  event: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Event', 
    required: true 
  },
  quantity: { type: Number, required: true, min: 1 },
  totalAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'cancelled', 'refunded'], 
    default: 'pending' 
  },
  paymentInfo: {
    paymentId: String,
    paymentMethod: String,
    transactionId: String,
    paymentStatus: { 
      type: String, 
      enum: ['pending', 'completed', 'failed', 'refunded'] 
    }
  },
  bookingReference: { type: String, unique: true },
  attendeeInfo: [{
    name: String,
    email: String,
    phone: String
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Generate unique booking reference
BookingSchema.pre('save', function(next) {
  if (!this.bookingReference) {
    this.bookingReference = 'BK' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Booking', BookingSchema);
