import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  // Mock data
  const user = {
    name: 'John Doe',
    totalBookings: 12,
    upcomingEvents: 3,
    completedEvents: 9
  };

  const recentBookings = [
    {
      id: 1,
      eventTitle: 'React Workshop 2025',
      date: '2025-09-15',
      time: '10:00 AM',
      price: 2500,
      status: 'confirmed',
      category: 'workshops'
    },
    {
      id: 2,
      eventTitle: 'AI Summit Conference',
      date: '2025-10-20',
      time: '9:00 AM',
      price: 4000,
      status: 'confirmed',
      category: 'conferences'
    },
    {
      id: 3,
      eventTitle: 'Photography Masterclass',
      date: '2025-11-05',
      time: '2:00 PM',
      price: 1800,
      status: 'pending',
      category: 'workshops'
    }
  ];

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const badges = {
      confirmed: 'bg-green-900 text-green-300 border-green-700',
      pending: 'bg-yellow-900 text-yellow-300 border-yellow-700',
      cancelled: 'bg-red-900 text-red-300 border-red-700'
    };
    return badges[status] || 'bg-gray-900 text-gray-300 border-gray-700';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      concerts: '🎵',
      workshops: '🛠️',
      webinars: '💻',
      meetups: '🤝',
      conferences: '🎪'
    };
    return icons[category] || '📅';
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Welcome back, {user.name.split(' ')[0]}! 👋
            </h1>
            <p className="text-gray-400">
              You have {user.upcomingEvents} upcoming events and {user.completedEvents} completed events.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link to="/events" className="btn-primary">
              Explore Events
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Bookings', value: user.totalBookings, icon: '🎫', color: 'blue' },
          { label: 'Upcoming Events', value: user.upcomingEvents, icon: '📅', color: 'green' },
          { label: 'Completed Events', value: user.completedEvents, icon: '✅', color: 'purple' }
        ].map((stat, index) => (
          <div
            key={stat.label}
            className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:scale-105 transition-all duration-300 animate-scale-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
                <p className={`text-2xl font-bold text-${stat.color}-400 mt-1`}>{stat.value}</p>
              </div>
              <div className="text-3xl">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Bookings */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Recent Bookings</h2>
          <Link to="/user/upcoming-events" className="text-blue-400 hover:text-blue-300 text-sm">
            View All
          </Link>
        </div>
        <div className="space-y-4">
          {recentBookings.map(booking => (
            <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="text-2xl">{getCategoryIcon(booking.category)}</div>
                <div>
                  <h3 className="font-semibold text-white">{booking.eventTitle}</h3>
                  <p className="text-gray-400 text-sm">
                    {formatDate(booking.date)} at {booking.time}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-white">{formatCurrency(booking.price)}</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(booking.status)}`}>
                  {booking.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/events" className="flex items-center p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
            <span className="text-2xl mr-4">🔍</span>
            <div>
              <h4 className="font-semibold text-white">Browse Events</h4>
              <p className="text-gray-400 text-sm">Find new events to attend</p>
            </div>
          </Link>
          <Link to="/user/tickets" className="flex items-center p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
            <span className="text-2xl mr-4">🎫</span>
            <div>
              <h4 className="font-semibold text-white">My Tickets</h4>
              <p className="text-gray-400 text-sm">View and manage tickets</p>
            </div>
          </Link>
          <Link to="/user/profile" className="flex items-center p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
            <span className="text-2xl mr-4">👤</span>
            <div>
              <h4 className="font-semibold text-white">Profile Settings</h4>
              <p className="text-gray-400 text-sm">Update your preferences</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
