// components/BookingPage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { bookingAPI } from '../../api';

const BookingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { event, quantity, totalPrice } = location.state || {};
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [attendeeInfo, setAttendeeInfo] = useState([]);

  // Initialize attendee info based on quantity
  useEffect(() => {
    if (quantity) {
      const initialAttendees = Array(quantity).fill(null).map((_, index) => ({
        name: '',
        email: '',
        phone: ''
      }));
      setAttendeeInfo(initialAttendees);
    }
  }, [quantity]);

  // Redirect if no event data
  useEffect(() => {
    if (!event) {
      navigate('/events');
    }
  }, [event, navigate]);

  const handleAttendeeChange = (index, field, value) => {
    const updatedAttendees = [...attendeeInfo];
    updatedAttendees[index] = {
      ...updatedAttendees[index],
      [field]: value
    };
    setAttendeeInfo(updatedAttendees);
  };

  const validateAttendeeInfo = () => {
    for (let i = 0; i < attendeeInfo.length; i++) {
      const attendee = attendeeInfo[i];
      if (!attendee.name || !attendee.email) {
        setError(`Please fill in all required details for attendee ${i + 1}`);
        return false;
      }
      
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(attendee.email)) {
        setError(`Please enter a valid email for attendee ${i + 1}`);
        return false;
      }
    }
    return true;
  };

  const handleBooking = async () => {
    if (!validateAttendeeInfo()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Step 1: Create booking
      console.log('Creating booking with:', {
        eventId: event._id,
        quantity,
        attendeeInfo
      });

      const bookingResponse = await bookingAPI.createBooking({
        eventId: event._id,
        quantity,
        attendeeInfo
      });

      console.log('Booking created:', bookingResponse);

      const { booking, requiresPayment } = bookingResponse.data;

      if (!requiresPayment) {
        // Free event - redirect to success page
        navigate('/booking-success', { 
          state: { 
            booking, 
            event,
            message: 'Registration successful!' 
          } 
        });
        return;
      }

      // Step 2: Create Razorpay order for paid events
      console.log('Creating payment order for booking:', booking._id);
      
      const orderResponse = await bookingAPI.createPaymentOrder({
        bookingId: booking._id
      });

      console.log('Payment order created:', orderResponse);

      const { orderId, amount, razorpayKeyId } = orderResponse.data;

      // Step 3: Initialize Razorpay payment
      const razorpayOptions = {
        key: razorpayKeyId,
        amount: amount,
        currency: 'INR',
        name: 'Event Booking',
        description: event.title,
        order_id: orderId,
        handler: async function (response) {
          console.log('Payment successful, verifying:', response);
          
          try {
            // Step 4: Verify payment
            const verifyResponse = await bookingAPI.verifyPayment({
              bookingId: booking._id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            console.log('Payment verified:', verifyResponse);

            // Step 5: Redirect to success page
            navigate('/booking-success', { 
              state: { 
                booking: verifyResponse.data.booking, 
                event,
                paymentId: response.razorpay_payment_id,
                message: 'Payment successful! Your booking is confirmed.'
              } 
            });

          } catch (verifyError) {
            console.error('Payment verification failed:', verifyError);
            setError('Payment verification failed. Please contact support.');
            
            // Handle payment failure
            await bookingAPI.handlePaymentFailure({
              bookingId: booking._id,
              error_description: 'Payment verification failed'
            });
          }
        },
        modal: {
          ondismiss: async function() {
            console.log('Payment modal dismissed');
            
            // Handle payment cancellation
            await bookingAPI.handlePaymentFailure({
              bookingId: booking._id,
              error_description: 'Payment cancelled by user'
            });
            
            setError('Payment was cancelled. You can try again.');
          }
        },
        prefill: {
          name: attendeeInfo[0]?.name || '',
          email: attendeeInfo[0]?.email || '',
          contact: attendeeInfo[0]?.phone || ''
        },
        theme: {
          color: '#3B82F6' // Blue theme to match your design
        }
      };

      // Open Razorpay payment modal
      const razorpay = new window.Razorpay(razorpayOptions);
      razorpay.open();

    } catch (err) {
      console.error('Booking error:', err);
      setError(err.message || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!event) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="btn btn-secondary mb-6"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-3xl font-bold text-white mb-2">Complete Your Booking</h1>
          <p className="text-gray-400">You're just one step away from securing your spot!</p>
        </div>

        {/* Event Summary */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-8">
          <div className="flex items-center space-x-4">
            {event.images && event.images[0] && (
              <img
                src={event.images[0]}
                alt={event.title}
                className="w-16 h-16 rounded-lg object-cover"
              />
            )}
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white">{event.title}</h2>
              <p className="text-gray-400">
                {new Date(event.date).toLocaleDateString()} • {event.location}
              </p>
            </div>
            <div className="text-right">
              <p className="text-gray-400">Total</p>
              <p className="text-2xl font-bold text-green-400">
                {totalPrice === 0 ? 'Free' : `₹${totalPrice.toLocaleString()}`}
              </p>
            </div>
          </div>
        </div>

        {/* Attendee Information */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-8">
          <h3 className="text-xl font-bold text-white mb-6">Attendee Information</h3>
          
          {attendeeInfo.map((attendee, index) => (
            <div key={index} className="mb-6 pb-6 border-b border-gray-700 last:border-b-0">
              <h4 className="text-lg font-semibold text-white mb-4">
                Attendee {index + 1}
                {index === 0 && <span className="text-gray-400 text-sm ml-2">(Primary)</span>}
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={attendee.name}
                    onChange={(e) => handleAttendeeChange(index, 'name', e.target.value)}
                    className="w-full py-3 px-4 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="Enter full name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={attendee.email}
                    onChange={(e) => handleAttendeeChange(index, 'email', e.target.value)}
                    className="w-full py-3 px-4 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="Enter email address"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-gray-400 text-sm font-medium mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={attendee.phone}
                    onChange={(e) => handleAttendeeChange(index, 'phone', e.target.value)}
                    className="w-full py-3 px-4 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-8">
          <h3 className="text-xl font-bold text-white mb-4">Order Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Event</span>
              <span className="text-white">{event.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Quantity</span>
              <span className="text-white">{quantity} ticket{quantity > 1 ? 's' : ''}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Price per ticket</span>
              <span className="text-white">
                {event.price === 0 ? 'Free' : `₹${event.price.toLocaleString()}`}
              </span>
            </div>
            <hr className="border-gray-700" />
            <div className="flex justify-between text-lg font-bold">
              <span className="text-white">Total</span>
              <span className="text-green-400">
                {totalPrice === 0 ? 'Free' : `₹${totalPrice.toLocaleString()}`}
              </span>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-900 border border-red-700 rounded-lg p-4 mb-6">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="text-center">
          <button
            onClick={handleBooking}
            disabled={loading}
            className={`w-full md:w-auto px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 ${
              loading
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'btn btn-primary hover-lift'
            }`}
          >
            {loading 
              ? 'Processing...' 
              : event.price === 0 
                ? 'Register for Free' 
                : `Pay ₹${totalPrice.toLocaleString()}`
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
