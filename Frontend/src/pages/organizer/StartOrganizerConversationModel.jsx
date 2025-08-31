// components/organizer/StartOrganizerConversationModal.jsx
import React, { useState, useEffect } from 'react';
import { eventAPI, bookingAPI } from '../../api';

const StartOrganizerConversationModal = ({ onClose, onStartConversation }) => {
  const [myEvents, setMyEvents] = useState([]);
  const [eventAttendees, setEventAttendees] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [selectedAttendeeId, setSelectedAttendeeId] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingAttendees, setLoadingAttendees] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      fetchEventAttendees(selectedEventId);
    } else {
      setEventAttendees([]);
      setSelectedAttendeeId('');
    }
  }, [selectedEventId]);

  const fetchMyEvents = async () => {
    try {
      setLoading(true);
      const response = await eventAPI.getOrganizerEvents();
      console.log('Fetched events:', response);
      
      // Handle nested response structure
      let eventsData;
      if (response.data && Array.isArray(response.data)) {
        eventsData = response.data;
      } else if (Array.isArray(response)) {
        eventsData = response;
      } else {
        eventsData = [];
      }
      
      const activeEvents = eventsData.filter(event => 
        event.status === 'published' || event.status === 'active'
      );
      setMyEvents(activeEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const fetchEventAttendees = async (eventId) => {
    try {
      setLoadingAttendees(true);
      setError('');
      const response = await bookingAPI.getEventAttendees(eventId);
      console.log('Fetched attendees response:', response);

      // Handle the nested response structure properly
      let attendeesList = [];
      
      if (response && response.success && Array.isArray(response.data)) {
        // Response structure: { success: true, data: [...], total: 2 }
        attendeesList = response.data;
      } else if (response && Array.isArray(response.data)) {
        // Response structure: { data: [...] }
        attendeesList = response.data;
      } else if (Array.isArray(response)) {
        // Direct array response
        attendeesList = response;
      } else {
        console.error('Unexpected response structure:', response);
        attendeesList = [];
      }

      console.log('Processed attendees list:', attendeesList);

      // All attendees from the API should already be confirmed, but double-check
      const confirmedAttendees = attendeesList.filter(booking => 
        booking.status === 'confirmed'
      );

      console.log('Confirmed attendees:', confirmedAttendees);
      setEventAttendees(confirmedAttendees);
    } catch (error) {
      console.error('Error fetching attendees:', error);
      setError('Failed to load attendees');
    } finally {
      setLoadingAttendees(false);
    }
  };

  const handleStart = () => {
    if (selectedEventId && selectedAttendeeId) {
      onStartConversation(selectedEventId, selectedAttendeeId);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Message an Attendee</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900 bg-opacity-20 border border-red-700 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Step 1: Select Event */}
        <div className="mb-6">
          <h4 className="text-white font-medium mb-3">1. Select your event:</h4>
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
            </div>
          ) : myEvents.length === 0 ? (
            <p className="text-gray-400 text-sm">No active events found</p>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {myEvents.map((event) => (
                <div
                  key={event._id}
                  onClick={() => setSelectedEventId(event._id)}
                  className={`p-3 border border-gray-600 rounded-lg cursor-pointer transition-all ${
                    selectedEventId === event._id
                      ? 'border-blue-500 bg-blue-900 bg-opacity-20'
                      : 'hover:border-gray-500 hover:bg-gray-700'
                  }`}
                >
                  <h5 className="text-white font-medium">{event.title}</h5>
                  <p className="text-sm text-gray-400">
                    {new Date(event.date).toLocaleDateString()} • {event.totalAttendees || 0} total attendees
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Step 2: Select Attendee */}
        {selectedEventId && (
          <div className="mb-6">
            <h4 className="text-white font-medium mb-3">2. Select attendee to message:</h4>
            {loadingAttendees ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                <span className="text-gray-400 text-sm mt-2 block">Loading attendees...</span>
              </div>
            ) : error ? (
              <div className="text-center py-4">
                <p className="text-red-400 text-sm mb-2">{error}</p>
                <button 
                  onClick={() => fetchEventAttendees(selectedEventId)}
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  Try Again
                </button>
              </div>
            ) : eventAttendees.length === 0 ? (
              <div className="text-center py-4">
                <div className="text-4xl mb-2">👥</div>
                <p className="text-gray-400 text-sm mb-2">No confirmed attendees found for this event</p>
                <p className="text-gray-500 text-xs">Attendees need to have confirmed bookings to be contacted</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {eventAttendees.map((booking) => (
                  <div
                    key={booking._id}
                    onClick={() => setSelectedAttendeeId(booking.user._id)}
                    className={`p-3 border border-gray-600 rounded-lg cursor-pointer transition-all ${
                      selectedAttendeeId === booking.user._id
                        ? 'border-blue-500 bg-blue-900 bg-opacity-20'
                        : 'hover:border-gray-500 hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={booking.user.profileImage || '/default-avatar.png'}
                        alt={`${booking.user.firstName} ${booking.user.lastName}`}
                        className="w-10 h-10 rounded-full object-cover"
                        onError={(e) => {
                          e.target.src = '/default-avatar.png';
                        }}
                      />
                      <div className="flex-1">
                        <h5 className="text-white font-medium">
                          {booking.user.firstName} {booking.user.lastName}
                        </h5>
                        <p className="text-sm text-gray-400">
                          {booking.user.email}
                        </p>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <span>{booking.quantity} {booking.quantity === 1 ? 'ticket' : 'tickets'}</span>
                          <span>•</span>
                          <span>Booked {new Date(booking.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-1 bg-green-900 text-green-300 text-xs rounded-full">
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Debug info - remove in production */}
            {process.env.NODE_ENV === 'development' && eventAttendees.length > 0 && (
              <div className="mt-2 p-2 bg-gray-900 rounded text-xs text-gray-400">
                Debug: Found {eventAttendees.length} confirmed attendees
              </div>
            )}
          </div>
        )}

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleStart}
            disabled={!selectedEventId || !selectedAttendeeId}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            Start Conversation
          </button>
        </div>
      </div>
    </div>
  );
};

export default StartOrganizerConversationModal;
