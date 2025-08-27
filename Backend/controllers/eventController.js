const Event = require('../models/Event');
const User = require('../models/User');
const {cloudinary} =require('../config/cloudinary')
// Get all events with filtering and pagination
exports.getAllEvents = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      search, 
      sortBy = 'date',
      status = 'published' 
    } = req.query;

    const query = { status };
    
    if (category) query.category = category;
    if (search) {
      query.$text = { $search: search };
    }

    const events = await Event.find(query)
      .populate('createdBy', 'username firstName lastName')
      .sort({ [sortBy]: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Event.countDocuments(query);

    res.json({
      events,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single event by ID
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'username firstName lastName profileImage');
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createEvent = async (req, res) => {
  let uploadedImages = [];
  
  try {
    const eventData = {
      ...req.body,
      createdBy: req.userId,
      availableSeats: req.body.capacity
    };

    // Handle uploaded images
    if (req.files && req.files.length > 0) {
      uploadedImages = req.files.map(file => ({
        url: file.path,
        publicId: file.filename
      }));
      eventData.images = uploadedImages.map(img => img.url);
    }

    const newEvent = new Event(eventData);
    const savedEvent = await newEvent.save();
    
    await savedEvent.populate('createdBy', 'username firstName lastName');
    
    res.status(201).json({
      message: 'Event created successfully',
      event: savedEvent
    });
  } catch (error) {
    // Cleanup uploaded images if event creation fails
    if (uploadedImages.length > 0) {
      try {
        await Promise.all(
          uploadedImages.map(img => 
            cloudinary.uploader.destroy(img.publicId)
          )
        );
      } catch (cleanupError) {
        console.error('Failed to cleanup images:', cleanupError);
      }
    }
    
    console.error('Event creation error:', error);
    res.status(400).json({ 
      message: error.message || 'Failed to create event' 
    });
  }
};

// Delete event with image cleanup
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.createdBy.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    // Delete images from Cloudinary
    if (event.images && event.images.length > 0) {
      try {
        const publicIds = event.images.map(url => {
          const parts = url.split('/');
          const filename = parts[parts.length - 1];
          return filename.split('.')[0];
        });
        
        await Promise.all(
          publicIds.map(publicId => 
            cloudinary.uploader.destroy(`events/${process.env.NODE_ENV}/${publicId}`)
          )
        );
      } catch (imageError) {
        console.error('Failed to delete images:', imageError);
        // Continue with event deletion even if image cleanup fails
      }
    }

    await Event.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Event deletion error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update event
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is the creator or admin
    if (event.createdBy.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    ).populate('createdBy', 'username firstName lastName');

    res.json({
      message: 'Event updated successfully',
      event: updatedEvent
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};



// Get events by organizer
exports.getEventsByOrganizer = async (req, res) => {
  try {
    const events = await Event.find({ createdBy: req.userId })
      .sort({ createdAt: -1 });
    
    // Add calculated metrics
    const eventsWithMetrics = events.map(event => {
      const attendees = event.capacity - event.availableSeats;
      const earnings = attendees * event.price;
      
      return {
        ...event.toObject(),
        currentAttendees: attendees,
        totalEarnings: earnings
      };
    });
    
    res.json(eventsWithMetrics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

