import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const AdminDashboardOverview = () => {
  const [dashboardData, setDashboardData] = useState(
    {
     stats: {
          totalUsers: 12547,
          totalOrganizers: 342,
          pendingVerifications: 23,
          totalEvents: 1856,
          activeEvents: 89,
          totalRevenue: 2847500,
          thisMonthRevenue: 485600,
          thisMonthUsers: 1247,
          thisMonthEvents: 156
        },
        recentActivities: [
          { id: 1, type: 'user_signup', user: 'John Doe', action: 'signed up', time: '2 minutes ago' },
          { id: 2, type: 'event_created', user: 'Tech Events Ltd.', action: 'created new event', time: '15 minutes ago' },
          { id: 3, type: 'organizer_verified', user: 'Sarah Wilson', action: 'got verified', time: '1 hour ago' },
          { id: 4, type: 'event_published', user: 'Mumbai Meetups', action: 'published event', time: '2 hours ago' },
          { id: 5, type: 'payment_received', user: 'Concert Pro', action: 'received payment', time: '3 hours ago' }
        ],
        pendingOrganizers: [
          { id: 1, name: 'Alex Johnson', company: 'EventCorp', email: 'alex@eventcorp.com', submitted: '2024-01-15', documents: 3 },
          { id: 2, name: 'Maria Garcia', company: 'Summit Events', email: 'maria@summit.com', submitted: '2024-01-14', documents: 2 },
          { id: 3, name: 'David Kim', company: 'Digital Conferences', email: 'david@digital.com', submitted: '2024-01-13', documents: 4 }
        ],
        systemHealth: {
          serverStatus: 'healthy',
          databaseStatus: 'healthy',
          paymentGateway: 'healthy',
          emailService: 'warning',
          lastBackup: '2024-01-15 03:00 AM'
        } 
    }
  );
  const [loading, setLoading] = useState(false);
   
 
  // Dummy data - replace with API calls later
  useEffect(() => {
    console.log("Fetching admin dashboard data...");
    // Simulate loading
    setLoading(true);
    setTimeout(() => {
      setDashboardData({
        stats: {
          totalUsers: 12547,
          totalOrganizers: 342,
          pendingVerifications: 23,
          totalEvents: 1856,
          activeEvents: 89,
          totalRevenue: 2847500,
          thisMonthRevenue: 485600,
          thisMonthUsers: 1247,
          thisMonthEvents: 156
        },
        recentActivities: [
          { id: 1, type: 'user_signup', user: 'John Doe', action: 'signed up', time: '2 minutes ago' },
          { id: 2, type: 'event_created', user: 'Tech Events Ltd.', action: 'created new event', time: '15 minutes ago' },
          { id: 3, type: 'organizer_verified', user: 'Sarah Wilson', action: 'got verified', time: '1 hour ago' },
          { id: 4, type: 'event_published', user: 'Mumbai Meetups', action: 'published event', time: '2 hours ago' },
          { id: 5, type: 'payment_received', user: 'Concert Pro', action: 'received payment', time: '3 hours ago' }
        ],
        pendingOrganizers: [
          { id: 1, name: 'Alex Johnson', company: 'EventCorp', email: 'alex@eventcorp.com', submitted: '2024-01-15', documents: 3 },
          { id: 2, name: 'Maria Garcia', company: 'Summit Events', email: 'maria@summit.com', submitted: '2024-01-14', documents: 2 },
          { id: 3, name: 'David Kim', company: 'Digital Conferences', email: 'david@digital.com', submitted: '2024-01-13', documents: 4 }
        ],
        systemHealth: {
          serverStatus: 'healthy',
          databaseStatus: 'healthy',
          paymentGateway: 'healthy',
          emailService: 'warning',
          lastBackup: '2024-01-15 03:00 AM'
        }
      });
      setLoading(false);
    }, 1000);
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
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
      error: 'text-red-400'
    };
    return colors[status] || 'text-gray-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
        <span className="ml-3 text-gray-400">Loading admin dashboard...</span>
      </div>
    );
  }
  console.log(dashboardData);
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
        ].map((stat, index) => (
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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activities */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Recent Activities</h2>
            <Link to="/admin/activities" className="text-red-400 hover:text-red-300 text-sm">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {recentActivities.map(activity => (
              <div key={activity.id} className="flex items-center space-x-4 p-3 bg-gray-700 rounded-lg">
                <div className="text-2xl">{getActivityIcon(activity.type)}</div>
                <div className="flex-1">
                  <p className="text-white text-sm">
                    <span className="font-semibold">{activity.user}</span> {activity.action}
                  </p>
                  <p className="text-gray-400 text-xs">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
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
                    <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs">
                      Approve
                    </button>
                    <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs">
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
