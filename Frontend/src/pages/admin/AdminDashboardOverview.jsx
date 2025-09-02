import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../api'; 

const AdminDashboardOverview = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
  try {
    setLoading(true);
    const statsResponse = await adminAPI.getDashboardStats();
    const usersResponse = await adminAPI.getAllUsers();

    // Handle both array and object responses
    const users = Array.isArray(usersResponse) ? usersResponse : usersResponse.users || [];

    const pendingOrganizers = users.filter(
      user => !user.isOrganizer && user.role === 'user' && user.pendingVerification === true
    );

    setDashboardData({
      stats: {
        totalUsers: statsResponse.users || users.length,
        totalOrganizers: users.filter(u => u.role === 'organizer').length,
        pendingVerifications: pendingOrganizers.length,
        totalEvents: statsResponse.events || 0,
        activeEvents: 0, // Extend backend if needed
        totalRevenue: statsResponse.totalRevenue || 0,
        thisMonthRevenue: 0,
        thisMonthUsers: 0,
        thisMonthEvents: 0
      },
      recentActivities: [], // Optional: fetch if available
      pendingOrganizers: pendingOrganizers.map(org => ({
        id: org._id,
        name: `${org.firstName} ${org.lastName}`,
        company: org.company || 'N/A',
        email: org.email,
        submitted: org.createdAt ? new Date(org.createdAt).toLocaleDateString() : 'N/A',
        documents: 0 // Update if documents data is available
      })),
      systemHealth: {
        serverStatus: 'healthy',
        databaseStatus: 'healthy',
        paymentGateway: 'healthy',
        emailService: 'healthy',
        lastBackup: 'N/A',
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard data', error);
  } finally {
    setLoading(false);
  }
};


    fetchDashboardData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const getActivityIcon = (type) => {
    const icons = {
      user_signup: '👤',
      event_created: '🎪',
      organizer_verified: '✅',
      event_published: '📢',
      payment_received: '💰'
    };
    return icons[type] || '📝';
  };

  const getStatusColor = (status) => {
    const colors = {
      healthy: 'text-green-400',
      warning: 'text-yellow-400',
      error: 'text-red-400',
    };
    return colors[status] || 'text-gray-400';
  };

  const handleApprove = async (id) => {
    setProcessingId(id);
    try {
      await adminAPI.approveOrganizer(id);
      setDashboardData(prev => ({
        ...prev,
        pendingOrganizers: prev.pendingOrganizers.filter(org => org.id !== id),
        stats: {
          ...prev.stats,
          totalOrganizers: prev.stats.totalOrganizers + 1,
          pendingVerifications: prev.stats.pendingVerifications - 1,
        }
      }));
    } catch (error) {
      console.error('Approve failed:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id) => {
    setProcessingId(id);
    try {
      await adminAPI.rejectOrganizer(id);
      setDashboardData(prev => ({
        ...prev,
        pendingOrganizers: prev.pendingOrganizers.filter(org => org.id !== id),
        stats: {
          ...prev.stats,
          pendingVerifications: prev.stats.pendingVerifications - 1,
        }
      }));
    } catch (error) {
      console.error('Reject failed:', error);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading || !dashboardData) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
        <span className="ml-3 text-gray-400">Loading admin dashboard...</span>
      </div>
    );
  }

  const { stats, recentActivities, pendingOrganizers, systemHealth } = dashboardData;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Admin Dashboard 🛡️
            </h1>
            <p className="text-gray-400">
              Monitor and manage your EventHub platform
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <Link to="/admin/organizers" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              Verify Organizers
            </Link>
            <Link to="/admin/analytics" className="btn-secondary">
              View Reports
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Users', value: stats.totalUsers.toLocaleString(), icon: '👥', color: 'blue', change: `+${stats.thisMonthUsers} this month` },
          { label: 'Total Organizers', value: stats.totalOrganizers.toLocaleString(), icon: '👨‍💼', color: 'green', change: `${stats.pendingVerifications} pending verification` },
          { label: 'Total Events', value: stats.totalEvents.toLocaleString(), icon: '🎪', color: 'purple', change: `${stats.activeEvents} currently active` },
          { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), icon: '💰', color: 'yellow', change: `+${formatCurrency(stats.thisMonthRevenue)} this month` }
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:scale-105 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-3xl">{stat.icon}</div>
              <div className={`text-2xl font-bold text-${stat.color}-400`}>
                {stat.value}
              </div>
            </div>
            <div>
              <p className="text-gray-400 text-sm font-medium mb-1">{stat.label}</p>
              <p className="text-gray-500 text-xs">{stat.change}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pending Verifications */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Pending Verifications</h2>
          <Link to="/admin/organizers" className="text-red-400 hover:text-red-300 text-sm">
            Manage All
          </Link>
        </div>
        <div className="space-y-4">
          {pendingOrganizers.length === 0 && (
            <p className="text-gray-400 text-center">No pending organizer approvals.</p>
          )}
          {pendingOrganizers.map(organizer => (
            <div key={organizer.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
              <div>
                <h3 className="font-semibold text-white">{organizer.name}</h3>
                <p className="text-gray-400 text-sm">{organizer.company}</p>
                <p className="text-gray-500 text-xs">Submitted: {organizer.submitted}</p>
              </div>
              <div className="text-right">
                <p className="text-yellow-400 text-sm font-medium">{organizer.documents} docs</p>
                <div className="flex space-x-2 mt-2">
                  <button
                    onClick={() => handleApprove(organizer.id)}
                    disabled={processingId === organizer.id}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs"
                  >
                    {processingId === organizer.id ? 'Processing...' : 'Approve'}
                  </button>
                  <button
                    onClick={() => handleReject(organizer.id)}
                    disabled={processingId === organizer.id}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs"
                  >
                    {processingId === organizer.id ? 'Processing...' : 'Reject'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Health & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* System Health */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">System Health</h2>
          <div className="space-y-4">
            {[
              { label: 'Server Status', status: systemHealth.serverStatus },
              { label: 'Database', status: systemHealth.databaseStatus },
              { label: 'Payment Gateway', status: systemHealth.paymentGateway },
              { label: 'Email Service', status: systemHealth.emailService }
            ].map(service => (
              <div key={service.label} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <span className="text-gray-300">{service.label}</span>
                <span className={`font-medium capitalize ${getStatusColor(service.status)}`}>
                  {service.status}
                </span>
              </div>
            ))}
            <div className="pt-2 border-t border-gray-600">
              <p className="text-gray-400 text-sm">
                Last Backup: <span className="text-white">{systemHealth.lastBackup}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Verify Organizers', icon: '✅', path: '/admin/organizers', color: 'green' },
              { label: 'Manage Users', icon: '👥', path: '/admin/users', color: 'blue' },
              { label: 'Review Events', icon: '🎪', path: '/admin/events', color: 'purple' },
              { label: 'System Settings', icon: '⚙️', path: '/admin/settings', color: 'gray' }
            ].map(action => (
              <Link
                key={action.label}
                to={action.path}
                className={`flex flex-col items-center p-4 bg-gray-700 rounded-lg hover:bg-${action.color}-600/20 transition-colors text-center`}
              >
                <span className="text-3xl mb-2">{action.icon}</span>
                <span className="text-white text-sm font-medium">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardOverview;
