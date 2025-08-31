// components/user/StartConversationModal.jsx
import React, { useState, useEffect } from 'react';
import { bookingAPI } from '../../api';

const StartConversationModal = ({ onClose, onStartConversation }) => {
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const fetchMyBookings = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await bookingAPI.getUserBookings();
      console.log('Fetched bookings response:', response);
      
      // Handle the nested data structure
      let bookingsData;
      if (response.data && response.data.bookings) {
        // If data is nested like { data: { bookings: [...] } }
        bookingsData = response.data.bookings;
      } else if (response.data && Array.isArray(response.data)) {
        // If data is like { data: [...] }
        bookingsData = response.data;
      } else if (Array.isArray(response)) {
        // If response is directly an array
        bookingsData = response;
      } else {
        console.error('Unexpected response structure:', response);
        bookingsData = [];
      }
      
      console.log('Bookings data:', bookingsData);
      
      // Filter only confirmed bookings
      const confirmedBookings = bookingsData.filter(booking => 
        booking.status === 'confirmed'
      );
      
      console.log('Confirmed bookings:', confirmedBookings);
      setMyBookings(confirmedBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Failed to load your bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStart = () => {
    if (selectedEventId) {
      onStartConversation(selectedEventId);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Start New Chat</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-400 text-sm mb-4">
            Select an event you've joined to chat with its organizer:
          </p>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <span className="text-gray-400 mt-2 block">Loading your events...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">⚠️</div>
              <p className="text-red-400 mb-4">{error}</p>
              <button 
                onClick={fetchMyBookings}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                Try Again
              </button>
            </div>
          ) : myBookings.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🎪</div>
              <p className="text-gray-400 mb-4">You haven't joined any events yet</p>
              <p className="text-sm text-gray-500 mb-4">Join events to chat with organizers</p>
              <button
                onClick={onClose}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                Browse Events
              </button>
            </div>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {myBookings.map((booking) => (
                <div
                  key={booking._id}
                  onClick={() => setSelectedEventId(booking.event._id)}
                  className={`p-4 border border-gray-600 rounded-lg cursor-pointer transition-all ${
                    selectedEventId === booking.event._id
                      ? 'border-blue-500 bg-blue-900 bg-opacity-20'
                      : 'hover:border-gray-500 hover:bg-gray-700'
                  }`}
                >
                  <h4 className="text-white font-medium mb-1">{booking.event.title}</h4>
                  <p className="text-sm text-gray-400">
                    {new Date(booking.event.date).toLocaleDateString()} • 
                    {booking.quantity} {booking.quantity === 1 ? 'ticket' : 'tickets'}
                  </p>
                  <div className="mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      booking.status === 'confirmed' 
                        ? 'bg-green-900 text-green-300 border border-green-700'
                        : 'bg-yellow-900 text-yellow-300 border border-yellow-700'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleStart}
            disabled={!selectedEventId}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            Start Chat
          </button>
        </div>

        {/* Debug info - remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-2 bg-gray-900 rounded text-xs text-gray-400">
            Debug: Found {myBookings.length} confirmed bookings
          </div>
        )}
      </div>
    </div>
  );
};

export default StartConversationModal;
