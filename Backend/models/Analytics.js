// models/Analytics.js
const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema({
  event: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Event', 
    required: true 
  },
  organizer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  views: { type: Number, default: 0 },
  uniqueViews: { type: Number, default: 0 },
  bookings: { type: Number, default: 0 },
  revenue: { type: Number, default: 0 },
  cancellations: { type: Number, default: 0 },
  refunds: { type: Number, default: 0 },
  conversionRate: { type: Number, default: 0 }, // bookings/views * 100
  popularityScore: { type: Number, default: 0 },
  viewsToday: { type: Number, default: 0 },
  bookingsToday: { type: Number, default: 0 },
  revenueToday: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

// Indexes for better performance
AnalyticsSchema.index({ event: 1, organizer: 1 });
AnalyticsSchema.index({ organizer: 1, lastUpdated: -1 });
AnalyticsSchema.index({ event: 1 });

module.exports = mongoose.model('Analytics', AnalyticsSchema);
