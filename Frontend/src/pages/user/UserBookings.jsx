// components/UserBookings.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { bookingAPI } from '../../api';

const UserBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBookings, setTotalBookings] = useState(0);

  useEffect(() => {
    fetchBookings();
  }, [page, activeFilter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = { 
        page, 
        limit: 12,
        ...(activeFilter !== 'all' && { status: activeFilter })
      };
      
      const response = await bookingAPI.getUserBookings(params);
      
      if (response.success) {
        setBookings(response.data.bookings);
        setTotalPages(response.data.pagination.totalPages);
        setTotalBookings(response.data.pagination.totalBookings);
      } else {
        setError('Failed to fetch bookings');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
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
      confirmed: { class: 'bg-green-900 text-green-300 border-green-700', label: 'Confirmed', dot: 'bg-green-400' },
      pending: { class: 'bg-yellow-900 text-yellow-300 border-yellow-700', label: 'Pending', dot: 'bg-yellow-400' },
      cancelled: { class: 'bg-red-900 text-red-300 border-red-700', label: 'Cancelled', dot: 'bg-red-400' },
      refunded: { class: 'bg-gray-700 text-gray-300 border-gray-600', label: 'Refunded', dot: 'bg-gray-400' }
    };
    return badges[status] || badges.pending;
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

  const isEventPast = (eventDate) => {
    return new Date(eventDate) < new Date();
  };

  const filteredBookingsCount = bookings.filter(booking => {
    if (activeFilter === 'all') return true;
    return booking.status === activeFilter;
  }).length;

  const filterOptions = [
    { key: 'all', label: 'All Bookings', count: totalBookings },
    { key: 'confirmed', label: 'Confirmed', count: bookings.filter(b => b.status === 'confirmed').length },
    { key: 'pending', label: 'Pending', count: bookings.filter(b => b.status === 'pending').length },
    { key: 'cancelled', label: 'Cancelled', count: bookings.filter(b => b.status === 'cancelled').length }
  ];

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-400">Loading your bookings...</span>
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
          <h2 className="text-2xl font-bold text-white mb-2">Error Loading Bookings</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button 
            onClick={fetchBookings}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">My Bookings</h1>
          <p className="text-gray-400 mt-1">{totalBookings} total bookings</p>
        </div>
        <div className="flex space-x-3">
          <Link to="/events" className="btn-secondary">
            <span className="mr-2">🎪</span>
            Browse Events
          </Link>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-3">
        {filterOptions.map(filter => (
          <button
            key={filter.key}
            onClick={() => {
              setActiveFilter(filter.key);
              setPage(1);
            }}
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

      {/* Bookings Grid */}
      {bookings.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {bookings.map((booking, index) => {
            const statusBadge = getStatusBadge(booking.status);
            const eventPast = isEventPast(booking.event.date);
            
            return (
              <div
                key={booking._id}
                className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden hover:scale-102 transition-all duration-300 animate-scale-in group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Event Image */}
                <div className="relative h-32">
                  {booking.event.images && booking.event.images.length > 0 ? (
                    <img 
                      src={booking.event.images[0]} 
                      alt={booking.event.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full gradient-bg flex items-center justify-center">
                      <span className="text-4xl text-white">
                        {getCategoryIcon(booking.event.category)}
                      </span>
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 left-3 flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${statusBadge.dot} animate-pulse`}></div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${statusBadge.class}`}>
                      {statusBadge.label}
                    </span>
                  </div>

                  {/* Booking Reference */}
                  <div className="absolute top-3 right-3 bg-black bg-opacity-50 backdrop-blur-sm rounded px-2 py-1">
                    <span className="text-white text-xs">#{booking.bookingReference}</span>
                  </div>
                </div>

                {/* Booking Content */}
                <div className="p-6">
                  <div className="mb-3">
                    <h3 className="text-lg font-bold text-white mb-1 line-clamp-2 group-hover:text-blue-400 transition-colors">
                      {booking.event.title}
                    </h3>
                    <p className="text-gray-400 text-sm capitalize">
                      {booking.event.category} • {eventPast ? 'Past Event' : 'Upcoming'}
                    </p>
                  </div>

                  <div className="space-y-2 text-sm text-gray-400 mb-4">
                    <div className="flex items-center">
                      <span className="text-blue-400 mr-2">📅</span>
                      {formatDate(booking.event.date)} at {formatTime(booking.event.date)}
                    </div>
                    <div className="flex items-center">
                      <span className="text-green-400 mr-2">📍</span>
                      {booking.event.location}
                    </div>
                    <div className="flex items-center">
                      <span className="text-purple-400 mr-2">🎫</span>
                      {booking.quantity} ticket{booking.quantity > 1 ? 's' : ''}
                    </div>
                    <div className="flex items-center">
                      <span className="text-yellow-400 mr-2">💰</span>
                      {formatCurrency(booking.totalAmount)}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => navigate(`/user/bookings/${booking._id}`)}
                      className="btn-primary text-sm px-4 py-2 flex-1"
                    >
                      View Details
                    </button>
                    {booking.status === 'pending' && (
                      <button className="btn-secondary text-sm px-3 py-2">
                        <span className="text-lg">⏱️</span>
                      </button>
                    )}
                    {booking.status === 'confirmed' && !eventPast && (
                      <button className="btn-secondary text-sm px-3 py-2">
                        <span className="text-lg">📱</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Empty State
        <div className="text-center py-16">
          <div className="text-6xl mb-4 animate-float">🎫</div>
          <h2 className="text-2xl font-bold text-white mb-2">No Bookings Found</h2>
          <p className="text-gray-400 mb-6">
            {activeFilter === 'all' 
              ? "You haven't booked any events yet." 
              : `No ${activeFilter} bookings found.`
            }
          </p>
          <Link to="/events" className="btn-primary">
            Discover Events
          </Link>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={() => setPage(prev => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              page === 1 
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-700'
            }`}
          >
            <span className="mr-2">←</span>
            Previous
          </button>
          
          <div className="flex items-center space-x-2">
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-10 h-10 rounded-lg font-medium transition-all duration-200 ${
                    page === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              page === totalPages 
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-700'
            }`}
          >
            Next
            <span className="ml-2">→</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default UserBookings;
