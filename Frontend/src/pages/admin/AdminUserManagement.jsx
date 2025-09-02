import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api'; // Adjust path as needed

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  // Fetch real users data
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await adminAPI.getAllUsers();
        console.log('Fetched users:', response);
        
        const { users: usersData } = response;
        
        // Map users to frontend format
        const mappedUsers = usersData.map(user => ({
          id: user._id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          phone: user.phoneNumber || user.phone || 'N/A',
          location: user.location || 'N/A',
          status: user.isActive ? 'active' : 'suspended',
          joinedAt: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A',
          lastLogin: 'N/A', // Add if you track last login
          eventsAttended: 0, // Add if you track this
          totalSpent: 0, // Add if you track this
          preferredCategories: [], // Add if you track this
          suspensionReason: user.isActive ? undefined : 'Blocked by admin',
          role: user.role,
          isOrganizer: user.isOrganizer
        }));
        
        setUsers(mappedUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleUserAction = async (userId, action) => {
    setProcessingId(userId);
    try {
      if (action === 'suspend') {
        await adminAPI.blockUser(userId);
      } else if (action === 'activate') {
        await adminAPI.unblockUser(userId);
      }

      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { 
              ...user, 
              status: action === 'suspend' ? 'suspended' : 'active',
              suspensionReason: action === 'suspend' ? 'Blocked by admin' : undefined
            }
          : user
      ));
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: 'bg-green-900 text-green-300 border-green-700',
      suspended: 'bg-red-900 text-red-300 border-red-700',
      inactive: 'bg-gray-700 text-gray-300 border-gray-600'
    };
    return badges[status];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
        <span className="ml-3 text-gray-400">Loading users...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">User Management</h1>
          <p className="text-gray-400">Monitor and manage platform users</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex space-x-2">
            {[
              { key: 'all', label: 'All Users' },
              { key: 'active', label: 'Active' },
              { key: 'suspended', label: 'Blocked' },
              { key: 'inactive', label: 'Inactive' }
            ].map(filterOption => (
              <button
                key={filterOption.key}
                onClick={() => setStatusFilter(filterOption.key)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === filterOption.key
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
              placeholder="Search users..."
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

      {/* Users List */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="text-left py-4 px-6 text-gray-300 font-medium">User</th>
                <th className="text-left py-4 px-6 text-gray-300 font-medium">Contact</th>
                <th className="text-left py-4 px-6 text-gray-300 font-medium">Role</th>
                <th className="text-left py-4 px-6 text-gray-300 font-medium">Status</th>
                <th className="text-left py-4 px-6 text-gray-300 font-medium">Activity</th>
                <th className="text-left py-4 px-6 text-gray-300 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                (user.role!== 'admin' &&(
                  <tr key={user.id} className="border-t border-gray-700 hover:bg-gray-700/50">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {user.name.split(' ').map(n => n.charAt(0)).join('')}
                      </div>
                      <div>
                        <p className="text-white font-medium">{user.name}</p>
                        <p className="text-gray-400 text-sm">Joined: {user.joinedAt}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-white">{user.email}</p>
                    <p className="text-gray-400 text-sm">{user.location}</p>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === 'admin' ? 'bg-purple-900 text-purple-300' :
                      user.role === 'organizer' ? 'bg-orange-900 text-orange-300' :
                      'bg-blue-900 text-blue-300'
                    }`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      {user.isOrganizer && user.role !== 'organizer' && ' (Organizer)'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(user.status)}`}>
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-white">{user.eventsAttended} events</p>
                    <p className="text-gray-400 text-sm">Total: ₹{user.totalSpent.toLocaleString()}</p>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowUserModal(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                      >
                        View
                      </button>
                      {user.role !== 'admin' && ( // Don't allow blocking admin users
                        <>
                          {user.status === 'active' ? (
                            <button
                              onClick={() => handleUserAction(user.id, 'suspend')}
                              disabled={processingId === user.id}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                            >
                              {processingId === user.id ? 'Processing...' : 'Block'}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUserAction(user.id, 'activate')}
                              disabled={processingId === user.id}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                            >
                              {processingId === user.id ? 'Processing...' : 'Unblock'}
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
                ))
                
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">User Details</h3>
              <button
                onClick={() => setShowUserModal(false)}
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
                  <p className="text-white font-medium">{selectedUser.name}</p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Email</label>
                  <p className="text-white font-medium">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Phone</label>
                  <p className="text-white font-medium">{selectedUser.phone}</p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Location</label>
                  <p className="text-white font-medium">{selectedUser.location}</p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Role</label>
                  <p className="text-white font-medium">{selectedUser.role}</p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Organizer Status</label>
                  <p className="text-white font-medium">{selectedUser.isOrganizer ? 'Yes' : 'No'}</p>
                </div>
              </div>

              {/* Activity Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Events Attended</p>
                  <p className="text-2xl font-bold text-white">{selectedUser.eventsAttended}</p>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Total Spent</p>
                  <p className="text-2xl font-bold text-green-400">₹{selectedUser.totalSpent.toLocaleString()}</p>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Status</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(selectedUser.status)}`}>
                    {selectedUser.status.charAt(0).toUpperCase() + selectedUser.status.slice(1)}
                  </span>
                </div>
              </div>

              {/* Suspension Reason */}
              {selectedUser.status === 'suspended' && selectedUser.suspensionReason && (
                <div>
                  <label className="text-gray-400 text-sm">Block Reason</label>
                  <p className="text-red-300">{selectedUser.suspensionReason}</p>
                </div>
              )}

              {/* Action Buttons */}
              {selectedUser.role !== 'admin' && (
                <div className="flex space-x-3 pt-4">
                  {selectedUser.status === 'active' ? (
                    <button
                      onClick={() => {
                        handleUserAction(selectedUser.id, 'suspend');
                        setShowUserModal(false);
                      }}
                      disabled={processingId === selectedUser.id}
                      className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50"
                    >
                      {processingId === selectedUser.id ? 'Processing...' : 'Block User'}
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        handleUserAction(selectedUser.id, 'activate');
                        setShowUserModal(false);
                      }}
                      disabled={processingId === selectedUser.id}
                      className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50"
                    >
                      {processingId === selectedUser.id ? 'Processing...' : 'Unblock User'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
