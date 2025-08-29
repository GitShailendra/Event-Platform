import React, { useState, useEffect } from 'react';
import { eventAPI } from '../../api';
import { useNavigate } from 'react-router-dom';
const HomePage = () => {
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [stats, setStats] = useState({ totalEvents: 0, totalUsers: 0, totalBookings: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch featured events from your API
        const eventsResponse = await eventAPI.getAllEvents({ 
          status: 'published', 
          limit: 6,
          isFeatured: true 
        });
        
        // Handle the response structure based on your API
        if (eventsResponse && eventsResponse.events) {
          setFeaturedEvents(eventsResponse.events);
        } else if (Array.isArray(eventsResponse)) {
          setFeaturedEvents(eventsResponse);
        } else {
          setFeaturedEvents([]);
        }
        
        // Fetch stats - you'll need to implement this endpoint
        try {
          const statsResponse = await eventAPI.getStats();
          if (statsResponse) {
            setStats(statsResponse);
          }
        } catch (statsError) {
          console.error('Error fetching stats:', statsError);
          // Keep default stats if stats fetch fails
          setStats({
            totalEvents: 0,
            totalUsers: 0,
            totalBookings: 0
          });
        }
        
      } catch (error) {
        console.error('Error fetching events:', error);
        setError(error.message || 'Failed to fetch events');
        setFeaturedEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Search for:', searchQuery);
      // You can implement search functionality here
      // Example: navigate to search results page or filter events
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-spin">⏳</div>
          <h2 className="text-2xl font-bold">Loading Events...</h2>
          <p className="text-gray-300 mt-2">Please wait while we fetch the latest events</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <h2 className="text-2xl font-bold mb-2">Error Loading Events</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32 bg-black">
        <div className="absolute inset-0 gradient-bg opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
              Discover Amazing
              <span className="block text-blue-500 animate-float">Events</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto animate-slide-up">
              Connect with like-minded people through concerts, workshops, webinars, and community meetups
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-12 animate-slide-up">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for events, locations, or categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-4 px-6 pr-12 text-lg rounded-full border-2 border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none shadow-medium"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition-all duration-200 hover:scale-105"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </form>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
              <button className="btn-primary text-lg px-8 py-4">
                Browse Events
              </button>
              <button className="btn-secondary text-lg px-8 py-4">
                Create Event
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { label: 'Total Events', value: stats.totalEvents.toLocaleString(), icon: '🎪' },
              { label: 'Happy Users', value: stats.totalUsers.toLocaleString(), icon: '👥' },
              { label: 'Bookings Made', value: stats.totalBookings.toLocaleString(), icon: '🎫' }
            ].map((stat, index) => (
              <div key={stat.label} className="text-center animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="text-4xl mb-2">{stat.icon}</div>
                <div className="text-3xl font-bold text-blue-500 mb-1">{stat.value}+</div>
                <div className="text-gray-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 animate-slide-up">
              Featured Events
            </h2>
            <p className="text-xl text-gray-300 animate-slide-up">
              Don't miss out on these amazing upcoming events
            </p>
          </div>

          {featuredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredEvents.map((event, index) => (
                <EventCard key={event._id} event={event} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🎭</div>
              <h3 className="text-xl font-semibold text-white mb-2">No Events Found</h3>
              <p className="text-gray-300">Be the first to create an amazing event!</p>
            </div>
          )}

          <div className="text-center mt-12">
            <button className="btn-primary text-lg px-8 py-4" onClick={()=> navigate('/events')}>
              View All Events
            </button>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Event Categories
            </h2>
            <p className="text-xl text-gray-300">
              Find events that match your interests
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'Concerts', icon: '🎵', color: 'bg-purple-800 text-purple-200 hover:bg-purple-700', category: 'concert' },
              { name: 'Workshops', icon: '🛠️', color: 'bg-blue-800 text-blue-200 hover:bg-blue-700', category: 'workshop' },
              { name: 'Webinars', icon: '💻', color: 'bg-green-800 text-green-200 hover:bg-green-700', category: 'webinar' },
              { name: 'Meetups', icon: '🤝', color: 'bg-orange-800 text-orange-200 hover:bg-orange-700', category: 'meetup' }
            ].map((category, index) => (
              <button
                key={category.name}
                onClick={() => console.log('Category clicked:', category.category)}
                className={`card p-6 text-center hover:scale-105 transition-all duration-300 ${category.color} border border-gray-600`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-4xl mb-3">{category.icon}</div>
                <h3 className="font-semibold">{category.name}</h3>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

// Event Card Component
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

  return (
    <div
      className="card overflow-hidden animate-slide-up bg-gray-800 border border-gray-700 hover:border-blue-500"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="relative h-48 bg-gradient-to-r from-blue-600 to-purple-600">
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
        <div 
          className="w-full h-full flex items-center justify-center text-white text-6xl"
          style={{ display: event.images && event.images.length > 0 && event.images[0] ? 'none' : 'flex' }}
        >
          🎪
        </div>
        <div className="absolute top-4 right-4 bg-black bg-opacity-70 rounded-full px-3 py-1 text-sm font-semibold text-blue-400">
          ₹{event.price?.toLocaleString() || '0'}
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center text-sm text-gray-400 mb-2">
          <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
          {formatDate(event.date)}
        </div>

        <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
          {event.title}
        </h3>

        <p className="text-gray-300 mb-4 line-clamp-2">
          {event.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-400">
            <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            {event.location}
          </div>
          <button
            onClick={() => navigate(`/events/${event._id}`)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
