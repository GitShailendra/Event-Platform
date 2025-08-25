import React, { useState } from 'react';

const OrganizerEvents = () => {
  const [activeFilter, setActiveFilter] = useState('all');

  const events = [
    {
      id: 1,
      title: 'React Advanced Workshop',
      description: 'Deep dive into React hooks, context, and performance optimization.',
      date: '2025-09-15',
      time: '10:00 AM',
      location: 'Mumbai Tech Hub',
      status: 'active',
      attendees: 45,
      maxAttendees: 50,
      price: 2500,
      earnings: 112500,
      category: 'workshops',
      image: null
    },
    {
      id: 2,
      title: 'AI Summit Conference 2025',
      description: 'Leading experts discuss the future of artificial intelligence.',
      date: '2025-10-20',
      time: '9:00 AM',
      location: 'Bangalore Convention Center',
      status: 'upcoming',
      attendees: 120,
      maxAttendees: 200,
      price: 4000,
      earnings: 480000,
      category: 'conferences',
      image: null
    },
    {
      id: 3,
      title: 'JavaScript Bootcamp',
      description: 'Comprehensive JavaScript training for beginners to advanced.',
      date: '2025-08-28',
      time: '11:00 AM',
      location: 'Online',
      status: 'completed',
      attendees: 35,
      maxAttendees: 40,
      price: 1500,
      earnings: 52500,
      category: 'workshops',
      image: null
    },
    {
      id: 4,
      title: 'Startup Pitch Night',
      description: 'Entrepreneurs pitch their ideas to investors and mentors.',
      date: '2025-07-15',
      time: '6:00 PM',
      location: 'Delhi Business Hub',
      status: 'completed',
      attendees: 80,
      maxAttendees: 100,
      price: 500,
      earnings: 40000,
      category: 'meetups',
      image: null
    },
    {
      id: 5,
      title: 'Web Development Masterclass',
      description: 'Build modern web applications with the latest technologies.',
      date: '2025-11-15',
      time: '2:00 PM',
      location: 'Chennai Tech Park',
      status: 'draft',
      attendees: 0,
      maxAttendees: 60,
      price: 3000,
      earnings: 0,
      category: 'workshops',
      image: null
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
      active: { class: 'bg-green-900 text-green-300 border-green-700', label: 'Active', dot: 'bg-green-400' },
      upcoming: { class: 'bg-blue-900 text-blue-300 border-blue-700', label: 'Upcoming', dot: 'bg-blue-400' },
      completed: { class: 'bg-gray-700 text-gray-300 border-gray-600', label: 'Completed', dot: 'bg-gray-400' },
      draft: { class: 'bg-yellow-900 text-yellow-300 border-yellow-700', label: 'Draft', dot: 'bg-yellow-400' },
      cancelled: { class: 'bg-red-900 text-red-300 border-red-700', label: 'Cancelled', dot: 'bg-red-400' }
    };
    return badges[status] || badges.draft;
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

  const filteredEvents = events.filter(event => 
    activeFilter === 'all' || event.status === activeFilter
  );

  const filterButtons = [
    { key: 'all', label: 'All Events', count: events.length },
    { key: 'active', label: 'Active', count: events.filter(e => e.status === 'active').length },
    { key: 'upcoming', label: 'Upcoming', count: events.filter(e => e.status === 'upcoming').length },
    { key: 'draft', label: 'Drafts', count: events.filter(e => e.status === 'draft').length },
    { key: 'completed', label: 'Completed', count: events.filter(e => e.status === 'completed').length }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">My Events</h1>
          <p className="text-gray-400 mt-1">{filteredEvents.length} events found</p>
        </div>
        <div className="flex space-x-3">
          <button className="btn-secondary">
            <span className="mr-2">📊</span>
            Analytics
          </button>
          <button className="btn-primary">
            <span className="mr-2">➕</span>
            Create Event
          </button>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-3">
        {filterButtons.map(filter => (
          <button
            key={filter.key}
            onClick={() => setActiveFilter(filter.key)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              activeFilter === filter.key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-700'
            }`}
          >
            {filter.label}
            <span className="ml-2 text-sm opacity-75">({filter.count})</span>
          </button>
        ))}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredEvents.map((event, index) => {
          const statusBadge = getStatusBadge(event.status);
          const attendancePercentage = event.maxAttendees > 0 ? (event.attendees / event.maxAttendees) * 100 : 0;
          
          return (
            <div
              key={event.id}
              className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden hover:scale-102 transition-all duration-300 animate-scale-in group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Event Header */}
              <div className="relative h-32 gradient-bg flex items-center justify-center">
                <span className="text-4xl text-white group-hover:scale-110 transition-transform">
                  {getCategoryIcon(event.category)}
                </span>
                
                {/* Status indicator */}
                <div className="absolute top-3 left-3 flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${statusBadge.dot} animate-pulse`}></div>
                  <span className="text-white text-xs font-medium bg-black bg-opacity-50 px-2 py-1 rounded">
                    {statusBadge.label}
                  </span>
                </div>

                {/* Price badge */}
                <div className="absolute top-3 right-3 bg-black bg-opacity-50 backdrop-blur-sm rounded-full px-3 py-1">
                  <span className="text-white text-xs font-medium">
                    {event.price === 0 ? 'Free' : formatCurrency(event.price)}
                  </span>
                </div>
              </div>

              {/* Event Content */}
              <div className="p-6">
                <div className="mb-3">
                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
                    {event.title}
                  </h3>
                  <p className="text-gray-300 text-sm line-clamp-2 leading-relaxed">
                    {event.description}
                  </p>
                </div>

                <div className="space-y-2 text-sm text-gray-400 mb-4">
                  <div className="flex items-center">
                    <span className="text-blue-400 mr-2">📅</span>
                    {formatDate(event.date)} at {event.time}
                  </div>
                  <div className="flex items-center">
                    <span className="text-green-400 mr-2">📍</span>
                    {event.location}
                  </div>
                  <div className="flex items-center">
                    <span className="text-purple-400 mr-2">👥</span>
                    {event.attendees}/{event.maxAttendees} attendees
                  </div>
                  {event.earnings > 0 && (
                    <div className="flex items-center">
                      <span className="text-yellow-400 mr-2">💰</span>
                      {formatCurrency(event.earnings)} earned
                    </div>
                  )}
                </div>

                {/* Attendance Progress Bar */}
                {event.status !== 'draft' && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Attendance</span>
                      <span>{Math.round(attendancePercentage)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          attendancePercentage > 80 ? 'bg-green-500' : 
                          attendancePercentage > 50 ? 'bg-blue-500' : 'bg-yellow-500'
                        }`}
                        style={{ width: `${attendancePercentage}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  {event.status === 'draft' ? (
                    <>
                      <button className="btn-primary text-sm px-4 py-2 flex-1">
                        Continue Editing
                      </button>
                      <button className="btn-secondary text-sm px-3 py-2">
                        <span className="text-lg">🗑️</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="btn-primary text-sm px-4 py-2 flex-1">
                        Manage
                      </button>
                      <button className="btn-secondary text-sm px-3 py-2">
                        <span className="text-lg">📊</span>
                      </button>
                      <button className="btn-secondary text-sm px-3 py-2">
                        <span className="text-lg">✏️</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredEvents.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4 animate-float">🎪</div>
          <h2 className="text-2xl font-bold text-white mb-2">No Events Found</h2>
          <p className="text-gray-400 mb-6">
            {activeFilter === 'all' 
              ? "You haven't created any events yet." 
              : `No ${activeFilter} events found.`
            }
          </p>
          <button className="btn-primary">
            Create Your First Event
          </button>
        </div>
      )}
    </div>
  );
};

export default OrganizerEvents;
