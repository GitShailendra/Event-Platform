// Updated OrganizerEarnings.js
import React, { useState, useEffect } from 'react';
import { organizerEarningsAPI } from '../../api';

const OrganizerEarnings = () => {
  const [timeFilter, setTimeFilter] = useState('thisMonth');
  const [earningsData, setEarningsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch real earnings data
  useEffect(() => {
    fetchEarningsData();
  }, [timeFilter]);

  const fetchEarningsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await organizerEarningsAPI.getEarningsOverview(timeFilter);
      console.log('Fetched earnings data:', response.data);
      setEarningsData(response.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch earnings data');
    } finally {
      setLoading(false);
    }
  };

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

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-400">Loading earnings data...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="text-center py-16">
          <div className="text-6xl mb-4">💰</div>
          <h2 className="text-2xl font-bold text-white mb-2">Error Loading Earnings</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button onClick={fetchEarningsData} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { 
    totalEarnings, 
    thisMonthEarnings, 
    pendingPayouts, 
    totalTransactions, 
    thisMonthTransactions, 
    transactions, 
    monthlyEarnings,
    earningsGrowth,
    summary
  } = earningsData;

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

      {/* Earnings Summary Cards - Using Real Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            label: 'Total Earnings', 
            value: formatCurrency(totalEarnings), 
            icon: '💰', 
            color: 'green',
            change: `${earningsGrowth >= 0 ? '+' : ''}${earningsGrowth}% from last month`
          },
          { 
            label: 'This Month', 
            value: formatCurrency(thisMonthEarnings), 
            icon: '📈', 
            color: 'blue',
            change: `${thisMonthTransactions} transactions`
          },
          { 
            label: 'Pending Payouts', 
            value: formatCurrency(pendingPayouts), 
            icon: '⏳', 
            color: 'yellow',
            change: `Next payout: ${formatDate(summary?.nextPayoutDate)}`
          },
          { 
            label: 'Total Transactions', 
            value: totalTransactions, 
            icon: '🧾', 
            color: 'purple',
            change: `${thisMonthTransactions} this month`
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

      {/* Monthly Earnings Chart - Using Real Data */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Monthly Earnings Trend</h2>
          <div className="text-sm text-gray-400">Last {monthlyEarnings?.length || 8} months</div>
        </div>
        <div className="flex items-end justify-between space-x-2">
          {monthlyEarnings?.map((data, index) => {
            const maxEarnings = Math.max(...monthlyEarnings.map(m => m.earnings));
            const height = maxEarnings > 0 ? (data.earnings / maxEarnings) * 100 : 0;
            
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

      {/* Transactions Table - Using Real Data */}
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
              {transactions?.map(transaction => {
                const statusBadge = getStatusBadge(transaction.status);
                return (
                  <tr key={transaction.id} className="hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-white">{transaction.eventTitle}</div>
                        <div className="text-gray-400 text-sm">ID: {transaction.id.slice(-8)}</div>
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
      {(!transactions || transactions.length === 0) && (
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
