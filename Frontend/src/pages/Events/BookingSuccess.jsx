// components/BookingSuccess.jsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const BookingSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { booking, event, paymentId, message } = location.state || {};

  if (!booking || !event) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Invalid Access</h2>
          <button 
            onClick={() => navigate('/events')} 
            className="btn btn-primary"
          >
            Browse Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Booking Confirmed!</h1>
          <p className="text-gray-400">{message}</p>
        </div>

        {/* Booking Details */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Booking Details</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Booking Reference</span>
              <span className="text-white font-semibold">{booking.bookingReference}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-400">Event</span>
              <span className="text-white">{event.title}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-400">Date & Time</span>
              <span className="text-white">
                {new Date(event.date).toLocaleDateString()} at {new Date(event.date).toLocaleTimeString()}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-400">Location</span>
              <span className="text-white">{event.location}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-400">Tickets</span>
              <span className="text-white">{booking.quantity}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-400">Total Amount</span>
              <span className="text-green-400 font-bold">
                {booking.totalAmount === 0 ? 'Free' : `₹${booking.totalAmount.toLocaleString()}`}
              </span>
            </div>

            {paymentId && (
              <div className="flex justify-between">
                <span className="text-gray-400">Payment ID</span>
                <span className="text-white text-sm">{paymentId}</span>
              </div>
            )}
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-bold text-white mb-3">What's Next?</h3>
          <ul className="text-gray-300 space-y-2">
            <li>• Check your email for the confirmation and ticket details</li>
            <li>• Save this booking reference: <span className="text-white font-semibold">{booking.bookingReference}</span></li>
            <li>• Arrive at the venue 15 minutes before the event starts</li>
            {event.price > 0 && <li>• Show your booking confirmation at the entrance</li>}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/my-bookings')}
            className="btn btn-primary"
          >
            View My Bookings
          </button>
          <button
            onClick={() => navigate('/events')}
            className="btn btn-secondary"
          >
            Browse More Events
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;
