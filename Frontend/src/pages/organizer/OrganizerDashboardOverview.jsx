import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { organizerDashboardAPI } from '../../api'; // Import the new API

const OrganizerDashboardOverview = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch real dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await organizerDashboardAPI.getDashboardOverview();
      setDashboardData(response.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: 'bg-green-900 text-green-300 border-green-700',
      upcoming: 'bg-blue-900 text-blue-300 border-blue-700',
      completed: 'bg-gray-700 text-gray-300 border-gray-600',
      published: 'bg-green-900 text-green-300 border-green-700',
      draft: 'bg-yellow-900 text-yellow-300 border-yellow-700'
    };
    return badges[status] || 'bg-gray-700 text-gray-300 border-gray-600';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      concert: '🎵',
      workshop: '🛠️',
      webinar: '💻',
      meetup: '🤝',
      conference: '🎪',
      other: '📅'
    };
    return icons[category] || '📅';
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-400">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="text-center py-16">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { organizer, recentEvents, analyticsData, topEvents, stats } = dashboardData;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Welcome back, {organizer.name.split(' ')[0]}! 👋
            </h1>
            <p className="text-gray-400">
              {organizer.company} • {organizer.activeEvents} active events
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <Link to="/organizer/events" className="btn-primary">
              Create Event
            </Link>
            <Link to="/organizer/analytics" className="btn-secondary">
              View Analytics
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards - Using Real Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            label: 'Total Events', 
            value: organizer.totalEvents, 
            icon: '🎪', 
            color: 'blue', 
            change: `${stats.thisMonthBookings} bookings this month` 
          },
          { 
            label: 'Active Events', 
            value: organizer.activeEvents, 
            icon: '🔴', 
            color: 'green', 
            change: 'Currently running' 
          },
          { 
            label: 'Total Earnings', 
            value: formatCurrency(organizer.totalEarnings), 
            icon: '💰', 
            color: 'yellow', 
            change: `+${formatCurrency(organizer.thisMonthEarnings)} this month` 
          },
          { 
            label: 'Total Attendees', 
            value: organizer.totalAttendees.toLocaleString(), 
            icon: '👥', 
            color: 'purple', 
            change: `+${organizer.thisMonthAttendees} this month` 
          }
        ].map((stat, index) => (
          <div
            key={stat.label}
            className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:scale-105 transition-all duration-300 animate-scale-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-3xl">{stat.icon}</div>
              <div className={`text-2xl font-bold text-${stat.color}-400`}>
                {stat.value}
              </div>
            </div>
            <div>
              <p className="text-gray-400 text-sm font-medium mb-1">{stat.label}</p>
              <p className="text-gray-500 text-xs">{stat.change}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Events & Analytics - Using Real Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Events */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Recent Events</h2>
            <Link to="/organizer/events" className="text-blue-400 hover:text-blue-300 text-sm">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {recentEvents.map(event => (
              <div key={event.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">{getCategoryIcon(event.category)}</div>
                  <div>
                    <h3 className="font-semibold text-white">{event.title}</h3>
                    <p className="text-gray-400 text-sm">
                      {formatDate(event.date)} • {event.attendees} attendees
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-400">{formatCurrency(event.earnings)}</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(event.status)}`}>
                    {event.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Overview - Using Real Data */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Performance Overview</h2>
            <Link to="/organizer/analytics" className="text-blue-400 hover:text-blue-300 text-sm">
              Detailed Analytics
            </Link>
          </div>
          <div className="space-y-4">
            {analyticsData.map((data, index) => (
              <div key={data.month} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {data.month.charAt(0)}
                  </div>
                  <span className="text-gray-300 font-medium">{data.month}</span>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-semibold">{formatCurrency(data.earnings)}</p>
                  <p className="text-gray-400 text-sm">{data.attendees} attendees</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link to="/organizer/events" className="flex items-center p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
            <span className="text-2xl mr-4">➕</span>
            <div>
              <h4 className="font-semibold text-white">Create Event</h4>
              <p className="text-gray-400 text-sm">Start organizing</p>
            </div>
          </Link>
          <Link to="/organizer/events" className="flex items-center p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
            <span className="text-2xl mr-4">📋</span>
            <div>
              <h4 className="font-semibold text-white">Manage Events</h4>
              <p className="text-gray-400 text-sm">Edit & monitor</p>
            </div>
          </Link>
          <Link to="/organizer/analytics" className="flex items-center p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
            <span className="text-2xl mr-4">📊</span>
            <div>
              <h4 className="font-semibold text-white">View Analytics</h4>
              <p className="text-gray-400 text-sm">Performance data</p>
            </div>
          </Link>
          <Link to="/organizer/analytics" className="flex items-center p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
            <span className="text-2xl mr-4">💰</span>
            <div>
              <h4 className="font-semibold text-white">Earnings</h4>
              <p className="text-gray-400 text-sm">Revenue reports</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrganizerDashboardOverview;
