import React, { useState, useEffect } from 'react';

const OrganizerManagement = () => {
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // all, pending, verified, rejected
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrganizer, setSelectedOrganizer] = useState(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  // Dummy data
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setOrganizers([
        {
          id: 1,
          name: 'John Smith',
          email: 'john@techevents.com',
          company: 'Tech Events Ltd.',
          phone: '+91 9876543210',
          location: 'Mumbai, India',
          status: 'pending',
          submittedAt: '2024-01-15',
          documents: ['business_license.pdf', 'identity_proof.pdf', 'address_proof.pdf'],
          eventsCreated: 0,
          totalEarnings: 0,
          description: 'Specialized in technology conferences and workshops'
        },
        {
          id: 2,
          name: 'Sarah Wilson',
          email: 'sarah@eventpro.com',
          company: 'EventPro Solutions',
          phone: '+91 9876543211',
          location: 'Delhi, India',
          status: 'verified',
          submittedAt: '2024-01-10',
          verifiedAt: '2024-01-12',
          documents: ['business_license.pdf', 'identity_proof.pdf'],
          eventsCreated: 12,
          totalEarnings: 245000,
          description: 'Corporate event management and planning'
        },
        {
          id: 3,
          name: 'Mike Johnson',
          email: 'mike@concertking.com',
          company: 'Concert King',
          phone: '+91 9876543212',
          location: 'Bangalore, India',
          status: 'rejected',
          submittedAt: '2024-01-08',
          rejectedAt: '2024-01-09',
          rejectionReason: 'Incomplete documentation',
          documents: ['business_license.pdf'],
          eventsCreated: 0,
          totalEarnings: 0,
          description: 'Music concerts and entertainment events'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredOrganizers = organizers.filter(organizer => {
    const matchesFilter = filter === 'all' || organizer.status === filter;
    const matchesSearch = organizer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         organizer.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         organizer.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleVerifyOrganizer = (organizer, action, reason = '') => {
    // Update organizer status
    setOrganizers(prev => prev.map(org => 
      org.id === organizer.id 
        ? { 
            ...org, 
            status: action === 'approve' ? 'verified' : 'rejected',
            verifiedAt: action === 'approve' ? new Date().toISOString().split('T')[0] : undefined,
            rejectedAt: action === 'reject' ? new Date().toISOString().split('T')[0] : undefined,
            rejectionReason: action === 'reject' ? reason : undefined
          }
        : org
    ));
    setShowVerificationModal(false);
    setSelectedOrganizer(null);
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
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              setSelectedOrganizer(organizer);
                              setShowVerificationModal(true);
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
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
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 border border-gray-700 max-h-[90vh] overflow-y-auto">
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
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg"
                  >
                    ✅ Approve Organizer
                  </button>
                  <button
                    onClick={() => handleVerifyOrganizer(selectedOrganizer, 'reject', 'Reason for rejection')}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-lg"
                  >
                    ❌ Reject Application
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizerManagement;
