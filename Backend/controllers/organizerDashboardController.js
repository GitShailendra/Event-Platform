// controllers/organizerDashboardController.js
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const User = require('../models/User');
const mongoose = require('mongoose');

// Get organizer dashboard overview
exports.getDashboardOverview = async (req, res) => {
  try {
    const organizerId = req.user.id;
    
    // Get organizer profile info
    const organizer = await User.findById(organizerId).select('firstName lastName email');
    
    if (!organizer) {
      return res.status(404).json({
        success: false,
        message: 'Organizer not found'
      });
    }

    // Get current date for calculations
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get all events by this organizer
    const allEvents = await Event.find({ createdBy: organizerId });
    const eventIds = allEvents.map(event => event._id);

    // Calculate basic stats
    const totalEvents = allEvents.length;
    const activeEvents = allEvents.filter(event => 
      event.status === 'published' && new Date(event.date) > now
    ).length;

    // Calculate total earnings (from all events)
    const totalEarnings = allEvents.reduce((sum, event) => sum + (event.totalEarnings || 0), 0);

    // Calculate total attendees (capacity - available seats)
    const totalAttendees = allEvents.reduce((sum, event) => 
      sum + (event.capacity - event.availableSeats), 0
    );

    // Get this month's data
    const thisMonthBookings = await Booking.aggregate([
      {
        $match: {
          organizer: new mongoose.Types.ObjectId(organizerId),
          bookingDate: { $gte: startOfMonth },
          paymentStatus: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: '$totalPrice' },
          totalAttendees: { $sum: '$ticketQuantity' },
          totalBookings: { $sum: 1 }
        }
      }
    ]);

    const thisMonthData = thisMonthBookings[0] || {
      totalEarnings: 0,
      totalAttendees: 0,
      totalBookings: 0
    };

    // Get recent events (last 5)
    const recentEvents = await Event.find({ createdBy: organizerId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('createdBy', 'firstName lastName')
      .lean();

    // Format recent events with calculated data
    const formattedRecentEvents = await Promise.all(
      recentEvents.map(async (event) => {
        // Get booking count for this event
        const bookingCount = await Booking.countDocuments({ 
          event: event._id, 
          status: 'confirmed' 
        });

        // Calculate attendees and earnings
        const attendees = event.capacity - event.availableSeats;
        const earnings = event.totalEarnings || 0;

        // Determine status based on date and current status
        let status = event.status;
        const eventDate = new Date(event.date);
        
        if (event.status === 'published') {
          if (eventDate < now) {
            status = 'completed';
          } else if (eventDate > now) {
            status = 'upcoming';
          } else {
            status = 'active';
          }
        }

        return {
          id: event._id,
          title: event.title,
          date: event.date,
          status: status,
          attendees: attendees,
          earnings: earnings,
          category: event.category,
          location: event.location
        };
      })
    );

    // Get monthly analytics data (last 4 months)
    const monthlyAnalytics = await Booking.aggregate([
      {
        $match: {
          organizer: new mongoose.Types.ObjectId(organizerId),
          paymentStatus: 'completed',
          bookingDate: { 
            $gte: new Date(now.getFullYear(), now.getMonth() - 3, 1) 
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$bookingDate' },
            month: { $month: '$bookingDate' }
          },
          earnings: { $sum: '$totalPrice' },
          attendees: { $sum: '$ticketQuantity' },
          bookings: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Format analytics data
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const analyticsData = monthlyAnalytics.map(item => ({
      month: monthNames[item._id.month - 1],
      earnings: item.earnings,
      attendees: item.attendees,
      bookings: item.bookings
    }));

    // Get top performing events (by earnings)
    const topEvents = await Event.find({ createdBy: organizerId })
      .sort({ totalEarnings: -1 })
      .limit(3)
      .lean();

    // Response data matching your frontend structure
    const dashboardData = {
      organizer: {
        name: `${organizer.firstName} ${organizer.lastName}`,
        email: organizer.email,
        company: 'Event Organizer', // You can add company field to User model
        totalEvents,
        activeEvents,
        totalEarnings,
        totalAttendees,
        thisMonthEarnings: thisMonthData.totalEarnings,
        thisMonthAttendees: thisMonthData.totalAttendees
      },
      recentEvents: formattedRecentEvents,
      analyticsData,
      topEvents: topEvents.map(event => ({
        id: event._id,
        title: event.title,
        category: event.category,
        earnings: event.totalEarnings || 0,
        attendees: event.capacity - event.availableSeats,
        date: event.date
      })),
      stats: {
        totalEvents,
        activeEvents,
        totalEarnings,
        totalAttendees,
        thisMonthEarnings: thisMonthData.totalEarnings,
        thisMonthAttendees: thisMonthData.totalAttendees,
        thisMonthBookings: thisMonthData.totalBookings
      }
    };

    res.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Dashboard Overview Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: error.message
    });
  }
};
