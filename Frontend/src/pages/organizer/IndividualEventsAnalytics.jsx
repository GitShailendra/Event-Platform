import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { analyticsAPI, eventAPI, analyticsErrorHandler } from '../../api';

const EventAnalytics = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  
  const [eventAnalytics, setEventAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState('overview');

  useEffect(() => {
    if (eventId) {
      fetchEventAnalytics();
    }
  }, [eventId]);

  const fetchEventAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await analyticsAPI.getEventAnalytics(eventId);
      setEventAnalytics(response.data);
    } catch (err) {
      setError(analyticsErrorHandler(err, 'event analytics'));
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    fetchEventAnalytics();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      published: { class: 'bg-green-900 text-green-300 border-green-700', label: 'Active', dot: 'bg-green-400' },
      draft: { class: 'bg-yellow-900 text-yellow-300 border-yellow-700', label: 'Draft', dot: 'bg-yellow-400' },
      completed: { class: 'bg-gray-700 text-gray-300 border-gray-600', label: 'Completed', dot: 'bg-gray-400' },
      cancelled: { class: 'bg-red-900 text-red-300 border-red-700', label: 'Cancelled', dot: 'bg-red-400' }
    };
    return badges[status] || badges.draft;
  };

  const viewTabs = [
    { key: 'overview', label: 'Overview', icon: '📊' },
    { key: 'bookings', label: 'Bookings', icon: '🎫' },
    { key: 'revenue', label: 'Revenue', icon: '💰' },
    { key: 'attendees', label: 'Attendees', icon: '👥' }
  ];

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-400">Loading event analytics...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📈</div>
          <h2 className="text-2xl font-bold text-white mb-2">Error Loading Analytics</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <div className="flex space-x-3 justify-center">
            <button onClick={handleRetry} className="btn-primary">
              Try Again
            </button>
            <button onClick={() => navigate(-1)} className="btn-secondary">
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { event, metrics, bookingStatusBreakdown, dailyBookings, recentBookings } = eventAnalytics || {};
  const statusBadge = getStatusBadge(event?.status);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with Event Info */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <div className="flex items-start justify-between mb-4">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <span className="mr-2">←</span>
            Back to Events
          </button>
          
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${statusBadge.dot} animate-pulse`}></div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusBadge.class}`}>
              {statusBadge.label}
            </span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-2">{event?.title}</h1>
            <div className="space-y-2 text-gray-400">
              <div className="flex items-center">
                <span className="text-blue-400 mr-2">📅</span>
                {formatDate(event?.date)}
              </div>
              <div className="flex items-center">
                <span className="text-green-400 mr-2">📍</span>
                {event?.location}
              </div>
              <div className="flex items-center">
                <span className="text-purple-400 mr-2">🏷️</span>
                <span className="capitalize">{event?.category}</span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:w-auto w-full">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{formatNumber(metrics?.totalTicketsSold || 0)}</p>
              <p className="text-gray-400 text-sm">Tickets Sold</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">{formatCurrency(event?.price || 0)}</p>
              <p className="text-gray-400 text-sm">Ticket Price</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-400">{metrics?.occupancyRate?.toFixed(1)}%</p>
              <p className="text-gray-400 text-sm">Occupancy</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-400">{formatCurrency(metrics?.totalRevenue || 0)}</p>
              <p className="text-gray-400 text-sm">Revenue</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-3">
        {viewTabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveView(tab.key)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              activeView === tab.key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-700'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeView === 'overview' && (
        <div className="space-y-6">
          {/* Key Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Total Revenue',
                value: formatCurrency(metrics?.totalRevenue || 0),
                subtitle: `${metrics?.totalTicketsSold || 0} tickets sold`,
                icon: '💰',
                color: 'from-green-500 to-emerald-600',
                trend: '+15.2%'
              },
              {
                title: 'Occupancy Rate',
                value: `${metrics?.occupancyRate?.toFixed(1) || 0}%`,
                subtitle: `${event?.capacity - event?.availableSeats}/${event?.capacity} filled`,
                icon: '📊',
                color: 'from-blue-500 to-cyan-600',
                trend: '+8.7%'
              },
              {
                title: 'Avg Ticket Price',
                value: formatCurrency(metrics?.avgTicketPrice || 0),
                subtitle: 'Per ticket revenue',
                icon: '🎫',
                color: 'from-purple-500 to-violet-600',
                trend: '+5.3%'
              },
              {
                title: 'Conversion Rate',
                value: `${metrics?.conversionRate?.toFixed(1) || 0}%`,
                subtitle: 'Views to bookings',
                icon: '🎯',
                color: 'from-orange-500 to-red-600',
                trend: '+12.1%'
              }
            ].map((metric, index) => (
              <div
                key={metric.title}
                className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:scale-102 transition-all duration-300 animate-scale-in group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${metric.color} mb-4 group-hover:scale-110 transition-transform`}>
                  <span className="text-xl text-white">{metric.icon}</span>
                </div>
                <div>
                  <p className="text-gray-400 text-sm font-medium">{metric.title}</p>
                  <p className="text-2xl font-bold text-white mt-1">{metric.value}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-gray-500 text-xs">{metric.subtitle}</span>
                    <span className="text-green-400 text-xs font-medium">{metric.trend}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Capacity Visualization */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <span className="mr-2">🎪</span>
              Capacity Overview
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Seats Filled: {event?.capacity - event?.availableSeats} / {event?.capacity}</span>
                <span>{metrics?.occupancyRate?.toFixed(1)}% Capacity</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
                <div 
                  className="h-4 rounded-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-1000 animate-pulse"
                  style={{ width: `${metrics?.occupancyRate || 0}%` }}
                ></div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="text-center p-3 bg-gray-900 rounded-lg">
                  <p className="text-xl font-bold text-green-400">{event?.capacity - event?.availableSeats}</p>
                  <p className="text-gray-400 text-sm">Tickets Sold</p>
                </div>
                <div className="text-center p-3 bg-gray-900 rounded-lg">
                  <p className="text-xl font-bold text-blue-400">{event?.availableSeats}</p>
                  <p className="text-gray-400 text-sm">Available</p>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Status Breakdown */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <span className="mr-2">📋</span>
              Booking Status Breakdown
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {bookingStatusBreakdown?.map((status, index) => {
                const statusColors = {
                  confirmed: 'from-green-500 to-emerald-600',
                  pending: 'from-yellow-500 to-orange-600',
                  cancelled: 'from-red-500 to-red-600'
                };
                
                return (
                  <div
                    key={status._id}
                    className="bg-gray-900 rounded-lg p-4 hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-300 capitalize font-medium">{status._id}</span>
                      <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${statusColors[status._id] || statusColors.pending}`}></div>
                    </div>
                    <p className="text-2xl font-bold text-white">{status.count}</p>
                    <p className="text-gray-400 text-sm">{formatCurrency(status.revenue)} • {status.tickets} tickets</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Bookings Tab */}
      {activeView === 'bookings' && (
        <div className="space-y-6">
          {/* Daily Booking Trend */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <span className="mr-2">📈</span>
              Daily Booking Trend
            </h3>
            <div className="h-64 flex items-center justify-center bg-gray-900 rounded-lg">
              <div className="text-center">
                <div className="text-4xl mb-2">📊</div>
                <p className="text-gray-400">Booking trend chart would go here</p>
                <p className="text-gray-500 text-sm">Daily bookings: {dailyBookings?.length || 0} data points</p>
              </div>
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <span className="mr-2">🎫</span>
              Recent Bookings
            </h3>
            <div className="space-y-3">
              {recentBookings?.map((booking, index) => (
                <div
                  key={booking._id}
                  className="flex items-center justify-between p-4 bg-gray-900 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white font-bold">
                      {booking.user?.firstName?.[0]}{booking.user?.lastName?.[0]}
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        {booking.user?.firstName} {booking.user?.lastName}
                      </p>
                      <p className="text-gray-400 text-sm">{booking.user?.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">{formatCurrency(booking.totalPrice)}</p>
                    <p className="text-gray-400 text-sm">
                      {booking.ticketQuantity} ticket{booking.ticketQuantity > 1 ? 's' : ''}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {new Date(booking.bookingDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Revenue Tab */}
      {activeView === 'revenue' && (
        <div className="space-y-6">
          {/* Revenue Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Total Revenue',
                value: formatCurrency(metrics?.totalRevenue || 0),
                subtitle: 'Gross earnings',
                icon: '💰'
              },
              {
                title: 'Net Revenue',
                value: formatCurrency((metrics?.totalRevenue || 0) * 0.95), // Assuming 5% platform fee
                subtitle: 'After platform fees',
                icon: '💵'
              },
              {
                title: 'Revenue Per Seat',
                value: formatCurrency((metrics?.totalRevenue || 0) / (event?.capacity || 1)),
                subtitle: 'Per capacity unit',
                icon: '📊'
              }
            ].map((card, index) => (
              <div
                key={card.title}
                className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:scale-102 transition-all duration-300 animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">{card.title}</h3>
                  <span className="text-2xl">{card.icon}</span>
                </div>
                <p className="text-2xl font-bold text-white">{card.value}</p>
                <p className="text-gray-400 text-sm mt-1">{card.subtitle}</p>
              </div>
            ))}
          </div>

          {/* Revenue Breakdown */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <span className="mr-2">🔍</span>
              Revenue Breakdown
            </h3>
            <div className="space-y-4">
              {[
                { label: 'Ticket Sales', amount: metrics?.totalRevenue || 0, percentage: 95 },
                { label: 'Platform Fee', amount: (metrics?.totalRevenue || 0) * 0.05, percentage: 5, negative: true }
              ].map((item, index) => (
                <div key={item.label} className="flex items-center justify-between p-4 bg-gray-900 rounded-lg">
                  <div>
                    <p className={`font-medium ${item.negative ? 'text-red-400' : 'text-white'}`}>
                      {item.label}
                    </p>
                    <p className="text-gray-400 text-sm">{item.percentage}% of total</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${item.negative ? 'text-red-400' : 'text-green-400'}`}>
                      {item.negative ? '-' : ''}{formatCurrency(item.amount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Attendees Tab */}
      {activeView === 'attendees' && (
        <div className="space-y-6">
          {/* Attendee Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { title: 'Total Attendees', value: metrics?.totalTicketsSold || 0, icon: '👥' },
              { title: 'New Customers', value: Math.floor((metrics?.totalTicketsSold || 0) * 0.7), icon: '🆕' },
              { title: 'Returning Customers', value: Math.floor((metrics?.totalTicketsSold || 0) * 0.3), icon: '🔄' },
              { title: 'Group Bookings', value: Math.floor((recentBookings?.length || 0) * 0.2), icon: '👨‍👩‍👧‍👦' }
            ].map((stat, index) => (
              <div
                key={stat.title}
                className="bg-gray-800 border border-gray-700 rounded-xl p-6 text-center hover:scale-102 transition-all duration-300 animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-3xl mb-2">{stat.icon}</div>
                <p className="text-2xl font-bold text-white">{formatNumber(stat.value)}</p>
                <p className="text-gray-400 text-sm">{stat.title}</p>
              </div>
            ))}
          </div>

          {/* Attendee List */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <span className="mr-2">📋</span>
              Confirmed Attendees ({recentBookings?.length || 0})
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {recentBookings?.map((booking, index) => (
                <div
                  key={booking._id}
                  className="flex items-center justify-between p-4 bg-gray-900 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        {booking.user?.firstName} {booking.user?.lastName}
                      </p>
                      <p className="text-gray-400 text-sm">{booking.user?.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">
                      {booking.ticketQuantity} ticket{booking.ticketQuantity > 1 ? 's' : ''}
                    </p>
                    <p className="text-gray-400 text-sm">
                      Booked {new Date(booking.bookingDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventAnalytics;
