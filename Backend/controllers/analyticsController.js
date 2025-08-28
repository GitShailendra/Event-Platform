// controllers/analyticsController.js
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const Analytics = require('../models/Analytics');
const User = require('../models/User');
const mongoose = require('mongoose');

// Get organizer dashboard analytics
exports.getOrganizerAnalytics = async (req, res) => {
  try {
    const organizerId = req.user.id;
    const { period = '30d' } = req.query; // 7d, 30d, 90d, 1y

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    // Get organizer's events
    const events = await Event.find({ createdBy: organizerId });
    const eventIds = events.map(event => event._id);

    // Total events by status
    const eventStats = await Event.aggregate([
      { $match: { createdBy: new mongoose.Types.ObjectId(organizerId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalCapacity: { $sum: '$capacity' },
          totalRevenue: { $sum: '$totalEarnings' }
        }
      }
    ]);

    // Booking analytics
    const bookingStats = await Booking.aggregate([
      {
        $match: {
          organizer: new mongoose.Types.ObjectId(organizerId),
          bookingDate: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: '$totalPrice' },
          totalTickets: { $sum: '$ticketQuantity' },
          avgOrderValue: { $avg: '$totalPrice' }
        }
      }
    ]);

    // Recent bookings trend (daily)
    const bookingTrend = await Booking.aggregate([
      {
        $match: {
          organizer: new mongoose.Types.ObjectId(organizerId),
          bookingDate: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$bookingDate' },
            month: { $month: '$bookingDate' },
            day: { $dayOfMonth: '$bookingDate' }
          },
          bookings: { $sum: 1 },
          revenue: { $sum: '$totalPrice' },
          tickets: { $sum: '$ticketQuantity' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Top performing events
    const topEvents = await Event.aggregate([
      { $match: { createdBy: new mongoose.Types.ObjectId(organizerId) } },
      {
        $lookup: {
          from: 'bookings',
          localField: '_id',
          foreignField: 'event',
          as: 'bookings'
        }
      },
      {
        $addFields: {
          totalBookings: { $size: '$bookings' },
          soldTickets: { $sum: '$bookings.ticketQuantity' },
          occupancyRate: {
            $multiply: [
              { $divide: [{ $subtract: ['$capacity', '$availableSeats'] }, '$capacity'] },
              100
            ]
          }
        }
      },
      { $sort: { totalEarnings: -1 } },
      { $limit: 5 },
      {
        $project: {
          title: 1,
          category: 1,
          date: 1,
          capacity: 1,
          availableSeats: 1,
          totalEarnings: 1,
          totalBookings: 1,
          occupancyRate: 1,
          status: 1
        }
      }
    ]);

    // Category performance
    const categoryStats = await Event.aggregate([
      { $match: { createdBy: new mongoose.Types.ObjectId(organizerId) } },
      {
        $group: {
          _id: '$category',
          eventCount: { $sum: 1 },
          totalRevenue: { $sum: '$totalEarnings' },
          totalCapacity: { $sum: '$capacity' },
          avgPrice: { $avg: '$price' }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    // Monthly revenue comparison
    const monthlyRevenue = await Booking.aggregate([
      {
        $match: {
          organizer: new mongoose.Types.ObjectId(organizerId),
          paymentStatus: 'completed'
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$bookingDate' },
            month: { $month: '$bookingDate' }
          },
          revenue: { $sum: '$totalPrice' },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    // Calculate totals
    const totalEvents = events.length;
    const totalRevenue = events.reduce((sum, event) => sum + event.totalEarnings, 0);
    const totalCapacity = events.reduce((sum, event) => sum + event.capacity, 0);
    const totalSold = totalCapacity - events.reduce((sum, event) => sum + event.availableSeats, 0);

    res.json({
      success: true,
      data: {
        overview: {
          totalEvents,
          totalRevenue,
          totalCapacity,
          totalSold,
          occupancyRate: totalCapacity > 0 ? ((totalSold / totalCapacity) * 100).toFixed(2) : 0,
          avgRevenuePerEvent: totalEvents > 0 ? (totalRevenue / totalEvents).toFixed(2) : 0
        },
        eventStats,
        bookingStats: bookingStats[0] || {
          totalBookings: 0,
          totalRevenue: 0,
          totalTickets: 0,
          avgOrderValue: 0
        },
        bookingTrend,
        topEvents,
        categoryStats,
        monthlyRevenue,
        period,
        dateRange: { startDate, endDate }
      }
    });

  } catch (error) {
    console.error('Analytics Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics data',
      error: error.message
    });
  }
};

// Get specific event analytics
exports.getEventAnalytics = async (req, res) => {
  try {
    const { eventId } = req.params;
    const organizerId = req.user.id;

    // Verify event belongs to organizer
    const event = await Event.findOne({ _id: eventId, createdBy: organizerId });
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or unauthorized'
      });
    }

    // Get bookings for this event
    const bookings = await Booking.find({ event: eventId })
      .populate('user', 'firstName lastName email')
      .sort({ bookingDate: -1 });

    // Booking status breakdown
    const bookingStatusBreakdown = await Booking.aggregate([
      { $match: { event: new mongoose.Types.ObjectId(eventId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          revenue: { $sum: '$totalPrice' },
          tickets: { $sum: '$ticketQuantity' }
        }
      }
    ]);

    // Daily booking trend
    const dailyBookings = await Booking.aggregate([
      { $match: { event: new mongoose.Types.ObjectId(eventId) } },
      {
        $group: {
          _id: {
            year: { $year: '$bookingDate' },
            month: { $month: '$bookingDate' },
            day: { $dayOfMonth: '$bookingDate' }
          },
          bookings: { $sum: 1 },
          revenue: { $sum: '$totalPrice' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Calculate metrics
    const totalTicketsSold = event.capacity - event.availableSeats;
    const occupancyRate = ((totalTicketsSold / event.capacity) * 100).toFixed(2);
    const avgTicketPrice = totalTicketsSold > 0 ? (event.totalEarnings / totalTicketsSold).toFixed(2) : 0;

    res.json({
      success: true,
      data: {
        event: {
          _id: event._id,
          title: event.title,
          category: event.category,
          date: event.date,
          location: event.location,
          capacity: event.capacity,
          availableSeats: event.availableSeats,
          price: event.price,
          totalEarnings: event.totalEarnings,
          status: event.status
        },
        metrics: {
          totalTicketsSold,
          occupancyRate: parseFloat(occupancyRate),
          avgTicketPrice: parseFloat(avgTicketPrice),
          totalRevenue: event.totalEarnings,
          conversionRate: 0 // You can calculate this if you track views
        },
        bookingStatusBreakdown,
        dailyBookings,
        recentBookings: bookings.slice(0, 10)
      }
    });

  } catch (error) {
    console.error('Event Analytics Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event analytics',
      error: error.message
    });
  }
};

// Get revenue analytics
exports.getRevenueAnalytics = async (req, res) => {
  try {
    const organizerId = req.user.id;
    const { period = '12m' } = req.query;

    let groupBy, dateRange;
    const endDate = new Date();
    const startDate = new Date();

    switch (period) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        groupBy = {
          year: { $year: '$bookingDate' },
          month: { $month: '$bookingDate' },
          day: { $dayOfMonth: '$bookingDate' }
        };
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        groupBy = {
          year: { $year: '$bookingDate' },
          month: { $month: '$bookingDate' },
          day: { $dayOfMonth: '$bookingDate' }
        };
        break;
      case '12m':
        startDate.setMonth(endDate.getMonth() - 12);
        groupBy = {
          year: { $year: '$bookingDate' },
          month: { $month: '$bookingDate' }
        };
        break;
      default:
        startDate.setMonth(endDate.getMonth() - 12);
        groupBy = {
          year: { $year: '$bookingDate' },
          month: { $month: '$bookingDate' }
        };
    }

    const revenueData = await Booking.aggregate([
      {
        $match: {
          organizer: new mongoose.Types.ObjectId(organizerId),
          paymentStatus: 'completed',
          bookingDate: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: groupBy,
          revenue: { $sum: '$totalPrice' },
          bookings: { $sum: 1 },
          tickets: { $sum: '$ticketQuantity' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    res.json({
      success: true,
      data: {
        revenueData,
        period,
        dateRange: { startDate, endDate }
      }
    });

  } catch (error) {
    console.error('Revenue Analytics Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch revenue analytics',
      error: error.message
    });
  }
};

// Get audience analytics
exports.getAudienceAnalytics = async (req, res) => {
  try {
    const organizerId = req.user.id;

    // Get all attendees for organizer's events
    const attendeeStats = await Booking.aggregate([
      { $match: { organizer: new mongoose.Types.ObjectId(organizerId), status: 'confirmed' } },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'attendee'
        }
      },
      { $unwind: '$attendee' },
      {
        $group: {
          _id: '$attendee._id',
          name: { $first: { $concat: ['$attendee.firstName', ' ', '$attendee.lastName'] } },
          email: { $first: '$attendee.email' },
          totalBookings: { $sum: 1 },
          totalSpent: { $sum: '$totalPrice' },
          lastBooking: { $max: '$bookingDate' }
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 50 }
    ]);

    // Repeat customers
    const repeatCustomers = attendeeStats.filter(customer => customer.totalBookings > 1);

    res.json({
      success: true,
      data: {
        totalUniqueAttendees: attendeeStats.length,
        repeatCustomers: repeatCustomers.length,
        repeatRate: attendeeStats.length > 0 ? ((repeatCustomers.length / attendeeStats.length) * 100).toFixed(2) : 0,
        topCustomers: attendeeStats.slice(0, 10),
        allAttendees: attendeeStats
      }
    });

  } catch (error) {
    console.error('Audience Analytics Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audience analytics',
      error: error.message
    });
  }
};
