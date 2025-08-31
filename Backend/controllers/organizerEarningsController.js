// controllers/organizerEarningsController.js
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const mongoose = require('mongoose');

// Get earnings and transactions overview for organizer
exports.getOrganizerEarnings = async (req, res) => {
  try {
    const organizerId = req.user.id;
    const { timeFilter = 'thisMonth' } = req.query;

    // Get current date and periods
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Total earnings from completed bookings
    const totalEarningsData = await Booking.aggregate([
      {
        $match: {
          organizer: new mongoose.Types.ObjectId(organizerId),
          paymentStatus: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: '$totalPrice' },
          totalTransactions: { $sum: 1 }
        }
      }
    ]);
    console.log('Total Earnings Data:', totalEarningsData);
    // This month earnings
    const thisMonthData = await Booking.aggregate([
      {
        $match: {
          organizer: new mongoose.Types.ObjectId(organizerId),
          paymentStatus: 'completed',
          bookingDate: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          thisMonthEarnings: { $sum: '$totalPrice' },
          thisMonthTransactions: { $sum: 1 }
        }
      }
    ]);

    // Last month earnings for comparison
    const lastMonthData = await Booking.aggregate([
      {
        $match: {
          organizer: new mongoose.Types.ObjectId(organizerId),
          paymentStatus: 'completed',
          bookingDate: { $gte: lastMonth, $lte: endOfLastMonth }
        }
      },
      {
        $group: {
          _id: null,
          lastMonthEarnings: { $sum: '$totalPrice' }
        }
      }
    ]);

    // Pending Payouts (bookings completed but payout pending)
    // Assuming payouts are processed weekly, so bookings from last 7 days are pending
    const pendingPayoutsData = await Booking.aggregate([
      {
        $match: {
          organizer: new mongoose.Types.ObjectId(organizerId),
          paymentStatus: 'completed',
          bookingDate: { $gte: startOfWeek },
          // Add payout status check if you have it in your model
          // payoutStatus: { $ne: 'paid' }
        }
      },
      {
        $group: {
          _id: null,
          pendingPayouts: { $sum: '$totalPrice' },
          pendingCount: { $sum: 1 }
        }
      }
    ]);

    // Get filtered transactions based on timeFilter
    let dateFilter = {};
    switch (timeFilter) {
      case 'thisWeek':
        dateFilter = { bookingDate: { $gte: startOfWeek } };
        break;
      case 'thisMonth':
        dateFilter = { bookingDate: { $gte: startOfMonth } };
        break;
      case 'last3Months':
        dateFilter = { bookingDate: { $gte: threeMonthsAgo } };
        break;
      default:
        dateFilter = { bookingDate: { $gte: startOfMonth } };
    }

    // Get transactions with event details
    const transactions = await Booking.aggregate([
      {
        $match: {
          organizer: new mongoose.Types.ObjectId(organizerId),
          paymentStatus: 'completed',
          ...dateFilter
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
      { $unwind: '$eventDetails' },
      {
        $project: {
          _id: 1,
          totalPrice: 1,
          ticketQuantity: 1,
          bookingDate: 1,
          status: 1,
          eventTitle: '$eventDetails.title',
          eventDate: '$eventDetails.date'
        }
      },
      { $sort: { bookingDate: -1 } },
      { $limit: 50 }
    ]);

    // Format transactions for frontend
    const formattedTransactions = transactions.map(txn => ({
      id: txn._id.toString(),
      eventTitle: txn.eventTitle,
      date: txn.bookingDate,
      amount: txn.totalPrice,
      attendees: txn.ticketQuantity,
      status: 'completed', // All filtered transactions are completed
      payoutDate: new Date(txn.bookingDate.getTime() + 7 * 24 * 60 * 60 * 1000) // Assume 7 days for payout
    }));

    // Monthly earnings for last 8 months
    const eightMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 7, 1);
    const monthlyEarningsData = await Booking.aggregate([
      {
        $match: {
          organizer: new mongoose.Types.ObjectId(organizerId),
          paymentStatus: 'completed',
          bookingDate: { $gte: eightMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$bookingDate' },
            month: { $month: '$bookingDate' }
          },
          earnings: { $sum: '$totalPrice' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Format monthly earnings
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const monthlyEarnings = monthlyEarningsData.map(item => ({
      month: monthNames[item._id.month - 1],
      earnings: item.earnings
    }));

    // Calculate growth percentages
    const currentEarnings = thisMonthData[0]?.thisMonthEarnings || 0;
    const previousEarnings = lastMonthData[0]?.lastMonthEarnings || 0;
    const earningsGrowth = previousEarnings > 0 ? 
      (((currentEarnings - previousEarnings) / previousEarnings) * 100).toFixed(1) : 0;

    // Prepare response data
    const responseData = {
      totalEarnings: totalEarningsData[0]?.totalEarnings || 0,
      thisMonthEarnings: currentEarnings,
      pendingPayouts: pendingPayoutsData[0]?.pendingPayouts || 0,
      totalTransactions: totalEarningsData[0]?.totalTransactions || 0,
      thisMonthTransactions: thisMonthData[0]?.thisMonthTransactions || 0,
      pendingTransactions: pendingPayoutsData[0]?.pendingCount || 0,
      earningsGrowth: earningsGrowth,
      transactions: formattedTransactions,
      monthlyEarnings: monthlyEarnings,
      summary: {
        totalEarnings: totalEarningsData[0]?.totalEarnings || 0,
        thisMonthEarnings: currentEarnings,
        lastMonthEarnings: previousEarnings,
        growth: earningsGrowth,
        pendingAmount: pendingPayoutsData[0]?.pendingPayouts || 0,
        nextPayoutDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next week
      }
    };

    res.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Earnings API Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch earnings data',
      error: error.message
    });
  }
};
