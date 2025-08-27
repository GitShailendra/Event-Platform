// EventDetailsPage.jsx - Updated with gray text for description
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventAPI } from '../../api';

const EventDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedImage, setSelectedImage] = useState(0);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [ticketQuantity, setTicketQuantity] = useState(1);

    useEffect(() => {
        fetchEventDetails();
    }, [id]);

    const fetchEventDetails = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await eventAPI.getEventById(id);
            console.log('Fetched event details:', response);
            setEvent(response);
        } catch (err) {
            console.error('Error fetching event details:', err);
            setError(err.message || 'Failed to load event details');
        } finally {
            setLoading(false);
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

    const getCategoryIcon = (category) => {
        const icons = {
            concert: '🎵',
            workshop: '🛠️',
            webinar: '💻',
            meetup: '🤝',
            conference: '🎪'
        };
        return icons[category] || '📅';
    };

    const getCategoryBadge = (category) => {
        const badges = {
            concert: 'badge-primary',
            workshop: 'badge-success',
            webinar: 'badge-warning',
            meetup: 'badge-danger',
            conference: 'badge-primary'
        };
        return badges[category] || 'badge-outline';
    };

    const getSeatsStatus = (seats) => {
        if (seats === 0) return { class: 'badge-danger', text: 'Sold Out', color: 'text-red-400' };
        if (seats < 10) return { class: 'badge-warning', text: `Only ${seats} left!`, color: 'text-yellow-400' };
        if (seats < 50) return { class: 'badge-warning', text: `${seats} seats available`, color: 'text-yellow-400' };
        return { class: 'badge-success', text: `${seats} seats available`, color: 'text-green-400' };
    };

    const handleBookNow = () => {
        if (event.availableSeats === 0) return;
        setShowBookingModal(true);
    };

    const handleBookingConfirm = () => {
        navigate('/booking', {
            state: {
                event,
                quantity: ticketQuantity,
                totalPrice: event.price * ticketQuantity
            }
        });
    };

    const getOrganizerName = () => {
        if (event.createdBy) {
            return event.createdBy.username ||
                `${event.createdBy.firstName || ''} ${event.createdBy.lastName || ''}`.trim() ||
                'Event Organizer';
        }
        return 'Event Organizer';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center animate-pulse-soft">
                    <div className="spinner mx-auto mb-4"></div>
                    <p className="text-white text-lg font-medium">Loading event details...</p>
                </div>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">⚠️</div>
                    <h3 className="text-2xl font-bold text-white mb-2">Event Not Found</h3>
                    <p className="text-gray-400 mb-6">{error || 'This event does not exist or has been removed.'}</p>
                    <button
                        onClick={() => navigate('/events')}
                        className="btn btn-primary hover-lift"
                    >
                        Browse Events
                    </button>
                </div>
            </div>
        );
    }

    const seatsStatus = getSeatsStatus(event.availableSeats);
    const isEventPast = new Date(event.date) < new Date();
    const maxTickets = Math.min(event.availableSeats, 10);

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Back Button */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                <button
                    onClick={() => navigate(-1)}
                    className="btn btn-secondary mb-6 hover-lift"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Events
                </button>
            </div>

            {/* Hero Section */}
            <section className="pb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

                        {/* Image Gallery */}
                        <div className="space-y-4 animate-fade-in">
                            {/* Remove 'card' class and add the styles directly */}
                            <div className="relative h-96 lg:h-[500px] rounded-xl overflow-hidden bg-gray-800 border border-gray-700 hover-glow shadow-lg transition-all duration-300 hover:transform hover:-translate-y-1">
                                {event.images && event.images.length > 0 ? (
                                    <img
                                        src={event.images[selectedImage]}
                                        alt={event.title}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'flex';
                                        }}
                                    />
                                ) : null}

                                {/* Fallback Icon */}
                                <div
                                    className="absolute inset-0 gradient-bg flex items-center justify-center text-8xl lg:text-9xl animate-float"
                                    style={{ display: event.images && event.images.length > 0 ? 'none' : 'flex' }}
                                >
                                    {getCategoryIcon(event.category)}
                                </div>
                            </div>

                            {/* Image Thumbnails */}
                            {event.images && event.images.length > 1 && (
                                <div className="flex space-x-2 overflow-x-auto pb-2">
                                    {event.images.map((image, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedImage(index)}
                                            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all hover-lift ${selectedImage === index ? 'border-blue-500' : 'border-gray-600'
                                                }`}
                                        >
                                            <img
                                                src={image}
                                                alt={`${event.title} ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>


                        {/* Event Info */}
                        <div className="space-y-6 animate-slide-up">
                            {/* Badges */}
                            <div className="flex flex-wrap gap-2">
                                <span className={`badge ${getCategoryBadge(event.category)} capitalize`}>
                                    {event.category}
                                </span>
                                <span className={`badge ${seatsStatus.class}`}>
                                    {seatsStatus.text}
                                </span>
                                {event.isFeatured && (
                                    <span className="badge badge-warning">
                                        ⭐ Featured
                                    </span>
                                )}
                                {isEventPast && (
                                    <span className="badge badge-outline">
                                        Past Event
                                    </span>
                                )}
                            </div>

                            {/* Title */}
                            <h1 className="text-3xl lg:text-4xl font-bold text-white leading-tight">
                                {event.title}
                            </h1>

                            {/* Key Details */}
                            <div className="space-y-4">
                                {/* Date & Time */}
                                <div className="flex items-center text-gray-300">
                                    <svg className="h-5 w-5 mr-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                    </svg>
                                    <div>
                                        <p className="font-semibold text-white">{formatDate(event.date)}</p>
                                        <p className="text-sm text-gray-400">{formatTime(event.date)}</p>
                                    </div>
                                </div>

                                {/* Location */}
                                <div className="flex items-center text-gray-300">
                                    <svg className="h-5 w-5 mr-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                    </svg>
                                    <div>
                                        <p className="font-semibold text-white capitalize">{event.location}</p>
                                        {event.venue && <p className="text-sm text-gray-400">{event.venue}</p>}
                                    </div>
                                </div>

                                {/* Organizer */}
                                <div className="flex items-center text-gray-300">
                                    <svg className="h-5 w-5 mr-3 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                    </svg>
                                    <div>
                                        <p className="font-semibold text-white">Organized by</p>
                                        <p className="text-sm text-gray-400">{getOrganizerName()}</p>
                                    </div>
                                </div>

                                {/* Capacity */}
                                <div className="flex items-center text-gray-300">
                                    <svg className="h-5 w-5 mr-3 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                                    </svg>
                                    <div>
                                        <p className="font-semibold text-white">Capacity: {event.capacity.toLocaleString()}</p>
                                        <p className={`text-sm ${seatsStatus.color}`}>{seatsStatus.text}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Price & Booking */}
                            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-400 text-sm">Price per ticket</p>
                                        <p className="text-3xl font-bold text-white">
                                            {event.price === 0 ? 'Free' : `₹${event.price.toLocaleString()}`}
                                        </p>
                                    </div>
                                    {event.price > 0 && (
                                        <div className="text-right">
                                            <p className="text-gray-400 text-sm">Total ({ticketQuantity} {ticketQuantity === 1 ? 'ticket' : 'tickets'})</p>
                                            <p className="text-xl font-bold text-green-400">
                                                ₹{(event.price * ticketQuantity).toLocaleString()}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {!isEventPast && event.availableSeats > 0 && (
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center space-x-2">
                                            <label className="text-gray-400 text-sm">Quantity:</label>
                                            <select
                                                value={ticketQuantity}
                                                onChange={(e) => setTicketQuantity(Number(e.target.value))}
                                                className="py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none transition-colors"
                                            >
                                                {[...Array(maxTickets)].map((_, i) => (
                                                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={handleBookNow}
                                    disabled={isEventPast || event.availableSeats === 0}
                                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${isEventPast
                                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                            : event.availableSeats === 0
                                                ? 'bg-red-600 text-white cursor-not-allowed'
                                                : 'btn btn-primary hover-lift'
                                        }`}
                                >
                                    {isEventPast
                                        ? 'Event Has Ended'
                                        : event.availableSeats === 0
                                            ? 'Sold Out'
                                            : event.price === 0
                                                ? 'Register for Free'
                                                : 'Book Now'
                                    }
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Event Description */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 ">
                        <div className="lg:col-span-2 space-y-8 ">
                            {/* About Event */}
                            <div className="card animate-fade-in bg-gray-800 ">
                                <h2 className="text-2xl font-bold text-white mb-4">About This Event</h2>
                                <div className="prose prose-invert max-w-none ">
                                    {/* UPDATED: Changed from text-gray-300 to text-gray-400 for better contrast */}
                                    <p className="text-gray-400 leading-relaxed whitespace-pre-line">
                                        {event.description}
                                    </p>
                                </div>
                            </div>

                            {/* Tags */}
                            {event.tags && event.tags.length > 0 && (
                                <div className="card animate-fade-in bg-gray-800">
                                    <h3 className="text-xl font-bold text-white mb-4">Tags</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {event.tags.map((tag, index) => (
                                            <span key={index} className="badge badge-outline">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Event Stats */}
                            <div className="card animate-slide-up">
                                <h3 className="text-xl font-bold text-white mb-4">Event Stats</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400">Total Capacity</span>
                                        <span className="text-white font-semibold">{event.capacity.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400">Available Seats</span>
                                        <span className={`font-semibold ${seatsStatus.color}`}>
                                            {event.availableSeats.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400">Booked</span>
                                        <span className="text-white font-semibold">
                                            {(event.capacity - event.availableSeats).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="mt-4">
                                        <div className="flex justify-between text-sm text-gray-400 mb-1">
                                            <span>Booking Progress</span>
                                            <span>{Math.round(((event.capacity - event.availableSeats) / event.capacity) * 100)}%</span>
                                        </div>
                                        <div className="w-full bg-gray-700 rounded-full h-2">
                                            <div
                                                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                                                style={{
                                                    width: `${((event.capacity - event.availableSeats) / event.capacity) * 100}%`
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Share Event */}
                            <div className="card animate-slide-up">
                                <h3 className="text-xl font-bold text-white mb-4">Share Event</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <button className="btn btn-secondary text-sm">
                                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                                        </svg>
                                        Twitter
                                    </button>
                                    <button className="btn btn-secondary text-sm">
                                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                        </svg>
                                        Facebook
                                    </button>
                                    <button className="btn btn-secondary text-sm">
                                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0190 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9460 2.4189-2.1568 2.4189Z" />
                                        </svg>
                                        Discord
                                    </button>
                                    <button className="btn btn-secondary text-sm">
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                                        </svg>
                                        Copy Link
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Booking Modal */}
            {showBookingModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-md w-full animate-scale-in">
                        <div className="text-center mb-6">
                            <h3 className="text-2xl font-bold text-white mb-2">Confirm Booking</h3>
                            <p className="text-gray-400">{event.title}</p>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Tickets</span>
                                <span className="text-white font-semibold">{ticketQuantity}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Price per ticket</span>
                                <span className="text-white font-semibold">
                                    {event.price === 0 ? 'Free' : `₹${event.price.toLocaleString()}`}
                                </span>
                            </div>
                            <hr className="border-gray-700" />
                            <div className="flex justify-between items-center">
                                <span className="text-white font-bold">Total</span>
                                <span className="text-green-400 font-bold text-xl">
                                    {event.price === 0 ? 'Free' : `₹${(event.price * ticketQuantity).toLocaleString()}`}
                                </span>
                            </div>
                        </div>

                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowBookingModal(false)}
                                className="btn btn-secondary flex-1"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleBookingConfirm}
                                className="btn btn-primary flex-1 hover-lift"
                            >
                                {event.price === 0 ? 'Register' : 'Proceed to Payment'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EventDetailsPage;
