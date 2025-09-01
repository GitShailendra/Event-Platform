import React, { useState, useEffect } from 'react';

const EventsManagement = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);

  // Dummy data
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setEvents([
        {
          id: 1,
          title: 'Tech Conference 2024',
          organizer: 'Tech Events Ltd.',
          organizerEmail: 'john@techevents.com',
          category: 'Technology',
          date: '2024-02-15',
          time: '10:00 AM',
          location: 'Mumbai Convention Center',
          status: 'active',
          attendees: 150,
          maxAttendees: 200,
          ticketPrice: 2500,
          revenue: 375000,
          description: 'Annual technology conference featuring latest trends',
          createdAt: '2024-01-10'
        },
        {
          id: 2,
          title: 'Music Festival Mumbai',
          organizer: 'Concert King',
          organizerEmail: 'mike@concertking.com',
          category: 'Music',
          date: '2024-03-20',
          time: '6:00 PM',
          location: 'Oval Maidan, Mumbai',
          status: 'published',
          attendees: 45,
          maxAttendees: 500,
          ticketPrice: 1500,
          revenue: 67500,
          description: 'Live music festival with multiple artists',
          createdAt: '2024-01-12'
        },
        {
          id: 3,
          title: 'Startup Networking Event',
          organizer: 'EventPro Solutions',
          organizerEmail: 'sarah@eventpro.com',
          category: 'Business',
          date: '2024-01-25',
          time: '7:00 PM',
          location: 'WeWork BKC',
          status: 'completed',
          attendees: 80,
          maxAttendees: 100,
          ticketPrice: 500,
          revenue: 40000,
          description: 'Networking event for startup enthusiasts',
          createdAt: '2024-01-05'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.organizer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleEventAction = (eventId, action) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId 
        ? { ...event, status: action }
        : event
    ));
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: 'bg-gray-700 text-gray-300 border-gray-600',
      published: 'bg-blue-900 text-blue-300 border-blue-700',
      active: 'bg-green-900 text-green-300 border-green-700',
      completed: 'bg-purple-900 text-purple-300 border-purple-700',
      cancelled: 'bg-red-900 text-red-300 border-red-700'
    };
    return badges[status];
  };

  const getCategoryIcon = (category) => {
    const icons = {
      Technology: '💻',
      Music: '🎵',
      Business: '💼',
      Sports: '⚽',
      Food: '🍕',
      Arts: '🎨'
    };
    return icons[category] || '📅';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
        <span className="ml-3 text-gray-400">Loading events...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Events Management</h1>
          <p className="text-gray-400">Monitor and manage all platform events</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All Events' },
              { key: 'published', label: 'Published' },
              { key: 'active', label: 'Active' },
              { key: 'completed', label: 'Completed' },
              { key: 'cancelled', label: 'Cancelled' }
            ].map(filterOption => (
              <button
                key={filterOption.key}
                onClick={() => setStatusFilter(filterOption.key)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === filterOption.key
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {filterOption.label}
              </button>
            ))}
          </div>
          
          <div className="flex gap-4">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
            >
              <option value="all">All Categories</option>
              <option value="Technology">Technology</option>
              <option value="Music">Music</option>
              <option value="Business">Business</option>
              <option value="Sports">Sports</option>
              <option value="Food">Food</option>
              <option value="Arts">Arts</option>
            </select>
            
            <div className="relative">
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
              />
              <svg className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="text-left py-4 px-6 text-gray-300 font-medium">Event</th>
                <th className="text-left py-4 px-6 text-gray-300 font-medium">Organizer</th>
                <th className="text-left py-4 px-6 text-gray-300 font-medium">Date & Time</th>
                <th className="text-left py-4 px-6 text-gray-300 font-medium">Status</th>
                <th className="text-left py-4 px-6 text-gray-300 font-medium">Attendees</th>
                <th className="text-left py-4 px-6 text-gray-300 font-medium">Revenue</th>
                <th className="text-left py-4 px-6 text-gray-300 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map(event => (
                <tr key={event.id} className="border-t border-gray-700 hover:bg-gray-700/50">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{getCategoryIcon(event.category)}</div>
                      <div>
                        <p className="text-white font-medium">{event.title}</p>
                        <p className="text-gray-400 text-sm">{event.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-white">{event.organizer}</p>
                    <p className="text-gray-400 text-sm">{event.organizerEmail}</p>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-white">{event.date}</p>
                    <p className="text-gray-400 text-sm">{event.time}</p>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(event.status)}`}>
                      {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-white">{event.attendees}/{event.maxAttendees}</p>
                    <div className="w-full bg-gray-600 rounded-full h-2 mt-1">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${(event.attendees / event.maxAttendees) * 100}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-white">
                    ₹{event.revenue.toLocaleString()}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedEvent(event);
                          setShowEventModal(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                      >
                        View
                      </button>
                      {event.status === 'published' && (
                        <button
                          onClick={() => handleEventAction(event.id, 'cancelled')}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Event Details Modal */}
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-3xl w-full mx-4 border border-gray-700 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Event Details</h3>
              <button
                onClick={() => setShowEventModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Event Header */}
              <div className="flex items-start space-x-4">
                <div className="text-4xl">{getCategoryIcon(selectedEvent.category)}</div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-2">{selectedEvent.title}</h2>
                  <p className="text-gray-400">{selectedEvent.description}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadge(selectedEvent.status)}`}>
                  {selectedEvent.status.charAt(0).toUpperCase() + selectedEvent.status.slice(1)}
                </span>
              </div>

              {/* Event Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-gray-400 text-sm">Organizer</label>
                    <p className="text-white font-medium">{selectedEvent.organizer}</p>
                    <p className="text-gray-400 text-sm">{selectedEvent.organizerEmail}</p>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Date & Time</label>
                    <p className="text-white font-medium">{selectedEvent.date}</p>
                    <p className="text-gray-400 text-sm">{selectedEvent.time}</p>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Location</label>
                    <p className="text-white font-medium">{selectedEvent.location}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-gray-400 text-sm">Category</label>
                    <p className="text-white font-medium">{selectedEvent.category}</p>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Ticket Price</label>
                    <p className="text-white font-medium">₹{selectedEvent.ticketPrice.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Created</label>
                    <p className="text-white font-medium">{selectedEvent.createdAt}</p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Attendees</p>
                  <p className="text-2xl font-bold text-white">{selectedEvent.attendees}/{selectedEvent.maxAttendees}</p>
                  <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${(selectedEvent.attendees / selectedEvent.maxAttendees) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Revenue</p>
                  <p className="text-2xl font-bold text-green-400">₹{selectedEvent.revenue.toLocaleString()}</p>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Occupancy</p>
                  <p className="text-2xl font-bold text-blue-400">{Math.round((selectedEvent.attendees / selectedEvent.maxAttendees) * 100)}%</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-4 border-t border-gray-700">
                {selectedEvent.status === 'published' && (
                  <button
                    onClick={() => handleEventAction(selectedEvent.id, 'cancelled')}
                    className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg"
                  >
                    Cancel Event
                  </button>
                )}
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg">
                  Contact Organizer
                </button>
                <button className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg">
                  Download Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsManagement;
