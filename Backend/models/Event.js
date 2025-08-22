const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['concert', 'workshop', 'webinar', 'meetup', 'conference', 'other'],
    required: true 
  },
  date: { type: Date, required: true },
  endDate: { type: Date },
  location: { type: String, required: true },
  venue: { type: String },
  price: { type: Number, required: true, min: 0 },
  capacity: { type: Number, required: true },
  availableSeats: { type: Number, required: true },
  images: [{ type: String }], // Cloudinary URLs
  tags: [{ type: String }],
  isFeatured: { type: Boolean, default: false },
  status: { 
    type: String, 
    enum: ['draft', 'published', 'cancelled', 'completed'], 
    default: 'draft' 
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Index for search functionality
EventSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Event', EventSchema);
