import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = ({ user = null }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navLinks = [
    { name: 'Browse Events', path: '/events', icon: '🎪' },
    { name: 'About', path: '/about', icon: '📖' },
    { name: 'Contact', path: '/contact', icon: '📞' }
  ];

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

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 gradient-bg rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="text-white font-medium">
                    Hello, {user.name || 'User'}
                  </span>
                </div>
                <Link to="/dashboard" className="btn btn-primary btn-sm">
                  Dashboard
                </Link>
                <button className="btn btn-secondary btn-sm">
                  Logout
                </button>
              </div>
            ) : (
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
              className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
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

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden animate-slide-down">
            <div className="card mx-4 mb-4 p-4 border-t-0 rounded-t-none">
              {/* Mobile Navigation Links */}
              <div className="space-y-2 mb-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                      isActive(link.path)
                        ? 'text-white bg-gray-700 text-glow'
                        : 'text-gray-300 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <span>{link.icon}</span>
                    <span>{link.name}</span>
                  </Link>
                ))}
              </div>
              
              {/* Mobile Auth Section */}
              <div className="border-t border-gray-700 pt-4">
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 px-3 py-2">
                      <div className="w-8 h-8 gradient-bg rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <span className="text-white font-medium">
                        {user.name || 'User'}
                      </span>
                    </div>
                    <Link 
                      to="/dashboard" 
                      onClick={() => setIsMenuOpen(false)}
                      className="btn btn-primary w-full"
                    >
                      Dashboard
                    </Link>
                    <button className="btn btn-secondary w-full">
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link 
                      to="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="btn btn-secondary w-full"
                    >
                      Sign In
                    </Link>
                    <Link 
                      to="/signup"
                      onClick={() => setIsMenuOpen(false)}
                      className="btn btn-primary w-full"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
