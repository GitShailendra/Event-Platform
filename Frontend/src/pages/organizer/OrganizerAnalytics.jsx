import React, { useState, useEffect } from 'react';
import { analyticsAPI, analyticsUtils, analyticsErrorHandler } from '../../api';
import { useNavigate } from 'react-router-dom';

const OrganizerAnalytics = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [audienceData, setAudienceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  // Fetch analytics data
  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedPeriod]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [dashboardRes, revenueRes, audienceRes] = await Promise.all([
        analyticsAPI.getOrganizerAnalytics(selectedPeriod),
        analyticsAPI.getRevenueAnalytics(selectedPeriod === '7d' || selectedPeriod === '30d' ? selectedPeriod : '12m'),
        analyticsAPI.getAudienceAnalytics()
      ]);

      setAnalyticsData(dashboardRes.data);
      setRevenueData(revenueRes.data);
      setAudienceData(audienceRes.data);
    } catch (err) {
      setError(analyticsErrorHandler(err, 'dashboard'));
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    fetchAnalyticsData();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const periodOptions = [
    { key: '7d', label: '7 Days' },
    { key: '30d', label: '30 Days' },
    { key: '90d', label: '90 Days' },
    { key: '1y', label: '1 Year' }
  ];

  const tabButtons = [
    { key: 'overview', label: 'Overview', icon: '📊' },
    { key: 'revenue', label: 'Revenue', icon: '💰' },
    { key: 'events', label: 'Events', icon: '🎪' },
    { key: 'audience', label: 'Audience', icon: '👥' }
  ];

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-400">Loading analytics...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📈</div>
          <h2 className="text-2xl font-bold text-white mb-2">Error Loading Analytics</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button onClick={handleRetry} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { overview, eventStats, bookingStats, topEvents, categoryStats, monthlyRevenue } = analyticsData || {};

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
          <p className="text-gray-400 mt-1">Track your event performance and insights</p>
        </div>
        
        {/* Period Selector */}
        <div className="flex space-x-2">
          {periodOptions.map(period => (
            <button
              key={period.key}
              onClick={() => setSelectedPeriod(period.key)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                selectedPeriod === period.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-700'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-3">
        {tabButtons.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              activeTab === tab.key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-700'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Total Revenue',
                value: formatCurrency(overview?.totalRevenue || 0),
                icon: '💰',
                color: 'from-green-500 to-emerald-600',
                change: '+12.5%'
              },
              {
                title: 'Total Events',
                value: formatNumber(overview?.totalEvents || 0),
                icon: '🎪',
                color: 'from-blue-500 to-cyan-600',
                change: '+8.2%'
              },
              {
                title: 'Total Bookings',
                value: formatNumber(bookingStats?.totalBookings || 0),
                icon: '🎫',
                color: 'from-purple-500 to-violet-600',
                change: '+15.3%'
              },
              {
                title: 'Occupancy Rate',
                value: `${overview?.occupancyRate || 0}%`,
                icon: '📊',
                color: 'from-orange-500 to-red-600',
                change: '+4.1%'
              }
            ].map((metric, index) => (
              <div
                key={metric.title}
                className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:scale-102 transition-all duration-300 animate-scale-in group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${metric.color} mb-4 group-hover:scale-110 transition-transform`}>
                  <span className="text-xl text-white">{metric.icon}</span>
                </div>
                <div>
                  <p className="text-gray-400 text-sm font-medium">{metric.title}</p>
                  <p className="text-2xl font-bold text-white mt-1">{metric.value}</p>
                  <div className="flex items-center mt-2">
                    <span className="text-green-400 text-sm font-medium">{metric.change}</span>
                    <span className="text-gray-500 text-sm ml-1">vs last period</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Top Events */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <span className="mr-2">🏆</span>
              Top Performing Events
            </h3>
            <div className="space-y-3">
              {topEvents?.slice(0, 5).map((event, index) => (
                <div
                  key={event._id}
                  className="flex items-center justify-between p-4 bg-gray-900 rounded-lg hover:bg-gray-700 transition-colors"
                  onClick={() => navigate(`/organizer/analytics/${event._id}`)} 
                >
                  
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-white font-medium">{event.title}</p>
                      <p className="text-gray-400 text-sm">{event.category} • {new Date(event.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">{formatCurrency(event.totalEarnings)}</p>
                    <p className="text-gray-400 text-sm">{event.occupancyRate?.toFixed(1)}% filled</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Revenue Tab */}
      {activeTab === 'revenue' && (
        <div className="space-y-6">
          {/* Revenue Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Total Revenue',
                value: formatCurrency(overview?.totalRevenue || 0),
                subtitle: 'All time earnings',
                icon: '💰',
                color: 'from-green-500 to-emerald-600'
              },
              {
                title: 'Average Per Event',
                value: formatCurrency(overview?.avgRevenuePerEvent || 0),
                subtitle: 'Revenue per event',
                icon: '📈',
                color: 'from-blue-500 to-cyan-600'
              },
              {
                title: 'This Month',
                value: formatCurrency(monthlyRevenue?.[0]?.revenue || 0),
                subtitle: `${monthlyRevenue?.[0]?.bookings || 0} bookings`,
                icon: '📊',
                color: 'from-purple-500 to-violet-600'
              }
            ].map((card, index) => (
              <div
                key={card.title}
                className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:scale-102 transition-all duration-300 animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${card.color} mb-4`}>
                  <span className="text-xl text-white">{card.icon}</span>
                </div>
                <h3 className="text-lg font-semibold text-white">{card.title}</h3>
                <p className="text-2xl font-bold text-white mt-2">{card.value}</p>
                <p className="text-gray-400 text-sm mt-1">{card.subtitle}</p>
              </div>
            ))}
          </div>

          {/* Monthly Revenue Chart Placeholder */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <span className="mr-2">📈</span>
              Revenue Trend
            </h3>
            <div className="h-64 flex items-center justify-center bg-gray-900 rounded-lg">
              <div className="text-center">
                <div className="text-4xl mb-2">📊</div>
                <p className="text-gray-400">Chart component would go here</p>
                <p className="text-gray-500 text-sm">Integration with Chart.js or Recharts</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Events Tab */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          {/* Event Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {eventStats?.map((stat, index) => {
              const statusColors = {
                active: 'from-green-500 to-emerald-600',
                completed: 'from-gray-500 to-gray-600',
                cancelled: 'from-red-500 to-red-600',
                draft: 'from-yellow-500 to-orange-600'
              };
              
              return (
                <div
                  key={stat._id}
                  className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:scale-102 transition-all duration-300 animate-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${statusColors[stat._id] || statusColors.draft} mb-4`}>
                    <span className="text-xl text-white">🎪</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white capitalize">{stat._id} Events</h3>
                  <p className="text-2xl font-bold text-white mt-2">{stat.count}</p>
                  <p className="text-gray-400 text-sm mt-1">{formatCurrency(stat.totalRevenue)} earned</p>
                </div>
              );
            })}
          </div>

          {/* Category Performance */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <span className="mr-2">📊</span>
              Category Performance
            </h3>
            <div className="space-y-3">
              {categoryStats?.map((category, index) => (
                <div
                  key={category._id}
                  className="flex items-center justify-between p-4 bg-gray-900 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-600 text-white">
                      <span className="text-lg">
                        {category._id === 'concert' ? '🎵' : 
                         category._id === 'workshop' ? '🛠️' : 
                         category._id === 'webinar' ? '💻' : '📅'}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium capitalize">{category._id}</p>
                      <p className="text-gray-400 text-sm">{category.eventCount} events</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">{formatCurrency(category.totalRevenue)}</p>
                    <p className="text-gray-400 text-sm">Avg: {formatCurrency(category.avgPrice)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Audience Tab */}
      {activeTab === 'audience' && (
        <div className="space-y-6">
          {/* Audience Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Total Attendees',
                value: formatNumber(audienceData?.totalUniqueAttendees || 0),
                subtitle: 'Unique customers',
                icon: '👥',
                color: 'from-blue-500 to-cyan-600'
              },
              {
                title: 'Repeat Customers',
                value: formatNumber(audienceData?.repeatCustomers || 0),
                subtitle: `${audienceData?.repeatRate || 0}% repeat rate`,
                icon: '🔄',
                color: 'from-green-500 to-emerald-600'
              },
              {
                title: 'Customer Lifetime',
                value: formatCurrency(audienceData?.topCustomers?.[0]?.totalSpent || 0),
                subtitle: 'Top customer spent',
                icon: '💎',
                color: 'from-purple-500 to-violet-600'
              }
            ].map((card, index) => (
              <div
                key={card.title}
                className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:scale-102 transition-all duration-300 animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${card.color} mb-4`}>
                  <span className="text-xl text-white">{card.icon}</span>
                </div>
                <h3 className="text-lg font-semibold text-white">{card.title}</h3>
                <p className="text-2xl font-bold text-white mt-2">{card.value}</p>
                <p className="text-gray-400 text-sm mt-1">{card.subtitle}</p>
              </div>
            ))}
          </div>

          {/* Top Customers */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <span className="mr-2">👑</span>
              Top Customers
            </h3>
            <div className="space-y-3">
              {audienceData?.topCustomers?.slice(0, 10).map((customer, index) => (
                <div
                  key={customer._id}
                  className="flex items-center justify-between p-4 bg-gray-900 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-white font-medium">{customer.name}</p>
                      <p className="text-gray-400 text-sm">{customer.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">{formatCurrency(customer.totalSpent)}</p>
                    <p className="text-gray-400 text-sm">{customer.totalBookings} bookings</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizerAnalytics;
