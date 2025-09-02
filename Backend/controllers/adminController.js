const User = require('../models/User');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const Analytics = require('../models/Analytics');
const Contact = require('../models/Contact');
// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    
    // Get all events and group by organizer
    const allEvents = await Event.find().populate('createdBy', '_id');
    
    // Create a map of organizer ID to their events
    const organizerEventsMap = {};
    allEvents.forEach(event => {
      const organizerId = event.createdBy._id.toString();
      if (!organizerEventsMap[organizerId]) {
        organizerEventsMap[organizerId] = [];
      }
      organizerEventsMap[organizerId].push(event);
    });

    res.status(200).json({
      users,
      events: allEvents,
      organizerEventsMap
    });
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving users', err });
  }
};


// Block user
exports.blockUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    res.json({ message: 'User blocked', user });
  } catch (err) {
    res.status(500).json({ message: 'Error blocking user', err });
  }
};

// Unblock user
exports.unblockUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: true }, { new: true });
    res.json({ message: 'User unblocked', user });
  } catch (err) {
    res.status(500).json({ message: 'Error unblocking user', err });
  }
};

// Approve organizer signup
exports.approveOrganizer = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isOrganizer: true, role: 'organizer' },
      { new: true }
    );
    res.json({ message: 'Organizer approved', user });
  } catch (err) {
    res.status(500).json({ message: 'Error approving organizer', err });
  }
};

// Reject organizer signup
exports.rejectOrganizer = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isOrganizer: false, role: 'user' },
      { new: true }
    );
    res.json({ message: 'Organizer rejected', user });
  } catch (err) {
    res.status(500).json({ message: 'Error rejecting organizer', err });
  }
};

// Get all events
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().populate('createdBy', 'username firstName lastName email');
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving events', err });
  }
};


exports.getDashboardStats = async (req, res) => {
  try {
    const [userCount, eventCount, bookingCount, totalRevenueAgg] = await Promise.all([
      User.countDocuments(),
      Event.countDocuments(),
      Booking.countDocuments(),
      Analytics.aggregate([{ $group: { _id: null, total: { $sum: "$revenue" } } }])
    ]);
    res.json({
      users: userCount,
      events: eventCount,
      bookings: bookingCount,
      totalRevenue: totalRevenueAgg[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Error getting dashboard stats', error });
  }
};


exports.getAllContactQueries = async (req,res)=>{
  try {
    const queries = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json(queries);
  } catch (error) {
    res.status(500).json({ message: 'Error getting contact queries', error });
  }
}