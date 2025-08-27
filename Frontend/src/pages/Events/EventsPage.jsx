import React, { useState, useEffect } from 'react';
import { eventAPI } from '../../api';
import { useNavigate } from 'react-router-dom';
const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEvents, setTotalEvents] = useState(0);
  const eventsPerPage = 12;
  const navigate = useNavigate();

  const categories = ['all', 'concert', 'workshop', 'webinar', 'meetup', 'conference'];
  const locations = ['all', 'mumbai', 'delhi', 'bangalore', 'pune', 'hyderabad', 'chennai'];

  // **REAL API CALL - Replace mock data with this**
  useEffect(() => {
    fetchEvents();
  }, [searchQuery, selectedCategory, selectedLocation, sortBy, currentPage]);

  const fetchEvents = async () => {
    setLoading(true);
    setError('');

    try {
      const params = {
        page: currentPage,
        limit: eventsPerPage,
        sortBy: sortBy === 'name' ? 'title' : sortBy, // Map 'name' to 'title' for backend
        status: 'published'
      };

      // Add filters only if they're not 'all'
      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }

      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      // Note: Your backend doesn't have location filtering, so we'll filter on frontend
      // Or you can add location filtering to your backend controller

      console.log('Fetching events with params:', params);
      const response = await eventAPI.getAllEvents(params);

      console.log('API Response:', response);

      if (response && response.events) {
        let fetchedEvents = response.events;

        // Filter by location on frontend (since backend doesn't have this filter)
        if (selectedLocation !== 'all') {
          fetchedEvents = fetchedEvents.filter(event =>
            event.location && event.location.toLowerCase().includes(selectedLocation.toLowerCase())
          );
        }

        // Apply sorting on frontend for consistency
        fetchedEvents = sortEvents(fetchedEvents, sortBy);

        setEvents(fetchedEvents);
        setFilteredEvents(fetchedEvents);
        setTotalPages(response.totalPages || 1);
        setTotalEvents(response.total || fetchedEvents.length);
      } else {
        setEvents([]);
        setFilteredEvents([]);
        setTotalPages(1);
        setTotalEvents(0);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err.message || 'Failed to load events');
      setEvents([]);
      setFilteredEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to sort events
  const sortEvents = (eventsList, sortMethod) => {
    return [...eventsList].sort((a, b) => {
      switch (sortMethod) {
        case 'date':
          return new Date(a.date) - new Date(b.date);
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on search
  };

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedLocation('all');
    setSortBy('date');
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center animate-pulse-soft">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-white text-lg font-medium">Loading amazing events...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-2xl font-bold text-white mb-2">Something went wrong</h3>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => fetchEvents()}
            className="btn btn-primary hover-lift"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header Section */}
      <section className="gradient-bg-soft py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Browse <span className="text-gradient">Events</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Discover amazing events happening near you and book your spot today
            </p>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 animate-slide-up shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Search */}
              <div className="lg:col-span-2">
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full py-3 px-4 pr-12 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors focus:ring-2 focus:ring-blue-500/20"
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-400 transition-colors"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </form>
              </div>

              {/* Category Filter */}
              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full py-3 px-4 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none transition-colors capitalize focus:ring-2 focus:ring-blue-500/20"
                >
                  {categories.map(category => (
                    <option key={category} value={category} className="bg-gray-700 text-white py-2">
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location Filter */}
              <div>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full py-3 px-4 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none transition-colors capitalize focus:ring-2 focus:ring-blue-500/20"
                >
                  {locations.map(location => (
                    <option key={location} value={location} className="bg-gray-700 text-white py-2">
                      {location === 'all' ? 'All Locations' : location}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sort Options */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <span className="text-gray-300 font-medium">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="py-2 px-4 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none transition-colors min-w-[160px] focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="date" className="bg-gray-700 text-white">Date</option>
                  <option value="price-low" className="bg-gray-700 text-white">Price: Low to High</option>
                  <option value="price-high" className="bg-gray-700 text-white">Price: High to Low</option>
                  <option value="name" className="bg-gray-700 text-white">Name</option>
                </select>
              </div>
              <div className="text-gray-300">
                <span className="bg-gray-700 border border-gray-600 text-gray-300 px-3 py-1 rounded-full text-sm font-medium">
                  {filteredEvents.length} of {totalEvents} events
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredEvents.map((event, index) => (
                <EventCard key={event._id} event={event} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 animate-fade-in">
              <div className="text-6xl mb-4 animate-float">🔍</div>
              <h3 className="text-2xl font-bold text-white mb-2">No Events Found</h3>
              <p className="text-gray-400 mb-6 leading-relaxed">
                {searchQuery || selectedCategory !== 'all' || selectedLocation !== 'all'
                  ? 'Try adjusting your search criteria or filters'
                  : 'No events available at the moment. Check back later!'}
              </p>
              <button
                onClick={clearFilters}
                className="btn btn-primary hover-lift"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Pagination */}
      {totalPages > 1 && (
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>

                <div className="flex items-center space-x-1">
                  {[...Array(Math.min(totalPages, 5))].map((_, index) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = index + 1;
                    } else {
                      const startPage = Math.max(1, currentPage - 2);
                      const endPage = Math.min(totalPages, startPage + 4);
                      pageNumber = startPage + index;
                      if (pageNumber > endPage) return null;
                    }

                    return (
                      <button
                        key={pageNumber}
                        onClick={() => paginate(pageNumber)}
                        className={`px-3 py-2 rounded-lg transition-all duration-200 hover-lift ${currentPage === pageNumber
                            ? 'btn btn-primary'
                            : 'btn btn-secondary'
                          }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
                >
                  Next
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

// Updated Event Card Component to handle real data structure
const EventCard = ({ event, index }) => {
  const navigate = useNavigate();
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryIcon = (category) => {
    const icons = {
      concert: '🎵',
      workshop: '🛠️',
      webinar: '💻',
      meetup: '🤝',
      conference: '🎪'
    };
    return icons[category] || '📅';
  };

  const getCategoryBadge = (category) => {
    const badges = {
      concert: 'badge-primary',
      workshop: 'badge-success',
      webinar: 'badge-warning',
      meetup: 'badge-danger',
      conference: 'badge-primary'
    };
    return badges[category] || 'badge-outline';
  };

  const getSeatsStatus = (seats) => {
    if (seats === 0) return { class: 'badge-danger', text: 'Sold Out' };
    if (seats < 10) return { class: 'badge-warning', text: `${seats} left` };
    if (seats < 50) return { class: 'badge-warning', text: `${seats} seats` };
    return { class: 'badge-success', text: `${seats} seats` };
  };

  const seatsStatus = getSeatsStatus(event.availableSeats);

  // Handle organizer info (from your real data structure)
  const getOrganizerName = () => {
    if (event.createdBy) {
      return event.createdBy.username ||
        `${event.createdBy.firstName || ''} ${event.createdBy.lastName || ''}`.trim() ||
        'Event Organizer';
    }
    return 'Event Organizer';
  };

  return (
    <div
      className="card hover-lift hover-glow animate-scale-in overflow-hidden"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Event Image/Icon */}
      <div className="relative h-48 gradient-bg flex items-center justify-center">
        {event.images && event.images.length > 0 && event.images[0] ? (
          <img
            src={event.images[0]}
            alt={event.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}

        {/* Fallback icon (always present, hidden if image loads) */}
        <div
          className="text-6xl text-black text-glow flex items-center justify-center absolute inset-0"
          style={{ display: event.images && event.images.length > 0 ? 'none' : 'flex' }}
        >
          {getCategoryIcon(event.category)}
        </div>

        {/* Price Badge */}
        <div className="absolute top-4 right-4 text-black font-bold">
          <span className={`badge ${event.price === 0 ? 'badge-success' : 'badge-primary'}`}>
            {event.price === 0 ? 'Free' : `₹${event.price.toLocaleString()}`}
          </span>
        </div>

        {/* Category Badge */}
        <div className="absolute top-4 left-4 text-black font-bold">
          <span className={`badge ${getCategoryBadge(event.category)} capitalize`}>
            {event.category}
          </span>
        </div>
      </div>

      {/* Event Details */}
      <div className="p-6 bg-gray-800">
        {/* Date and Location */}
        <div className="flex items-center justify-between text-sm text-gray-400 mb-3 ">
          <div className="flex items-center">
            <svg className="h-4 w-4 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">{formatDate(event.date)}</span>
          </div>
          <div className="flex items-center">
            <svg className="h-4 w-4 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <span className="capitalize font-medium">{event.location || 'TBD'}</span>
          </div>
        </div>

        {/* Event Title */}
        <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 hover:text-gradient transition-colors cursor-pointer">
          {event.title}
        </h3>

        {/* Event Description */}
        <p className="text-gray-300 mb-4 line-clamp-2 text-sm leading-relaxed">
          {event.description}
        </p>

        {/* Organizer and Seats */}
        <div className="flex items-center justify-between text-sm mb-6">
          <span className="flex items-center text-gray-400">
            <svg className="h-4 w-4 mr-2 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">{getOrganizerName()}</span>
          </span>
          <span className={`badge ${seatsStatus.class}`}>
            {seatsStatus.text}
          </span>
        </div>

        {/* Action Button */}
        <button
          onClick={() => navigate(`/events/${event._id}`)} // Add this import: import { useNavigate } from 'react-router-dom';
          className="btn btn-primary w-full group"
          disabled={event.availableSeats === 0}
        >
          {event.availableSeats === 0 ? 'Sold Out' : 'View Details'}
          {event.availableSeats > 0 && (
            <svg className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </button>

      </div>
    </div>
  );
};

export default EventsPage;
