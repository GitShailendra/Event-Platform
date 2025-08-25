import React from 'react';

const UserUpcomingEvents = () => {
  // Mock upcoming events data
  const upcomingEvents = [
    {
      id: 1,
      eventTitle: 'React Workshop 2025',
      date: '2025-09-15',
      time: '10:00 AM',
      location: 'Mumbai Tech Hub',
      status: 'confirmed',
      price: 2500,
      ticketNumber: 'EVT-001234',
      category: 'workshops',
      organizer: 'Tech Academy'
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
      category: 'conferences',
      organizer: 'AI Institute'
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
      category: 'workshops',
      organizer: 'Photo Academy'
    },
    {
      id: 4,
      eventTitle: 'JavaScript Bootcamp',
      date: '2025-12-10',
      time: '11:00 AM',
      location: 'Online',
      status: 'confirmed',
      price: 0,
      ticketNumber: 'EVT-001237',
      category: 'webinars',
      organizer: 'Code Masters'
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
    return amount === 0 ? 'Free' : new Intl.NumberFormat('en-IN', {
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

  const getDaysUntilEvent = (date) => {
    const eventDate = new Date(date);
    const today = new Date();
    const diffTime = eventDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Past event';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `${diffDays} days`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Upcoming Events</h1>
          <p className="text-gray-400 mt-1">{upcomingEvents.length} events booked</p>
        </div>
        <div className="flex space-x-3">
          <button className="btn-secondary">
            <span className="mr-2">📅</span>
            Calendar View
          </button>
          <button className="btn-primary">
            <span className="mr-2">🔍</span>
            Browse More
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {upcomingEvents.map((event, index) => (
          <div
            key={event.id}
            className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden hover:scale-105 transition-all duration-300 animate-scale-in group"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Event Header */}
            <div className="relative h-32 gradient-bg flex items-center justify-center">
              <span className="text-4xl text-white group-hover:scale-110 transition-transform">
                {getCategoryIcon(event.category)}
              </span>
              
              {/* Days until event badge */}
              <div className="absolute top-3 right-3 bg-black bg-opacity-50 backdrop-blur-sm rounded-full px-3 py-1">
                <span className="text-white text-xs font-medium">
                  {getDaysUntilEvent(event.date)}
                </span>
              </div>
              
              {/* Status badge */}
              <div className="absolute top-3 left-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(event.status)}`}>
                  {event.status}
                </span>
              </div>
            </div>

            {/* Event Details */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-blue-400 font-semibold text-sm capitalize">
                  {event.category}
                </span>
                <span className="text-green-400 font-bold">
                  {formatCurrency(event.price)}
                </span>
              </div>

              <h3 className="text-lg font-bold text-white mb-3 line-clamp-2 group-hover:text-blue-400 transition-colors">
                {event.eventTitle}
              </h3>

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
                  <span className="text-purple-400 mr-2">👤</span>
                  {event.organizer}
                </div>
                <div className="flex items-center">
                  <span className="text-orange-400 mr-2">🎫</span>
                  {event.ticketNumber}
                </div>
              </div>

              <div className="flex space-x-2">
                <button className="btn-primary text-sm px-4 py-2 flex-1">
                  View Ticket
                </button>
                <button className="btn-secondary text-sm px-3 py-2">
                  <span className="text-lg">📧</span>
                </button>
                <button className="btn-secondary text-sm px-3 py-2">
                  <span className="text-lg">📲</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state if no events */}
      {upcomingEvents.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4 animate-float">📅</div>
          <h2 className="text-2xl font-bold text-white mb-2">No Upcoming Events</h2>
          <p className="text-gray-400 mb-6">
            You haven't booked any upcoming events yet. Start exploring!
          </p>
          <button className="btn-primary">
            Browse Events
          </button>
        </div>
      )}
    </div>
  );
};

export default UserUpcomingEvents;
