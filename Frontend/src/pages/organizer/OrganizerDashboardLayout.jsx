import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';

const OrganizerDashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Mock organizer data
  const organizer = {
    name: 'Alice Johnson',
    company: 'Tech Events Ltd.',
    avatar: null,
    location: 'Mumbai, India'
  };

  const sidebarItems = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊', path: '/organizer/dashboard' },
    { id: 'events', name: 'My Events', icon: '🎪', path: '/organizer/events' },
    { id: 'analytics', name: 'Analytics', icon: '📈', path: '/organizer/analytics' },
    { id: 'earnings', name: 'Earnings', icon: '💰', path: '/organizer/earnings' },
    { id: 'profile', name: 'Profile', icon: '👤', path: '/organizer/profile' }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-black flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 border-r border-gray-700 transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-700">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center text-white font-bold text-sm">
              E
            </div>
            <span className="text-xl font-bold text-white">EventHub</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Organizer Profile Section */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 gradient-bg rounded-full flex items-center justify-center text-white font-bold text-lg">
              {organizer.avatar ? (
                <img src={organizer.avatar} alt={organizer.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                organizer.name.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <h3 className="text-white font-semibold">{organizer.name}</h3>
              <p className="text-gray-400 text-sm">{organizer.company}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          <ul className="space-y-2">
            {sidebarItems.map((item) => (
              <li key={item.id}>
                <Link
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Quick Actions */}
        <div className="p-4 mt-auto">
          <Link
            to="/organizer/create-event"
            className="w-full btn-primary text-center py-3 mb-3 block"
          >
            Create Event
          </Link>
          <Link
            to="/help"
            className="w-full btn-secondary text-center py-3 block"
          >
            Help Center
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        {/* Mobile Header */}
        <div className="lg:hidden bg-gray-900 border-b border-gray-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-400 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold text-white">Organizer Dashboard</h1>
            <div></div>
          </div>
        </div>

        {/* Page Content - This renders the nested route components */}
        <div className="p-6">
          <Outlet />
        </div>
      </div>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default OrganizerDashboardLayout;
