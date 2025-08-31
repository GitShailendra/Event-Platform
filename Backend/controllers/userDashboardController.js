// controllers/userDashboardController.js
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const User = require('../models/User');
const mongoose = require('mongoose');

// Get user dashboard overview
exports.getUserDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user information
    const user = await User.findById(userId).select('firstName lastName email');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get current date for filtering
    const now = new Date();
    
    // Total bookings count for this user
    const totalBookings = await Booking.countDocuments({ 
      user: userId 
    });

    // Get upcoming events (confirmed bookings with future event dates)
    const upcomingEventsCount = await Booking.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          status: 'confirmed'
        }
      },
      {
        $lookup: {
          from: 'events',
          localField: 'event',
          foreignField: '_id',
          as: 'eventDetails'
        }
      },
      {
        $unwind: '$eventDetails'
      },
      {
        $match: {
          'eventDetails.date': { $gte: now }
        }
      },
      {
        $count: 'upcomingCount'
      }
    ]);

    // Get completed events (confirmed bookings with past event dates)
    const completedEventsCount = await Booking.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          status: 'confirmed'
        }
      },
      {
        $lookup: {
          from: 'events',
          localField: 'event',
          foreignField: '_id',
          as: 'eventDetails'
        }
      },
      {
        $unwind: '$eventDetails'
      },
      {
        $match: {
          'eventDetails.date': { $lt: now }
        }
      },
      {
        $count: 'completedCount'
      }
    ]);

    // Get recent bookings (latest 3 with event details)
    const recentBookingsData = await Booking.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId)
        }
      },
      {
        $lookup: {
          from: 'events',
          localField: 'event',
          foreignField: '_id',
          as: 'eventDetails'
        }
      },
      {
        $unwind: {
          path: '$eventDetails',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $limit: 3
      },
      {
        $project: {
          _id: 1,
          totalAmount: 1,
          status: 1,
          createdAt: 1,
          'eventDetails.title': 1,
          'eventDetails.date': 1,
          'eventDetails.price': 1,
          'eventDetails.category': 1
        }
      }
    ]);

    // Format recent bookings for frontend
    const recentBookings = recentBookingsData.map(booking => ({
      id: booking._id,
      eventTitle: booking.eventDetails?.title || 'Event not found',
      date: booking.eventDetails?.date || null,
      time: booking.eventDetails?.date ? 
        new Date(booking.eventDetails.date).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        }) : 'N/A',
      price: booking.totalAmount || booking.eventDetails?.price || 0,
      status: booking.status,
      category: booking.eventDetails?.category || 'other'
    }));

    // Response data
    const dashboardData = {
      user: {
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        totalBookings: totalBookings,
        upcomingEvents: upcomingEventsCount[0]?.upcomingCount || 0,
        completedEvents: completedEventsCount[0]?.completedCount || 0
      },
      recentBookings: recentBookings,
      stats: {
        totalBookings,
        upcomingEvents: upcomingEventsCount[0]?.upcomingCount || 0,
        completedEvents: completedEventsCount[0]?.completedCount || 0,
        totalSpent: recentBookings.reduce((sum, booking) => sum + booking.price, 0)
      }
    };

    res.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('User Dashboard Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: error.message
    });
  }
};

// Get user stats summary
exports.getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    
    // Monthly spending (last 6 months)
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    
    const monthlySpending = await Booking.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          paymentStatus: 'completed',
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          totalSpent: { $sum: '$totalAmount' },
          bookingsCount: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Favorite categories
    const favoriteCategories = await Booking.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          status: 'confirmed'
        }
      },
      {
        $lookup: {
          from: 'events',
          localField: 'event',
          foreignField: '_id',
          as: 'eventDetails'
        }
      },
      {
        $unwind: '$eventDetails'
      },
      {
        $group: {
          _id: '$eventDetails.category',
          count: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 5
      }
    ]);

    res.json({
      success: true,
      data: {
        monthlySpending,
        favoriteCategories
      }
    });

  } catch (error) {
    console.error('User Stats Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user stats',
      error: error.message
    });
  }
};
