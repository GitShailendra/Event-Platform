const Event = require('../models/Event');
const User = require('../models/User');

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

// Create new event
exports.createEvent = async (req, res) => {
  try {
    const eventData = {
      ...req.body,
      createdBy: req.userId,
      availableSeats: req.body.capacity
    };

    const newEvent = new Event(eventData);
    const savedEvent = await newEvent.save();
    
    await savedEvent.populate('createdBy', 'username firstName lastName');
    
    res.status(201).json({
      message: 'Event created successfully',
      event: savedEvent
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
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

// Delete event
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is the creator or admin
    if (event.createdBy.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    await Event.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get events by organizer
exports.getEventsByOrganizer = async (req, res) => {
  try {
    const events = await Event.find({ createdBy: req.userId })
      .sort({ createdAt: -1 });
    
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
