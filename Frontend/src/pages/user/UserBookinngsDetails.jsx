// components/BookingDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingAPI } from '../../api';

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchBookingDetails();
  }, [id]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await bookingAPI.getBookingById(id);

      if (response.success) {
        setBooking(response.data.booking);
      } else {
        setError('Booking not found');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch booking details');
    } finally {
      setLoading(false);
    }
  };
  const handleDownloadTicket = async () => {
    try {
      setDownloading(true);
      await bookingAPI.downloadTicket(booking._id);
      // Success notification can be added here
    } catch (error) {
      setError('Failed to download ticket: ' + error.message);
    } finally {
      setDownloading(false);
    }
  };
  const handleCancelBooking = async () => {
    try {
      setCancelling(true);
      await bookingAPI.cancelBooking(id);

      // Refresh booking data
      await fetchBookingDetails();
      setShowCancelModal(false);
    } catch (err) {
      setError(err.message || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
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
      pending: { class: 'bg-yellow-900 text-yellow-300 border-yellow-700', label: 'Pending Payment', dot: 'bg-yellow-400' },
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

  const canCancelBooking = () => {
    if (booking.status === 'cancelled' || booking.status === 'refunded') return false;

    // Can't cancel if event has already happened
    if (isEventPast(booking.event.date)) return false;

    // Can cancel if more than 24 hours before event
    const eventDate = new Date(booking.event.date);
    const now = new Date();
    const hoursDiff = (eventDate - now) / (1000 * 60 * 60);

    return hoursDiff > 24;
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-400">Loading booking details...</span>
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
          <h2 className="text-2xl font-bold text-white mb-2">Error Loading Booking</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <div className="flex space-x-3 justify-center">
            <button
              onClick={fetchBookingDetails}
              className="btn-primary"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/my-bookings')}
              className="btn-secondary"
            >
              Back to Bookings
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  const statusBadge = getStatusBadge(booking.status);
  const eventPast = isEventPast(booking.event.date);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${statusBadge.dot} animate-pulse`}></div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusBadge.class}`}>
            {statusBadge.label}
          </span>
        </div>
      </div>

      {/* Booking Header */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          {/* Event Image */}
          <div className="flex-shrink-0">
            {booking.event.images && booking.event.images.length > 0 ? (
              <img
                src={booking.event.images[0]}
                alt={booking.event.title}
                className="w-full md:w-32 h-32 object-cover rounded-lg"
              />
            ) : (
              <div className="w-full md:w-32 h-32 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-4xl text-white">
                  {getCategoryIcon(booking.event.category)}
                </span>
              </div>
            )}
          </div>

          {/* Booking Info */}
          <div className="flex-1">
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-white mb-2">{booking.event.title}</h1>
              <p className="text-gray-400">Booking Reference:
                <span className="text-white font-semibold ml-2">#{booking.bookingReference}</span>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center text-gray-300">
                <svg className="w-4 h-4 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-white">{formatDate(booking.event.date)}</p>
                  <p className="text-gray-400">{formatTime(booking.event.date)}</p>
                </div>
              </div>

              <div className="flex items-center text-gray-300">
                <svg className="w-4 h-4 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-white">{booking.event.location}</p>
                  <p className="text-gray-400">{eventPast ? 'Past Event' : 'Upcoming Event'}</p>
                </div>
              </div>

              <div className="flex items-center text-gray-300">
                <svg className="w-4 h-4 mr-2 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                </svg>
                <div>
                  <p className="text-white">{booking.quantity} Ticket{booking.quantity > 1 ? 's' : ''}</p>
                  <p className="text-gray-400 capitalize">{booking.event.category} Event</p>
                </div>
              </div>

              <div className="flex items-center text-gray-300">
                <svg className="w-4 h-4 mr-2 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.51-1.31c-.562-.649-1.413-1.076-2.353-1.253V5z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-white">{formatCurrency(booking.totalAmount)}</p>
                  <p className="text-gray-400">Total Amount</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          {canCancelBooking() && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              Cancel Booking
            </button>
          )}

          {booking.status === 'confirmed' && (
            <button
              onClick={handleDownloadTicket}
              disabled={downloading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors flex items-center"
            >
              {downloading ? (
                <>
                  <svg className="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Ticket
                </>
              )}
            </button>
          )}

          <button
            onClick={() => navigate('/my-bookings')}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
          >
            Back to All Bookings
          </button>
        </div>
      </div>

      {/* Payment Information */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Payment Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Payment Method:</span>
              <span className="text-white capitalize">{booking.paymentInfo?.paymentMethod || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Payment Status:</span>
              <span className={`capitalize ${booking.paymentInfo?.paymentStatus === 'completed' ? 'text-green-400' :
                  booking.paymentInfo?.paymentStatus === 'failed' ? 'text-red-400' : 'text-yellow-400'
                }`}>
                {booking.paymentInfo?.paymentStatus || 'Pending'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Transaction ID:</span>
              <span className="text-white text-sm font-mono">
                {booking.paymentInfo?.transactionId || 'N/A'}
              </span>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-4">
            <div className="text-center">
              <p className="text-gray-400 text-sm">Total Amount</p>
              <p className="text-3xl font-bold text-green-400">{formatCurrency(booking.totalAmount)}</p>
              <p className="text-gray-500 text-xs mt-1">
                Booked on {new Date(booking.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Attendee Information */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">
          Attendee Information ({booking.attendeeInfo?.length || 0})
        </h2>

        {booking.attendeeInfo && booking.attendeeInfo.length > 0 ? (
          <div className="space-y-4">
            {booking.attendeeInfo.map((attendee, index) => (
              <div key={index} className="bg-gray-900 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white font-semibold">
                    Attendee {index + 1}
                    {index === 0 && <span className="text-gray-400 text-sm ml-2">(Primary)</span>}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Name</p>
                    <p className="text-white">{attendee.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Email</p>
                    <p className="text-white">{attendee.email}</p>
                  </div>
                  {attendee.phone && (
                    <div className="md:col-span-2">
                      <p className="text-gray-400 text-sm">Phone</p>
                      <p className="text-white">{attendee.phone}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400">No attendee information available</p>
          </div>
        )}
      </div>

      {/* Cancel Booking Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">⚠️</div>
              <h3 className="text-xl font-bold text-white mb-2">Cancel Booking</h3>
              <p className="text-gray-400">
                Are you sure you want to cancel this booking? This action cannot be undone.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                disabled={cancelling}
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelBooking}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                disabled={cancelling}
              >
                {cancelling ? 'Cancelling...' : 'Cancel Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingDetails;
