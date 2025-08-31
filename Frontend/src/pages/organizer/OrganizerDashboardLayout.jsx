import React, { useState } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Import useAuth hook

const OrganizerDashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // Get user and logout from context

  // Use actual user data from context with proper fallbacks
  const organizer = {
    name: user?.name || user?.firstName + ' ' + user?.lastName || 'Organizer',
    company: user?.company || user?.email || 'Tech Events Ltd.',
    avatar: user?.avatar || null,
    location: user?.location || 'Mumbai, India'
  };

  const sidebarItems = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊', path: '/organizer/dashboard' },
    { id: 'events', name: 'My Events', icon: '🎪', path: '/organizer/events' },
    { id: 'analytics', name: 'Analytics', icon: '📈', path: '/organizer/analytics' },
    { id: 'chat', name: 'Chat', icon: '💰', path: '/organizer/chat' },
    { id: 'profile', name: 'Profile', icon: '👤', path: '/organizer/profile' }
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    setSidebarOpen(false);
    navigate('/', { replace: true });
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  // Safe function to get initials
  const getInitials = (name) => {
    if (!name) return 'O'; // Default to 'O' for Organizer
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-black flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 border-r border-gray-700 transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        
        <div className="flex flex-col h-full">
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
                  getInitials(organizer.name)
                )}
              </div>
              <div>
                <h3 className="text-white font-semibold">{organizer.name}</h3>
                <p className="text-gray-400 text-sm">{organizer.company}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4 flex-1">
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

          {/* Quick Actions & Logout */}
          <div className="p-4 border-t border-gray-700">
            <Link
              to="/organizer/create-event"
              className="w-full btn-primary text-center py-3 mb-3 block"
            >
              Create Event
            </Link>
            <Link
              to="/help"
              className="w-full btn-secondary text-center py-3 mb-3 block"
            >
              Help Center
            </Link>
            
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-all duration-200 border border-red-800 hover:border-red-700"
            >
              <span className="text-lg">🚪</span>
              <span className="font-medium">Logout</span>
            </button>
          </div>
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
            
            {/* Mobile Logout Button */}
            <button
              onClick={handleLogout}
              className="text-red-400 hover:text-red-300 p-2"
              title="Logout"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1" />
              </svg>
            </button>
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

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-700">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-900/20 mb-4">
                <svg className="h-6 w-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">
                Confirm Logout
              </h3>
              <p className="text-sm text-gray-400 mb-6">
                Are you sure you want to logout? You'll need to sign in again to access your organizer dashboard.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={cancelLogout}
                  className="flex-1 btn-secondary py-2"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizerDashboardLayout;
