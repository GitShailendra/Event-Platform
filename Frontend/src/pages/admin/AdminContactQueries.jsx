import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../api'; // Adjust path as needed

const AdminContactComponent = () => {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchContactQueries();
  }, []);

  const fetchContactQueries = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllContactQueries();
      setQueries(response);
    } catch (error) {
      console.error('Failed to fetch contact queries:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredQueries = queries.filter(query => {
    const matchesSearch = query.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         query.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         query.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || query.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getCategoryBadge = (category) => {
    const badges = {
      'General Inquiry': 'bg-blue-900 text-blue-300 border-blue-700',
      'Technical Support': 'bg-red-900 text-red-300 border-red-700',
      'Billing': 'bg-green-900 text-green-300 border-green-700',
      'Partnership': 'bg-purple-900 text-purple-300 border-purple-700',
      'Press & Media': 'bg-yellow-900 text-yellow-300 border-yellow-700',
      'Other': 'bg-gray-700 text-gray-300 border-gray-600'
    };
    return badges[category] || badges['Other'];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
        <span className="ml-3 text-gray-400">Loading contact queries...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Contact Queries</h1>
          <p className="text-gray-400">View and manage customer inquiries</p>
        </div>
        <div className="mt-4 md:mt-0">
          <span className="text-gray-400">Total Queries: </span>
          <span className="text-white font-bold">{queries.length}</span>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All Categories' },
              { key: 'General Inquiry', label: 'General' },
              { key: 'Technical Support', label: 'Technical' },
              { key: 'Billing', label: 'Billing' },
              { key: 'Partnership', label: 'Partnership' },
              { key: 'Press & Media', label: 'Press' },
              { key: 'Other', label: 'Other' }
            ].map(filterOption => (
              <button
                key={filterOption.key}
                onClick={() => setCategoryFilter(filterOption.key)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  categoryFilter === filterOption.key
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
              placeholder="Search queries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
            />
            <svg className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Contact Queries Table */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="text-left py-4 px-6 text-gray-300 font-medium">Contact Info</th>
                <th className="text-left py-4 px-6 text-gray-300 font-medium">Category</th>
                <th className="text-left py-4 px-6 text-gray-300 font-medium">Subject</th>
                <th className="text-left py-4 px-6 text-gray-300 font-medium">Date</th>
                <th className="text-left py-4 px-6 text-gray-300 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQueries.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 px-6 text-center text-gray-400">
                    No contact queries found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredQueries.map(query => (
                  <tr key={query._id} className="border-t border-gray-700 hover:bg-gray-700/50">
                    <td className="py-4 px-6">
                      <div>
                        <p className="text-white font-medium">{query.fullName}</p>
                        <p className="text-gray-400 text-sm">{query.email}</p>
                        <p className="text-gray-400 text-sm">{query.phone}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryBadge(query.category)}`}>
                        {query.category}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-white font-medium">{query.subject}</p>
                      <p className="text-gray-400 text-sm truncate max-w-xs">{query.message}</p>
                    </td>
                    <td className="py-4 px-6 text-white">
                      {new Date(query.createdAt).toLocaleDateString()}
                      <br />
                      <span className="text-gray-400 text-sm">
                        {new Date(query.createdAt).toLocaleTimeString()}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => {
                          setSelectedQuery(query);
                          setShowModal(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Query Details Modal */}
      {showModal && selectedQuery && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 border border-gray-700 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Contact Query Details</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm">Name</label>
                  <p className="text-white font-medium">{selectedQuery.fullName}</p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Email</label>
                  <p className="text-white font-medium">{selectedQuery.email}</p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Phone</label>
                  <p className="text-white font-medium">{selectedQuery.phone}</p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Category</label>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getCategoryBadge(selectedQuery.category)}`}>
                    {selectedQuery.category}
                  </span>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="text-gray-400 text-sm">Subject</label>
                <p className="text-white font-medium">{selectedQuery.subject}</p>
              </div>

              {/* Message */}
              <div>
                <label className="text-gray-400 text-sm">Message</label>
                <div className="bg-gray-700 p-4 rounded-lg mt-2">
                  <p className="text-white whitespace-pre-wrap">{selectedQuery.message}</p>
                </div>
              </div>

              {/* Timestamp */}
              <div>
                <label className="text-gray-400 text-sm">Submitted On</label>
                <p className="text-white">
                  {new Date(selectedQuery.createdAt).toLocaleString()}
                </p>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-4 border-t border-gray-700">
                <a
                  href={`mailto:${selectedQuery.email}?subject=Re: ${selectedQuery.subject}`}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
                >
                  Reply via Email
                </a>
                <a
                  href={`tel:${selectedQuery.phone}`}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg"
                >
                  Call
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminContactComponent;
