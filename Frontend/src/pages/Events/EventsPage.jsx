import React, { useState, useEffect } from 'react';

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 12;

  const categories = ['all', 'concerts', 'workshops', 'webinars', 'meetups', 'conferences'];
  const locations = ['all', 'mumbai', 'delhi', 'bangalore', 'pune', 'hyderabad', 'chennai'];

  useEffect(() => {
    // Mock data - replace with API call
    const mockEvents = [
      {
        _id: '1',
        title: 'React Conference 2025',
        description: 'Join the biggest React conference of the year with amazing speakers and workshops.',
        date: '2025-09-15',
        location: 'mumbai',
        price: 2500,
        category: 'conferences',
        images: null,
        availableSeats: 150,
        organizer: 'Tech Events India'
      },
      {
        _id: '2',
        title: 'JavaScript Workshop',
        description: 'Learn advanced JavaScript concepts and modern development practices.',
        date: '2025-10-20',
        location: 'delhi',
        price: 1500,
        category: 'workshops',
        images: null,
        availableSeats: 50,
        organizer: 'Code Academy'
      },
      {
        _id: '3',
        title: 'Web Design Bootcamp',
        description: 'Master modern web design principles and create stunning websites.',
        date: '2025-11-10',
        location: 'bangalore',
        price: 3000,
        category: 'workshops',
        images: null,
        availableSeats: 80,
        organizer: 'Design Hub'
      },
      {
        _id: '4',
        title: 'AI & ML Summit',
        description: 'Explore the future of artificial intelligence and machine learning.',
        date: '2025-12-05',
        location: 'pune',
        price: 4000,
        category: 'conferences',
        images: null,
        availableSeats: 200,
        organizer: 'AI Institute'
      },
      {
        _id: '5',
        title: 'Startup Networking Meetup',
        description: 'Connect with entrepreneurs and investors in your city.',
        date: '2025-08-25',
        location: 'mumbai',
        price: 500,
        category: 'meetups',
        images: null,
        availableSeats: 100,
        organizer: 'Startup Hub'
      },
      {
        _id: '6',
        title: 'Digital Marketing Webinar',
        description: 'Learn the latest digital marketing strategies and tools.',
        date: '2025-09-30',
        location: 'online',
        price: 0,
        category: 'webinars',
        images: null,
        availableSeats: 500,
        organizer: 'Marketing Pro'
      },
      {
        _id: '7',
        title: 'Music Festival 2025',
        description: 'Three days of amazing music with top artists from around the world.',
        date: '2025-11-15',
        location: 'bangalore',
        price: 5000,
        category: 'concerts',
        images: null,
        availableSeats: 1000,
        organizer: 'Music Events Ltd'
      },
      {
        _id: '8',
        title: 'Photography Workshop',
        description: 'Learn professional photography techniques and post-processing.',
        date: '2025-10-08',
        location: 'chennai',
        price: 2000,
        category: 'workshops',
        images: null,
        availableSeats: 30,
        organizer: 'Photo Academy'
      }
    ];

    setTimeout(() => {
      setEvents(mockEvents);
      setFilteredEvents(mockEvents);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    filterAndSortEvents();
  }, [events, searchQuery, selectedCategory, selectedLocation, sortBy]);

  const filterAndSortEvents = () => {
    let filtered = events.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          event.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
      const matchesLocation = selectedLocation === 'all' || event.location === selectedLocation;
      
      return matchesSearch && matchesCategory && matchesLocation;
    });

    // Sort events
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(a.date) - new Date(b.date);
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    setFilteredEvents(filtered);
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
  };

  // Pagination
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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

          {/* Search and Filter Bar - FIXED STYLING */}
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
                  {currentEvents.length} of {filteredEvents.length} events
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {currentEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentEvents.map((event, index) => (
                <EventCard key={event._id} event={event} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 animate-fade-in">
              <div className="text-6xl mb-4 animate-float">🔍</div>
              <h3 className="text-2xl font-bold text-white mb-2">No Events Found</h3>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Try adjusting your search criteria or filters
              </p>
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedLocation('all');
                }}
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
                        className={`px-3 py-2 rounded-lg transition-all duration-200 hover-lift ${
                          currentPage === pageNumber
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

// Event Card Component - Same as before
const EventCard = ({ event, index }) => {
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
      concerts: '🎵',
      workshops: '🛠️',
      webinars: '💻',
      meetups: '🤝',
      conferences: '🎪'
    };
    return icons[category] || '📅';
  };

  const getCategoryBadge = (category) => {
    const badges = {
      concerts: 'badge-primary',
      workshops: 'badge-success',
      webinars: 'badge-warning',
      meetups: 'badge-danger',
      conferences: 'badge-primary'
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

  return (
    <div
      className="card hover-lift hover-glow animate-scale-in overflow-hidden"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Event Image/Icon */}
      <div className="relative h-48 gradient-bg flex items-center justify-center">
        {event.images && event.images[0] ? (
          <img
            src={event.images}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-6xl text-white text-glow">
            {getCategoryIcon(event.category)}
          </div>
        )}
        
        {/* Price Badge */}
        <div className="absolute top-4 right-4">
          <span className={`badge ${event.price === 0 ? 'badge-success' : 'badge-primary'}`}>
            {event.price === 0 ? 'Free' : `₹${event.price.toLocaleString()}`}
          </span>
        </div>

        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span className={`badge ${getCategoryBadge(event.category)} capitalize`}>
            {event.category}
          </span>
        </div>
      </div>

      {/* Event Details */}
      <div className="p-6">
        {/* Date and Location */}
        <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
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
            <span className="capitalize font-medium">{event.location}</span>
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
            <span className="font-medium">{event.organizer}</span>
          </span>
          <span className={`badge ${seatsStatus.class}`}>
            {seatsStatus.text}
          </span>
        </div>

        {/* Action Button */}
        <button
          onClick={() => console.log('View details for:', event.title)}
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
