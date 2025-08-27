import React, { useState, useEffect } from 'react';
import { eventAPI } from '../../api';
import CreateEventModal from './CreateEventModal';

const OrganizerEvents = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch organizer events on component mount
  useEffect(() => {
    fetchOrganizerEvents();
  }, []);

  // Extract fetchOrganizerEvents as a separate function for reuse
  const fetchOrganizerEvents = async () => {
    try {
      setLoading(true);
      const response = await eventAPI.getOrganizerEvents();
      setEvents(response || []);
    } catch (error) {
      console.error('Error fetching organizer events:', error);
      setError(error.message || 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  // Handle successful event creation
  const handleEventCreated = (newEvent) => {
    setEvents(prev => [newEvent, ...prev]);
    console.log('Event created successfully:', newEvent);
  };

  // Handle retry on error
  const handleRetry = () => {
    setError(null);
    fetchOrganizerEvents();
  };

  // Handle create new event from empty state
  const handleCreateFromEmpty = () => {
    setShowCreateModal(true);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
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
      published: { class: 'bg-green-900 text-green-300 border-green-700', label: 'Active', dot: 'bg-green-400' },
      draft: { class: 'bg-yellow-900 text-yellow-300 border-yellow-700', label: 'Draft', dot: 'bg-yellow-400' },
      completed: { class: 'bg-gray-700 text-gray-300 border-gray-600', label: 'Completed', dot: 'bg-gray-400' },
      cancelled: { class: 'bg-red-900 text-red-300 border-red-700', label: 'Cancelled', dot: 'bg-red-400' }
    };
    return badges[status] || badges.draft;
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

  // Calculate earnings and attendees
  const calculateEventMetrics = (event) => {
    const attendees = event.capacity - event.availableSeats;
    const earnings = attendees * event.price;
    const attendancePercentage = event.capacity > 0 ? (attendees / event.capacity) * 100 : 0;
    
    return { attendees, earnings, attendancePercentage };
  };

  const filteredEvents = events.filter(event => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'active') return event.status === 'published';
    if (activeFilter === 'upcoming') {
      const eventDate = new Date(event.date);
      const today = new Date();
      return event.status === 'published' && eventDate > today;
    }
    return event.status === activeFilter;
  });

  const filterButtons = [
    { key: 'all', label: 'All Events', count: events.length },
    { key: 'active', label: 'Active', count: events.filter(e => e.status === 'published').length },
    { key: 'upcoming', label: 'Upcoming', count: events.filter(e => {
      const eventDate = new Date(e.date);
      const today = new Date();
      return e.status === 'published' && eventDate > today;
    }).length },
    { key: 'draft', label: 'Drafts', count: events.filter(e => e.status === 'draft').length },
    { key: 'completed', label: 'Completed', count: events.filter(e => e.status === 'completed').length }
  ];

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-400">Loading your events...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="text-center py-16">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-2">Error Loading Events</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button 
            onClick={handleRetry}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
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
            <button 
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
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
            const { attendees, earnings, attendancePercentage } = calculateEventMetrics(event);
            
            return (
              <div
                key={event._id}
                className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden hover:scale-102 transition-all duration-300 animate-scale-in group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Event Header */}
                <div className="relative h-32 gradient-bg flex items-center justify-center">
                  {event.images && event.images.length > 0 ? (
                    <img 
                      src={event.images[0]} 
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl text-white group-hover:scale-110 transition-transform">
                      {getCategoryIcon(event.category)}
                    </span>
                  )}
                  
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
                      {formatDate(event.date)} at {formatTime(event.date)}
                    </div>
                    <div className="flex items-center">
                      <span className="text-green-400 mr-2">📍</span>
                      {event.location}
                    </div>
                    <div className="flex items-center">
                      <span className="text-purple-400 mr-2">👥</span>
                      {attendees}/{event.capacity} attendees
                    </div>
                    {earnings > 0 && (
                      <div className="flex items-center">
                        <span className="text-yellow-400 mr-2">💰</span>
                        {formatCurrency(earnings)} earned
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
        {filteredEvents.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4 animate-float">🎪</div>
            <h2 className="text-2xl font-bold text-white mb-2">No Events Found</h2>
            <p className="text-gray-400 mb-6">
              {activeFilter === 'all' 
                ? "You haven't created any events yet." 
                : `No ${activeFilter} events found.`
              }
            </p>
            <button 
              onClick={handleCreateFromEmpty}
              className="btn-primary"
            >
              Create Your First Event
            </button>
          </div>
        )}
      </div>

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onEventCreated={handleEventCreated}
      />
    </>
  );
};

export default OrganizerEvents;
