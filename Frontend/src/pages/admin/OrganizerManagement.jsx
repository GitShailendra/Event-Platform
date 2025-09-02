import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api';

const OrganizerManagement = () => {
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrganizer, setSelectedOrganizer] = useState(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    const fetchOrganizers = async () => {
      try {
        setLoading(true);
        const response = await adminAPI.getAllUsers();
        console.log('Fetched data:', response);
        
        const { users, events, organizerEventsMap } = response;
        
        // Filter to show ONLY organizer-related users
        const organizerUsers = users
          .filter(user => 
            user.role === 'organizer' || 
            user.isOrganizer === true || 
            user.pendingVerification === true
          )
          .map(user => {
            // Get events for this organizer
            const userEvents = organizerEventsMap ? organizerEventsMap[user._id] || [] : [];
            
            // Calculate total earnings from events
            const totalEarnings = userEvents.reduce((sum, event) => {
              return sum + (event.totalEarnings || 0);
            }, 0);

            return {
              id: user._id,
              name: `${user.firstName} ${user.lastName}`,
              email: user.email,
              company: user.company || 'N/A',
              phone: user.phoneNumber || user.phone || 'N/A',
              location: user.location || 'N/A',
              status: user.isOrganizer ? 'verified' : 'pending',
              submittedAt: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A',
              verifiedAt: user.isOrganizer && user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : undefined,
              rejectedAt: !user.isOrganizer && !user.pendingVerification ? new Date(user.updatedAt).toLocaleDateString() : undefined,
              rejectionReason: !user.isOrganizer && !user.pendingVerification ? 'Application rejected' : undefined,
              documents: ['business_license.pdf', 'identity_proof.pdf'],
              eventsCreated: userEvents.length, // Real count from backend
              totalEarnings: totalEarnings, // Real earnings from backend
              description: user.bio || 'No description provided',
              role: user.role,
              events: userEvents // Store events for modal display
            };
          });

        setOrganizers(organizerUsers);
        console.log('Processed organizers:', organizerUsers);
      } catch (error) {
        console.error('Error fetching organizers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizers();
  }, []);

  const filteredOrganizers = organizers.filter(organizer => {
    const matchesFilter = filter === 'all' || organizer.status === filter;
    const matchesSearch = organizer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         organizer.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         organizer.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleVerifyOrganizer = async (organizer, action, reason = '') => {
    setProcessingId(organizer.id);
    try {
      if (action === 'approve') {
        await adminAPI.approveOrganizer(organizer.id);
      } else if (action === 'reject') {
        await adminAPI.rejectOrganizer(organizer.id);
      }

      setOrganizers(prev => prev.map(org => 
        org.id === organizer.id 
          ? { 
              ...org, 
              status: action === 'approve' ? 'verified' : 'rejected',
              verifiedAt: action === 'approve' ? new Date().toLocaleDateString() : undefined,
              rejectedAt: action === 'reject' ? new Date().toLocaleDateString() : undefined,
              rejectionReason: action === 'reject' ? reason || 'Application rejected by admin' : undefined
            }
          : org
      ));
      
      setShowVerificationModal(false);
      setSelectedOrganizer(null);
    } catch (error) {
      console.error(`Error ${action}ing organizer:`, error);
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-900 text-yellow-300 border-yellow-700',
      verified: 'bg-green-900 text-green-300 border-green-700',
      rejected: 'bg-red-900 text-red-300 border-red-700'
    };
    return badges[status];
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: '⏳',
      verified: '✅',
      rejected: '❌'
    };
    return icons[status];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
        <span className="ml-3 text-gray-400">Loading organizers...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Organizer Management</h1>
          <p className="text-gray-400">Verify and manage event organizers</p>
        </div>
      </div>

      {/* Show message if no organizers */}
      {organizers.length === 0 && !loading && (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 text-center">
          <p className="text-gray-400">No organizer applications found.</p>
        </div>
      )}

      {organizers.length > 0 && (
        <>
          {/* Filters and Search */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex space-x-2">
                {[
                  { key: 'all', label: 'All Organizers' },
                  { key: 'pending', label: 'Pending' },
                  { key: 'verified', label: 'Verified' },
                  { key: 'rejected', label: 'Rejected' }
                ].map(filterOption => (
                  <button
                    key={filterOption.key}
                    onClick={() => setFilter(filterOption.key)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      filter === filterOption.key
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {filterOption.label}
                  </button>
                ))}
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search organizers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
                />
                <svg className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Organizers List */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="text-left py-4 px-6 text-gray-300 font-medium">Organizer</th>
                    <th className="text-left py-4 px-6 text-gray-300 font-medium">Company</th>
                    <th className="text-left py-4 px-6 text-gray-300 font-medium">Status</th>
                    <th className="text-left py-4 px-6 text-gray-300 font-medium">Events</th>
                    <th className="text-left py-4 px-6 text-gray-300 font-medium">Earnings</th>
                    <th className="text-left py-4 px-6 text-gray-300 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrganizers.map(organizer => (
                    <tr key={organizer.id} className="border-t border-gray-700 hover:bg-gray-700/50">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {organizer.name.split(' ').map(n => n.charAt(0)).join('')}
                          </div>
                          <div>
                            <p className="text-white font-medium">{organizer.name}</p>
                            <p className="text-gray-400 text-sm">{organizer.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-white">{organizer.company}</p>
                        <p className="text-gray-400 text-sm">{organizer.location}</p>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getStatusIcon(organizer.status)}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(organizer.status)}`}>
                            {organizer.status.charAt(0).toUpperCase() + organizer.status.slice(1)}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-white">{organizer.eventsCreated}</td>
                      <td className="py-4 px-6 text-white">
                        ₹{organizer.totalEarnings.toLocaleString()}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedOrganizer(organizer);
                              setShowVerificationModal(true);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                          >
                            View Details
                          </button>
                          {organizer.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleVerifyOrganizer(organizer, 'approve')}
                                disabled={processingId === organizer.id}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                              >
                                {processingId === organizer.id ? 'Processing...' : 'Approve'}
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedOrganizer(organizer);
                                  setShowVerificationModal(true);
                                }}
                                disabled={processingId === organizer.id}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Verification Modal */}
          {showVerificationModal && selectedOrganizer && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
              <div className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 border border-gray-700 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Organizer Details</h3>
                  <button
                    onClick={() => setShowVerificationModal(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-400 text-sm">Name</label>
                      <p className="text-white font-medium">{selectedOrganizer.name}</p>
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm">Email</label>
                      <p className="text-white font-medium">{selectedOrganizer.email}</p>
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm">Company</label>
                      <p className="text-white font-medium">{selectedOrganizer.company}</p>
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm">Phone</label>
                      <p className="text-white font-medium">{selectedOrganizer.phone}</p>
                    </div>
                  </div>

                  {/* Events Created */}
                  {selectedOrganizer.events && selectedOrganizer.events.length > 0 && (
                    <div>
                      <label className="text-gray-400 text-sm mb-2 block">Events Created ({selectedOrganizer.events.length})</label>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {selectedOrganizer.events.map((event, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-700 p-3 rounded-lg">
                            <div>
                              <span className="text-white font-medium">{event.title}</span>
                              <p className="text-gray-400 text-sm">{event.category} • {new Date(event.date).toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-green-400">₹{(event.totalEarnings || 0).toLocaleString()}</p>
                              <p className="text-gray-400 text-xs">{event.totalAttendees || 0} attendees</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <div>
                    <label className="text-gray-400 text-sm">Description</label>
                    <p className="text-white">{selectedOrganizer.description}</p>
                  </div>

                  {/* Documents */}
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Submitted Documents</label>
                    <div className="space-y-2">
                      {selectedOrganizer.documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-700 p-3 rounded-lg">
                          <span className="text-white">{doc}</span>
                          <button className="text-blue-400 hover:text-blue-300 text-sm">
                            Download
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  {selectedOrganizer.status === 'pending' && (
                    <div className="flex space-x-3 pt-4">
                      <button
                        onClick={() => handleVerifyOrganizer(selectedOrganizer, 'approve')}
                        disabled={processingId === selectedOrganizer.id}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg disabled:opacity-50"
                      >
                        {processingId === selectedOrganizer.id ? 'Processing...' : '✅ Approve Organizer'}
                      </button>
                      <button
                        onClick={() => handleVerifyOrganizer(selectedOrganizer, 'reject', 'Reason for rejection')}
                        disabled={processingId === selectedOrganizer.id}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-lg disabled:opacity-50"
                      >
                        {processingId === selectedOrganizer.id ? 'Processing...' : '❌ Reject Application'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OrganizerManagement;
