import React, { useState } from 'react';

const UserTickets = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  
  const tickets = [
    {
      id: 'TKT-001234',
      eventTitle: 'React Workshop 2025',
      eventDate: '2025-09-15',
      eventTime: '10:00 AM',
      location: 'Mumbai Tech Hub',
      status: 'active',
      price: 2500,
      purchaseDate: '2025-08-01',
      category: 'workshops',
      organizer: 'Tech Academy',
      seatNumber: 'A-15',
      qrCode: 'QR123456'
    },
    {
      id: 'TKT-001235',
      eventTitle: 'AI Summit Conference',
      eventDate: '2025-10-20',
      eventTime: '9:00 AM',
      location: 'Bangalore Convention Center',
      status: 'active',
      price: 4000,
      purchaseDate: '2025-08-05',
      category: 'conferences',
      organizer: 'AI Institute',
      seatNumber: 'B-42',
      qrCode: 'QR789012'
    },
    {
      id: 'TKT-001200',
      eventTitle: 'JavaScript Bootcamp',
      eventDate: '2025-07-20',
      eventTime: '11:00 AM',
      location: 'Online',
      status: 'used',
      price: 1500,
      purchaseDate: '2025-07-01',
      category: 'workshops',
      organizer: 'Code Masters',
      seatNumber: 'Virtual',
      qrCode: 'QR345678'
    },
    {
      id: 'TKT-001150',
      eventTitle: 'Design Thinking Workshop',
      eventDate: '2025-06-15',
      eventTime: '2:00 PM',
      location: 'Delhi Creative Hub',
      status: 'used',
      price: 2000,
      purchaseDate: '2025-06-01',
      category: 'workshops',
      organizer: 'Design Studio',
      seatNumber: 'C-08',
      qrCode: 'QR901234'
    },
    {
      id: 'TKT-001300',
      eventTitle: 'Photography Exhibition',
      eventDate: '2025-11-05',
      eventTime: '6:00 PM',
      location: 'Chennai Art Gallery',
      status: 'cancelled',
      price: 800,
      purchaseDate: '2025-08-10',
      category: 'meetups',
      organizer: 'Photo Club',
      seatNumber: 'D-22',
      qrCode: 'QR567890'
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

  const getStatusBadge = (status) => {
    const badges = {
      active: { class: 'bg-green-900 text-green-300 border-green-700', label: 'Active' },
      used: { class: 'bg-gray-900 text-gray-300 border-gray-700', label: 'Used' },
      cancelled: { class: 'bg-red-900 text-red-300 border-red-700', label: 'Cancelled' },
      expired: { class: 'bg-yellow-900 text-yellow-300 border-yellow-700', label: 'Expired' }
    };
    return badges[status] || badges.active;
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

  const filteredTickets = tickets.filter(ticket => 
    activeFilter === 'all' || ticket.status === activeFilter
  );

  const downloadTicket = (ticketId) => {
    // Mock download functionality
    console.log(`Downloading ticket: ${ticketId}`);
  };

  const shareTicket = (ticketId) => {
    // Mock share functionality
    console.log(`Sharing ticket: ${ticketId}`);
  };

  const filterButtons = [
    { key: 'all', label: 'All Tickets', count: tickets.length },
    { key: 'active', label: 'Active', count: tickets.filter(t => t.status === 'active').length },
    { key: 'used', label: 'Used', count: tickets.filter(t => t.status === 'used').length },
    { key: 'cancelled', label: 'Cancelled', count: tickets.filter(t => t.status === 'cancelled').length }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">My Tickets</h1>
          <p className="text-gray-400 mt-1">{filteredTickets.length} tickets found</p>
        </div>
        <div className="flex space-x-3">
          <button className="btn-secondary">
            <span className="mr-2">📧</span>
            Email All
          </button>
          <button className="btn-primary">
            <span className="mr-2">📥</span>
            Download All
          </button>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-3">
        {filterButtons.map(filter => (
          <button
            key={filter.key}
            onClick={() => setActiveFilter(filter.key)}
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

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Event</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Location</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredTickets.map(ticket => {
                const statusBadge = getStatusBadge(ticket.status);
                return (
                  <tr key={ticket.id} className="hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{getCategoryIcon(ticket.category)}</span>
                        <div>
                          <div className="font-medium text-white">{ticket.eventTitle}</div>
                          <div className="text-gray-400 text-sm">ID: {ticket.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      <div>{formatDate(ticket.eventDate)}</div>
                      <div className="text-gray-400 text-sm">{ticket.eventTime}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      <div>{ticket.location}</div>
                      {ticket.seatNumber !== 'Virtual' && (
                        <div className="text-gray-400 text-sm">Seat: {ticket.seatNumber}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {formatCurrency(ticket.price)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusBadge.class}`}>
                        {statusBadge.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => downloadTicket(ticket.id)}
                          className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                          disabled={ticket.status === 'cancelled'}
                        >
                          Download
                        </button>
                        <button
                          onClick={() => shareTicket(ticket.id)}
                          className="text-gray-400 hover:text-gray-300 text-sm font-medium"
                        >
                          Share
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden grid grid-cols-1 gap-4">
        {filteredTickets.map((ticket, index) => {
          const statusBadge = getStatusBadge(ticket.status);
          return (
            <div
              key={ticket.id}
              className="bg-gray-800 border border-gray-700 rounded-xl p-6 animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getCategoryIcon(ticket.category)}</span>
                  <div>
                    <h3 className="font-semibold text-white">{ticket.eventTitle}</h3>
                    <p className="text-gray-400 text-sm">ID: {ticket.id}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusBadge.class}`}>
                  {statusBadge.label}
                </span>
              </div>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center text-gray-300">
                  <span className="text-blue-400 mr-2">📅</span>
                  {formatDate(ticket.eventDate)} at {ticket.eventTime}
                </div>
                <div className="flex items-center text-gray-300">
                  <span className="text-green-400 mr-2">📍</span>
                  {ticket.location}
                  {ticket.seatNumber !== 'Virtual' && ` - Seat ${ticket.seatNumber}`}
                </div>
                <div className="flex items-center text-gray-300">
                  <span className="text-purple-400 mr-2">💰</span>
                  {formatCurrency(ticket.price)}
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => downloadTicket(ticket.id)}
                  className="btn-primary text-sm px-4 py-2 flex-1"
                  disabled={ticket.status === 'cancelled'}
                >
                  <span className="mr-2">📥</span>
                  Download
                </button>
                <button
                  onClick={() => shareTicket(ticket.id)}
                  className="btn-secondary text-sm px-4 py-2"
                >
                  <span className="mr-2">📤</span>
                  Share
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredTickets.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4 animate-float">🎫</div>
          <h2 className="text-2xl font-bold text-white mb-2">No Tickets Found</h2>
          <p className="text-gray-400 mb-6">
            {activeFilter === 'all' 
              ? "You haven't purchased any tickets yet." 
              : `No ${activeFilter} tickets found.`
            }
          </p>
          <button className="btn-primary">
            Browse Events
          </button>
        </div>
      )}
    </div>
  );
};

export default UserTickets;
