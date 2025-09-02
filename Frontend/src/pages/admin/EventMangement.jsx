import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api'; // Adjust path as needed

const EventsManagement = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);

  // Fetch real events data
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await adminAPI.getAllEvents();
        console.log('Fetched events:', response);
        
        // Map events to frontend format
        const mappedEvents = response.map(event => ({
          id: event._id,
          title: event.title,
          organizer: event.createdBy ? `${event.createdBy.firstName} ${event.createdBy.lastName}` : 'Unknown',
          organizerEmail: event.createdBy ? event.createdBy.email : 'N/A',
          category: event.category,
          date: new Date(event.date).toLocaleDateString(),
          time: new Date(event.date).toLocaleTimeString(),
          location: event.location,
          venue: event.venue || 'N/A',
          status: event.status,
          attendees: event.totalAttendees || 0,
          maxAttendees: event.capacity,
          ticketPrice: event.price,
          revenue: event.totalEarnings || 0,
          description: event.description,
          createdAt: new Date(event.createdAt).toLocaleDateString(),
          images: event.images || [],
          tags: event.tags || [],
          isFeatured: event.isFeatured,
          availableSeats: event.availableSeats,
          endDate: event.endDate ? new Date(event.endDate).toLocaleDateString() : null
        }));
        
        setEvents(mappedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.organizer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusBadge = (status) => {
    const badges = {
      draft: 'bg-gray-700 text-gray-300 border-gray-600',
      published: 'bg-blue-900 text-blue-300 border-blue-700',
      active: 'bg-green-900 text-green-300 border-green-700',
      completed: 'bg-purple-900 text-purple-300 border-purple-700',
      cancelled: 'bg-red-900 text-red-300 border-red-700'
    };
    return badges[status] || badges.draft;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      concert: '🎵',
      workshop: '🛠️',
      webinar: '💻',
      meetup: '👥',
      conference: '🏢',
      other: '📅'
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
        <div className="mt-4 md:mt-0">
          <span className="text-gray-400">Total Events: </span>
          <span className="text-white font-bold">{events.length}</span>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All Events' },
              { key: 'published', label: 'Published' },
              { key: 'draft', label: 'Draft' },
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
              <option value="concert">Concert</option>
              <option value="workshop">Workshop</option>
              <option value="webinar">Webinar</option>
              <option value="meetup">Meetup</option>
              <option value="conference">Conference</option>
              <option value="other">Other</option>
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
                <th className="text-left py-4 px-6 text-gray-300 font-medium">Capacity</th>
                <th className="text-left py-4 px-6 text-gray-300 font-medium">Revenue</th>
                <th className="text-left py-4 px-6 text-gray-300 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 px-6 text-center text-gray-400">
                    No events found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredEvents.map(event => (
                  <tr key={event.id} className="border-t border-gray-700 hover:bg-gray-700/50">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{getCategoryIcon(event.category)}</div>
                        <div>
                          <p className="text-white font-medium">{event.title}</p>
                          <p className="text-gray-400 text-sm">{event.category}</p>
                          {event.isFeatured && (
                            <span className="inline-block bg-yellow-600 text-yellow-100 text-xs px-2 py-1 rounded-full mt-1">
                              Featured
                            </span>
                          )}
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
                      {event.endDate && (
                        <p className="text-gray-500 text-xs">Ends: {event.endDate}</p>
                      )}
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
                          style={{ width: `${Math.min((event.attendees / event.maxAttendees) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-gray-400 text-xs mt-1">{event.availableSeats} seats left</p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-white">₹{event.revenue.toLocaleString()}</p>
                      <p className="text-gray-400 text-xs">₹{event.ticketPrice}/ticket</p>
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
                          View Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Event Details Modal */}
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 border border-gray-700 max-h-[90vh] overflow-y-auto">
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
                  {selectedEvent.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedEvent.tags.map((tag, index) => (
                        <span key={index} className="bg-gray-700 text-gray-300 px-2 py-1 rounded-full text-xs">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
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
                    <p className="text-white font-medium">{selectedEvent.date} at {selectedEvent.time}</p>
                    {selectedEvent.endDate && (
                      <p className="text-gray-400 text-sm">Ends: {selectedEvent.endDate}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Location</label>
                    <p className="text-white font-medium">{selectedEvent.location}</p>
                    {selectedEvent.venue !== 'N/A' && (
                      <p className="text-gray-400 text-sm">Venue: {selectedEvent.venue}</p>
                    )}
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Attendees</p>
                  <p className="text-2xl font-bold text-white">{selectedEvent.attendees}/{selectedEvent.maxAttendees}</p>
                  <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${Math.min((selectedEvent.attendees / selectedEvent.maxAttendees) * 100, 100)}%` }}
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
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Available Seats</p>
                  <p className="text-2xl font-bold text-yellow-400">{selectedEvent.availableSeats}</p>
                </div>
              </div>

              {/* Event Images */}
              {selectedEvent.images.length > 0 && (
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Event Images</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedEvent.images.slice(0, 6).map((image, index) => (
                      <div key={index} className="bg-gray-700 p-2 rounded-lg">
                        <img 
                          src={image} 
                          alt={`Event ${index + 1}`}
                          className="w-full h-24 object-cover rounded"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-3 pt-4 border-t border-gray-700">
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg">
                  Contact Organizer
                </button>
                <button className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg">
                  View Attendees
                </button>
                <button className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg">
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
