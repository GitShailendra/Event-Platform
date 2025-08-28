import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Add this import

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth(); // Get user and logout from AuthContext

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navLinks = [
    { name: 'Browse Events', path: '/events', icon: '🎪' },
    { name: 'About', path: '/about', icon: '📖' },
    { name: 'Contact', path: '/contact', icon: '📞' }
  ];

  // Get user's dashboard route based on their role
  const getDashboardRoute = () => {
    if (!user) return '/dashboard';
    return user.role === 'organizer' ? '/organizer/dashboard' : '/user/dashboard';
  };

  // Get user's display name
  const getUserDisplayName = () => {
    if (!user) return 'User';
    return user.username || user.firstName || user.name || 'User';
  };

  // Get user's initials for avatar
  const getUserInitials = () => {
    if (!user) return 'U';
    const name = getUserDisplayName();
    return name.charAt(0).toUpperCase();
  };

  return (
    <nav className="gradient-bg-soft border-b border-gray-700 sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 gradient-bg rounded-lg flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform duration-200">
                E
              </div>
              <span className="text-2xl font-bold text-gradient hover-glow">
                EventHub
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 hover-lift ${
                  isActive(link.path)
                    ? 'text-white bg-gray-700 text-glow'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                <span className="text-sm">{link.icon}</span>
                <span>{link.name}</span>
              </Link>
            ))}
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                {/* User Info */}
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 gradient-bg rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {getUserInitials()}
                  </div>
                  <span className="text-white font-medium">
                    Hello, {getUserDisplayName()}
                  </span>
                </div>

                {/* Dashboard Button */}
                <Link to={getDashboardRoute()} className="btn btn-primary btn-sm">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                  </svg>
                  Dashboard
                </Link>

                {/* Logout Button */}
                <button 
                  onClick={handleLogout}
                  className="btn btn-secondary btn-sm flex items-center space-x-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              /* Guest User - Show Login/Signup */
              <div className="flex items-center space-x-3">
                <Link to="/login" className="text-gray-300 hover:text-white font-medium transition-colors">
                  Sign In
                </Link>
                <Link to="/signup" className="btn btn-primary btn-sm">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 z-50 relative"
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Full Screen Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black bg-opacity-95 animate-fade-in">
          <div className="flex flex-col h-full">
            {/* Mobile Header with Logo and Close */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <Link to="/" className="flex items-center space-x-3 group" onClick={() => setIsMenuOpen(false)}>
                <div className="w-10 h-10 gradient-bg rounded-lg flex items-center justify-center text-white font-bold text-lg">
                  E
                </div>
                <span className="text-2xl font-bold text-gradient">
                  EventHub
                </span>
              </Link>
              
              <button
                onClick={toggleMenu}
                className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Mobile Navigation Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                {/* User Info Section */}
                {user && (
                  <div className="flex items-center space-x-4 p-4 bg-gray-800 rounded-xl border border-gray-700 animate-slide-up">
                    <div className="w-12 h-12 gradient-bg rounded-full flex items-center justify-center text-white text-lg font-medium">
                      {getUserInitials()}
                    </div>
                    <div>
                      <p className="text-white font-semibold text-lg">
                        {getUserDisplayName()}
                      </p>
                      <p className="text-gray-400 text-sm capitalize">
                        {user.role || 'User'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Mobile Navigation Links */}
                <div className="space-y-2">
                  <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-4">
                    Navigation
                  </h3>
                  {navLinks.map((link, index) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center space-x-4 px-4 py-4 rounded-xl font-medium transition-all duration-200 animate-slide-up ${
                        isActive(link.path)
                          ? 'text-white bg-gray-700 text-glow border border-blue-500/30'
                          : 'text-gray-300 hover:text-white hover:bg-gray-800'
                      }`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <span className="text-2xl">{link.icon}</span>
                      <span className="text-lg">{link.name}</span>
                    </Link>
                  ))}
                </div>

                {/* Mobile Action Buttons */}
                <div className="space-y-3">
                  <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-4">
                    Actions
                  </h3>
                  
                  {user ? (
                    <div className="space-y-3">
                      <Link 
                        to={getDashboardRoute()} 
                        onClick={() => setIsMenuOpen(false)}
                        className="btn btn-primary w-full flex items-center justify-center space-x-3 py-4 text-lg animate-slide-up"
                        style={{ animationDelay: '0.4s' }}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                        </svg>
                        <span>Dashboard</span>
                      </Link>

                      <button 
                        onClick={handleLogout}
                        className="btn btn-secondary w-full flex items-center justify-center space-x-3 py-4 text-lg text-red-400 border-red-400 hover:bg-red-400 hover:text-white animate-slide-up"
                        style={{ animationDelay: '0.5s' }}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Logout</span>
                      </button>
                    </div>
                  ) : (
                    /* Mobile Guest User - Show Login/Signup */
                    <div className="space-y-3">
                      <Link 
                        to="/login"
                        onClick={() => setIsMenuOpen(false)}
                        className="btn btn-secondary w-full flex items-center justify-center space-x-3 py-4 text-lg animate-slide-up"
                        style={{ animationDelay: '0.4s' }}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Sign In</span>
                      </Link>
                      <Link 
                        to="/signup"
                        onClick={() => setIsMenuOpen(false)}
                        className="btn btn-primary w-full flex items-center justify-center space-x-3 py-4 text-lg animate-slide-up"
                        style={{ animationDelay: '0.5s' }}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                        <span>Sign Up</span>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Footer */}
            <div className="p-6 border-t border-gray-700">
              <p className="text-center text-gray-400 text-sm">
                © 2025 EventHub. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
