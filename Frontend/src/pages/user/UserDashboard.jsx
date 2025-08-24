import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Mock user data
  const user = {
    name: 'John Doe',
    email: 'john.doe@email.com',
    avatar: null,
    memberSince: '2024-01-15',
    location: 'Mumbai, India',
    totalBookings: 12,
    upcomingEvents: 3,
    completedEvents: 9
  };

  // Mock user's bookings
  const userBookings = [
    {
      id: 1,
      eventTitle: 'React Workshop 2025',
      date: '2025-09-15',
      time: '10:00 AM',
      location: 'Mumbai Tech Hub',
      status: 'confirmed',
      price: 2500,
      ticketNumber: 'EVT-001234',
      category: 'workshops'
    },
    {
      id: 2,
      eventTitle: 'AI Summit Conference',
      date: '2025-10-20',
      time: '9:00 AM',
      location: 'Bangalore Convention Center',
      status: 'confirmed',
      price: 4000,
      ticketNumber: 'EVT-001235',
      category: 'conferences'
    },
    {
      id: 3,
      eventTitle: 'Photography Masterclass',
      date: '2025-11-05',
      time: '2:00 PM',
      location: 'Delhi Creative Studio',
      status: 'pending',
      price: 1800,
      ticketNumber: 'EVT-001236',
      category: 'workshops'
    }
  ];

  // Mock past events
  const pastEvents = [
    {
      id: 1,
      eventTitle: 'JavaScript Bootcamp',
      date: '2025-08-20',
      location: 'Online',
      rating: 5,
      reviewed: true,
      price: 1500
    },
    {
      id: 2,
      eventTitle: 'Design Thinking Workshop',
      date: '2025-07-15',
      location: 'Pune',
      rating: 4,
      reviewed: true,
      price: 2000
    },
    {
      id: 3,
      eventTitle: 'Mobile App Development',
      date: '2025-06-10',
      location: 'Chennai',
      rating: null,
      reviewed: false,
      price: 3500
    }
  ];

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const sidebarItems = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'upcoming-events', name: 'Upcoming Events', icon: '📅' },
    { id: 'past-events', name: 'Past Events', icon: '📚' },
    { id: 'favorites', name: 'Favorites', icon: '❤️' },
    { id: 'tickets', name: 'My Tickets', icon: '🎫' },
    { id: 'profile', name: 'Profile Settings', icon: '👤' }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center animate-pulse">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 border-r border-gray-700 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center text-white font-bold text-sm">
              E
            </div>
            <span className="text-xl font-bold text-white">EventHub</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* User Profile Section */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 gradient-bg rounded-full flex items-center justify-center text-white font-bold text-lg">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <h3 className="text-white font-semibold">{user.name}</h3>
              <p className="text-gray-400 text-sm">{user.location}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          <ul className="space-y-2">
            {sidebarItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                    activeTab === item.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Quick Actions */}
        <div className="p-4 mt-auto">
          <Link
            to="/events"
            className="w-full btn-primary text-center py-3 mb-3 block"
          >
            Browse Events
          </Link>
          <Link
            to="/help"
            className="w-full btn-secondary text-center py-3 block"
          >
            Need Help?
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        {/* Mobile Header */}
        <div className="lg:hidden bg-gray-900 border-b border-gray-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-400 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold text-white">Dashboard</h1>
            <div></div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
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
                  <Link to="#" className="text-blue-400 hover:text-blue-300 text-sm">View All</Link>
                </div>
                <div className="space-y-4">
                  {userBookings.slice(0, 3).map(booking => (
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
            </div>
          )}

          {/* Upcoming Events Tab */}
          {activeTab === 'upcoming-events' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">Upcoming Events</h1>
                <span className="text-gray-400">{userBookings.length} events</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userBookings.map((event, index) => (
                  <div
                    key={event.id}
                    className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden hover:scale-105 transition-all duration-300 animate-scale-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="h-32 gradient-bg flex items-center justify-center">
                      <span className="text-4xl text-white">{getCategoryIcon(event.category)}</span>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(event.status)}`}>
                          {event.status}
                        </span>
                        <span className="text-blue-400 font-semibold">{formatCurrency(event.price)}</span>
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">{event.eventTitle}</h3>
                      <div className="space-y-2 text-sm text-gray-400 mb-4">
                        <div className="flex items-center">
                          <span className="mr-2">📅</span>
                          {formatDate(event.date)} at {event.time}
                        </div>
                        <div className="flex items-center">
                          <span className="mr-2">📍</span>
                          {event.location}
                        </div>
                        <div className="flex items-center">
                          <span className="mr-2">🎫</span>
                          Ticket: {event.ticketNumber}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button className="btn-primary text-sm px-4 py-2 flex-1">
                          View Ticket
                        </button>
                        <button className="btn-secondary text-sm px-4 py-2">
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Past Events Tab */}
          {activeTab === 'past-events' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">Past Events</h1>
                <span className="text-gray-400">{pastEvents.length} events attended</span>
              </div>

              <div className="space-y-4">
                {pastEvents.map((event, index) => (
                  <div
                    key={event.id}
                    className="bg-gray-800 border border-gray-700 rounded-xl p-6 animate-scale-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="flex-1 mb-4 md:mb-0">
                        <h3 className="text-lg font-bold text-white mb-2">{event.eventTitle}</h3>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                          <span>📅 {formatDate(event.date)}</span>
                          <span>📍 {event.location}</span>
                          <span>💰 {formatCurrency(event.price)}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        {event.rating && (
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                className={i < event.rating ? 'text-yellow-400' : 'text-gray-600'}
                              >
                                ⭐
                              </span>
                            ))}
                          </div>
                        )}
                        {!event.reviewed && (
                          <button className="btn-primary text-sm px-4 py-2">
                            Write Review
                          </button>
                        )}
                        <button className="btn-secondary text-sm px-4 py-2">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* My Tickets Tab */}
          {activeTab === 'tickets' && (
            <div className="space-y-6 animate-fade-in">
              <h1 className="text-2xl font-bold text-white">My Tickets</h1>

              <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-700">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Event</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Ticket #</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {userBookings.map(booking => (
                        <tr key={booking.id} className="hover:bg-gray-700 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <span className="text-2xl mr-3">{getCategoryIcon(booking.category)}</span>
                              <div>
                                <div className="font-medium text-white">{booking.eventTitle}</div>
                                <div className="text-gray-400 text-sm">{booking.location}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-300">
                            <div>{formatDate(booking.date)}</div>
                            <div className="text-gray-400 text-sm">{booking.time}</div>
                          </td>
                          <td className="px-6 py-4 text-gray-300 font-mono text-sm">
                            {booking.ticketNumber}
                          </td>
                          <td className="px-6 py-4 text-gray-300">
                            {formatCurrency(booking.price)}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(booking.status)}`}>
                              {booking.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              <button className="text-blue-400 hover:text-blue-300 text-sm">
                                Download
                              </button>
                              <button className="text-gray-400 hover:text-gray-300 text-sm">
                                Share
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Profile Settings Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-fade-in">
              <h1 className="text-2xl font-bold text-white">Profile Settings</h1>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Personal Information */}
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Personal Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        defaultValue={user.name}
                        className="w-full py-3 px-4 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        defaultValue={user.email}
                        className="w-full py-3 px-4 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        defaultValue={user.location}
                        className="w-full py-3 px-4 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
                      />
                    </div>
                    <button className="btn-primary w-full">
                      Update Profile
                    </button>
                  </div>
                </div>

                {/* Preferences */}
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Notifications</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                      <div>
                        <h4 className="font-medium text-white">Email Notifications</h4>
                        <p className="text-gray-400 text-sm">Event updates and reminders</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                      <div>
                        <h4 className="font-medium text-white">SMS Notifications</h4>
                        <p className="text-gray-400 text-sm">Event reminders via SMS</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                      <div>
                        <h4 className="font-medium text-white">Marketing Emails</h4>
                        <p className="text-gray-400 text-sm">New events and promotions</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Favorites Tab */}
          {activeTab === 'favorites' && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center py-16">
                <div className="text-6xl mb-4">❤️</div>
                <h2 className="text-2xl font-bold text-white mb-2">No Favorites Yet</h2>
                <p className="text-gray-400 mb-6">
                  Start adding events to your favorites to see them here
                </p>
                <Link to="/events" className="btn-primary">
                  Browse Events
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default UserDashboard;
