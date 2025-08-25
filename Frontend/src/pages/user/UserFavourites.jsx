import React, { useState } from 'react';

const UserFavorites = () => {
  const [favorites, setFavorites] = useState([
    {
      id: 1,
      title: 'React Meetup Mumbai',
      description: 'Join fellow React developers for networking and learning about the latest in React ecosystem.',
      location: 'Mumbai',
      date: '2025-09-25',
      price: 0,
      category: 'meetups',
      organizer: 'React Mumbai',
      image: null,
      isAvailable: true
    },
    {
      id: 2,
      title: 'JavaScript Bootcamp',
      description: 'Intensive 3-day JavaScript bootcamp covering ES6+, async programming, and modern frameworks.',
      location: 'Online',
      date: '2025-10-15',
      price: 2500,
      category: 'workshops',
      organizer: 'Code Academy',
      image: null,
      isAvailable: true
    },
    {
      id: 3,
      title: 'Web Design Conference 2025',
      description: 'Learn the latest trends in web design, UX/UI principles, and design tools from industry experts.',
      location: 'Bangalore',
      date: '2025-11-20',
      price: 3500,
      category: 'conferences',
      organizer: 'Design Hub',
      image: null,
      isAvailable: false // Event is full
    },
    {
      id: 4,
      title: 'AI & Machine Learning Workshop',
      description: 'Hands-on workshop covering practical applications of AI and ML in modern web development.',
      location: 'Delhi',
      date: '2025-12-05',
      price: 4000,
      category: 'workshops',
      organizer: 'AI Institute',
      image: null,
      isAvailable: true
    }
  ]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return amount === 0 ? 'Free' : new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
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

  const getCategoryColor = (category) => {
    const colors = {
      concerts: 'text-purple-400',
      workshops: 'text-blue-400',
      webinars: 'text-green-400',
      meetups: 'text-orange-400',
      conferences: 'text-pink-400'
    };
    return colors[category] || 'text-gray-400';
  };

  const removeFavorite = (eventId) => {
    setFavorites(favorites.filter(fav => fav.id !== eventId));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Favorites</h1>
          <p className="text-gray-400 mt-1">{favorites.length} events saved</p>
        </div>
        <div className="flex space-x-3">
          <button className="btn-secondary">
            <span className="mr-2">🔍</span>
            Search Favorites
          </button>
          <button className="btn-primary">
            <span className="mr-2">➕</span>
            Browse Events
          </button>
        </div>
      </div>

      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {favorites.map((event, index) => (
            <div
              key={event.id}
              className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden hover:scale-102 transition-all duration-300 animate-scale-in group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Event Header */}
              <div className="relative h-24 gradient-bg flex items-center justify-center">
                <span className="text-3xl text-white group-hover:scale-110 transition-transform">
                  {getCategoryIcon(event.category)}
                </span>
                
                {/* Remove from favorites button */}
                <button
                  onClick={() => removeFavorite(event.id)}
                  className="absolute top-3 right-3 p-2 bg-black bg-opacity-50 backdrop-blur-sm rounded-full text-red-400 hover:text-red-300 hover:bg-opacity-70 transition-all"
                  title="Remove from favorites"
                >
                  <span className="text-lg">💔</span>
                </button>

                {/* Price badge */}
                <div className="absolute top-3 left-3 bg-black bg-opacity-50 backdrop-blur-sm rounded-full px-3 py-1">
                  <span className="text-white text-xs font-medium">
                    {formatCurrency(event.price)}
                  </span>
                </div>
              </div>

              {/* Event Content */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-sm font-medium capitalize ${getCategoryColor(event.category)}`}>
                    {event.category}
                  </span>
                  <span className="text-gray-400 text-sm">
                    by {event.organizer}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-3 line-clamp-2 group-hover:text-blue-400 transition-colors">
                  {event.title}
                </h3>

                <p className="text-gray-300 text-sm mb-4 line-clamp-2 leading-relaxed">
                  {event.description}
                </p>

                <div className="space-y-2 text-sm text-gray-400 mb-6">
                  <div className="flex items-center">
                    <span className="text-blue-400 mr-2">📅</span>
                    {formatDate(event.date)}
                  </div>
                  <div className="flex items-center">
                    <span className="text-green-400 mr-2">📍</span>
                    {event.location}
                  </div>
                </div>

                <div className="flex space-x-3">
                  {event.isAvailable ? (
                    <>
                      <button className="btn-primary text-sm px-4 py-2 flex-1">
                        Book Now
                      </button>
                      <button className="btn-secondary text-sm px-4 py-2">
                        View Details
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="btn-secondary opacity-50 cursor-not-allowed text-sm px-4 py-2 flex-1" disabled>
                        Event Full
                      </button>
                      <button className="btn-secondary text-sm px-4 py-2">
                        Waitlist
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 animate-fade-in">
          <div className="text-6xl mb-4 animate-float">💔</div>
          <h2 className="text-2xl font-bold text-white mb-2">No Favorites Yet</h2>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Start adding events to your favorites to keep track of events you're interested in!
          </p>
          <button className="btn-primary">
            <span className="mr-2">🔍</span>
            Explore Events
          </button>
        </div>
      )}
    </div>
  );
};

export default UserFavorites;
