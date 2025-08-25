import React from 'react';

const PastEvents = () => {
  const pastEvents = [
    {
      id: 1,
      eventTitle: 'JavaScript Bootcamp',
      date: '2025-08-20',
      location: 'Online',
      rating: 5,
      reviewed: true,
      price: 1500,
      category: 'workshops'
    },
    {
      id: 2,
      eventTitle: 'Design Thinking Workshop',
      date: '2025-07-15',
      location: 'Pune',
      rating: 4,
      reviewed: true,
      price: 2000,
      category: 'workshops'
    },
    {
      id: 3,
      eventTitle: 'Mobile App Development',
      date: '2025-06-10',
      location: 'Chennai',
      rating: null,
      reviewed: false,
      price: 3500,
      category: 'conferences'
    },
    {
      id: 4,
      eventTitle: 'UI/UX Design Conference',
      date: '2025-05-25',
      location: 'Mumbai',
      rating: 5,
      reviewed: true,
      price: 2800,
      category: 'conferences'
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
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Past Events</h1>
          <p className="text-gray-400 mt-1">{pastEvents.length} events attended</p>
        </div>
        <div className="text-sm text-gray-400">
          Total spent: {formatCurrency(pastEvents.reduce((sum, event) => sum + event.price, 0))}
        </div>
      </div>

      <div className="space-y-4">
        {pastEvents.map((event, index) => (
          <div
            key={event.id}
            className="bg-gray-800 border border-gray-700 rounded-xl p-6 animate-scale-in hover:scale-102 transition-all duration-300"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-center space-x-4 flex-1 mb-4 md:mb-0">
                <div className="text-3xl">{getCategoryIcon(event.category)}</div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-2">{event.eventTitle}</h3>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center">
                      <span className="mr-1">📅</span>
                      {formatDate(event.date)}
                    </span>
                    <span className="flex items-center">
                      <span className="mr-1">📍</span>
                      {event.location}
                    </span>
                    <span className="flex items-center">
                      <span className="mr-1">💰</span>
                      {formatCurrency(event.price)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {event.rating && (
                  <div className="flex items-center space-x-1">
                    <span className="text-gray-400 text-sm">Rating:</span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={i < event.rating ? 'text-yellow-400' : 'text-gray-600'}
                        >
                          ⭐
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex space-x-2">
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
          </div>
        ))}
      </div>

      {/* Empty state if no events */}
      {pastEvents.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-bold text-white mb-2">No Past Events</h2>
          <p className="text-gray-400 mb-6">
            You haven't attended any events yet. Start exploring!
          </p>
          <Link to="/events" className="btn-primary">
            Browse Events
          </Link>
        </div>
      )}
    </div>
  );
};

export default PastEvents;
