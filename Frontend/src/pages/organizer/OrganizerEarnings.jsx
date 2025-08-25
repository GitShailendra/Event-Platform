import React, { useState } from 'react';

const OrganizerEarnings = () => {
  const [timeFilter, setTimeFilter] = useState('thisMonth');

  // Mock earnings data
  const earningsData = {
    totalEarnings: 245000,
    thisMonthEarnings: 45000,
    pendingPayouts: 15000,
    totalTransactions: 89
  };

  const transactions = [
    {
      id: 'TXN-001',
      eventTitle: 'React Advanced Workshop',
      date: '2025-08-24',
      amount: 22500,
      attendees: 45,
      status: 'completed',
      payoutDate: '2025-08-31'
    },
    {
      id: 'TXN-002',
      eventTitle: 'AI Summit Conference',
      date: '2025-08-20',
      amount: 48000,
      attendees: 120,
      status: 'completed',
      payoutDate: '2025-08-27'
    },
    {
      id: 'TXN-003',
      eventTitle: 'JavaScript Bootcamp',
      date: '2025-08-15',
      amount: 17500,
      attendees: 35,
      status: 'pending',
      payoutDate: '2025-08-29'
    },
    {
      id: 'TXN-004',
      eventTitle: 'Startup Pitch Night',
      date: '2025-08-10',
      amount: 8000,
      attendees: 80,
      status: 'completed',
      payoutDate: '2025-08-17'
    },
    {
      id: 'TXN-005',
      eventTitle: 'Web Development Masterclass',
      date: '2025-08-05',
      amount: 32000,
      attendees: 64,
      status: 'completed',
      payoutDate: '2025-08-12'
    }
  ];

  const monthlyEarnings = [
    { month: 'Jan', earnings: 28000 },
    { month: 'Feb', earnings: 35000 },
    { month: 'Mar', earnings: 42000 },
    { month: 'Apr', earnings: 38000 },
    { month: 'May', earnings: 45000 },
    { month: 'Jun', earnings: 52000 },
    { month: 'Jul', earnings: 48000 },
    { month: 'Aug', earnings: 45000 }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      completed: { class: 'bg-green-900 text-green-300 border-green-700', label: 'Paid' },
      pending: { class: 'bg-yellow-900 text-yellow-300 border-yellow-700', label: 'Pending' },
      processing: { class: 'bg-blue-900 text-blue-300 border-blue-700', label: 'Processing' }
    };
    return badges[status] || badges.pending;
  };

  const filteredTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    const now = new Date();
    
    switch (timeFilter) {
      case 'thisWeek':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return transactionDate >= weekAgo;
      case 'thisMonth':
        return transactionDate.getMonth() === now.getMonth() && transactionDate.getFullYear() === now.getFullYear();
      case 'last3Months':
        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        return transactionDate >= threeMonthsAgo;
      default:
        return true;
    }
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Earnings & Payouts</h1>
          <p className="text-gray-400 mt-1">Track your event revenue and payments</p>
        </div>
        <div className="flex space-x-3">
          <button className="btn-secondary">
            <span className="mr-2">📊</span>
            Export Report
          </button>
          <button className="btn-primary">
            <span className="mr-2">💳</span>
            Payout Settings
          </button>
        </div>
      </div>

      {/* Earnings Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            label: 'Total Earnings', 
            value: formatCurrency(earningsData.totalEarnings), 
            icon: '💰', 
            color: 'green',
            change: '+12% from last month'
          },
          { 
            label: 'This Month', 
            value: formatCurrency(earningsData.thisMonthEarnings), 
            icon: '📈', 
            color: 'blue',
            change: '+8% from last month'
          },
          { 
            label: 'Pending Payouts', 
            value: formatCurrency(earningsData.pendingPayouts), 
            icon: '⏳', 
            color: 'yellow',
            change: 'Next payout: Aug 31'
          },
          { 
            label: 'Total Transactions', 
            value: earningsData.totalTransactions, 
            icon: '🧾', 
            color: 'purple',
            change: '5 this month'
          }
        ].map((stat, index) => (
          <div
            key={stat.label}
            className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:scale-105 transition-all duration-300 animate-scale-in"
            style={{ animationDelay: `${index * 0.1}s` }}
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

      {/* Monthly Earnings Chart (Simple Bar Representation) */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Monthly Earnings Trend</h2>
          <div className="text-sm text-gray-400">Last 8 months</div>
        </div>
        <div className="flex items-end justify-between space-x-2">
          {monthlyEarnings.map((data, index) => {
            const maxEarnings = Math.max(...monthlyEarnings.map(m => m.earnings));
            const height = (data.earnings / maxEarnings) * 100;
            
            return (
              <div key={data.month} className="flex flex-col items-center flex-1">
                <div className="w-full bg-gray-700 rounded-t relative" style={{ height: '120px' }}>
                  <div 
                    className="bg-blue-500 rounded-t w-full absolute bottom-0 transition-all duration-1000 ease-out"
                    style={{ 
                      height: `${height}%`,
                      animationDelay: `${index * 0.1}s`
                    }}
                  ></div>
                </div>
                <div className="mt-2 text-center">
                  <div className="text-xs text-gray-400">{data.month}</div>
                  <div className="text-xs text-green-400 font-semibold">{formatCurrency(data.earnings)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="text-xl font-bold text-white">Recent Transactions</h2>
            <div className="flex space-x-3">
              {[
                { key: 'thisWeek', label: 'This Week' },
                { key: 'thisMonth', label: 'This Month' },
                { key: 'last3Months', label: 'Last 3 Months' }
              ].map(filter => (
                <button
                  key={filter.key}
                  onClick={() => setTimeFilter(filter.key)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                    timeFilter === filter.key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Event</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Attendees</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Payout Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredTransactions.map(transaction => {
                const statusBadge = getStatusBadge(transaction.status);
                return (
                  <tr key={transaction.id} className="hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-white">{transaction.eventTitle}</div>
                        <div className="text-gray-400 text-sm">ID: {transaction.id}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {formatDate(transaction.date)}
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {transaction.attendees}
                    </td>
                    <td className="px-6 py-4 text-green-400 font-semibold">
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusBadge.class}`}>
                        {statusBadge.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {formatDate(transaction.payoutDate)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredTransactions.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4 animate-float">💰</div>
          <h2 className="text-2xl font-bold text-white mb-2">No Transactions Found</h2>
          <p className="text-gray-400 mb-6">
            No transactions found for the selected time period.
          </p>
          <button 
            onClick={() => setTimeFilter('last3Months')}
            className="btn-primary"
          >
            Show All Transactions
          </button>
        </div>
      )}
    </div>
  );
};

export default OrganizerEarnings;
