import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const currentYear = new Date().getFullYear();

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  const footerSections = {
    quickLinks: [
      { name: 'Browse Events', path: '/events', icon: '🎪' },
      { name: 'Create Account', path: '/signup', icon: '👤' },
      { name: 'About Us', path: '/about', icon: '📖' },
      { name: 'How It Works', path: '/how-it-works', icon: '❓' }
    ],
    organizers: [
      { name: 'Create Event', path: '/create-event', icon: '➕' },
      { name: 'Manage Events', path: '/manage-events', icon: '⚙️' },
      { name: 'Pricing', path: '/pricing', icon: '💰' },
      { name: 'Resources', path: '/resources', icon: '📚' }
    ],
    support: [
      { name: 'Help Center', path: '/help', icon: '❓' },
      { name: 'Contact Us', path: '/contact', icon: '📞' },
      { name: 'Privacy Policy', path: '/privacy', icon: '🔒' },
      { name: 'Terms of Service', path: '/terms', icon: '📋' }
    ]
  };

  const socialLinks = [
    {
      name: 'Facebook',
      url: '#',
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      )
    },
    {
      name: 'Twitter',
      url: '#',
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>
      )
    },
    {
      name: 'LinkedIn',
      url: '#',
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286z"/>
        </svg>
      )
    },
    {
      name: 'Instagram',
      url: '#',
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.624 5.367 11.99 11.988 11.99s11.99-5.366 11.99-11.99C24.007 5.367 18.641.001 12.017.001zM8.449 16.988c-2.243 0-4.062-1.819-4.062-4.062s1.819-4.062 4.062-4.062 4.062 1.819 4.062 4.062-1.819 4.062-4.062 4.062zm7.519 0c-2.243 0-4.062-1.819-4.062-4.062s1.819-4.062 4.062-4.062 4.062 1.819 4.062 4.062-1.819 4.062-4.062 4.062z"/>
        </svg>
      )
    }
  ];

  return (
    <footer className="gradient-bg-soft border-t border-gray-700 mt-auto">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <div className="mb-6">
              <Link to="/" className="flex items-center space-x-3 mb-4 group">
                <div className="w-10 h-10 gradient-bg rounded-lg flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform duration-200">
                  E
                </div>
                <span className="text-2xl font-bold text-gradient">
                  EventHub
                </span>
              </Link>
              <p className="text-gray-300 mb-6 leading-relaxed">
                The premier platform for discovering and organizing amazing events. 
                Connect, learn, and grow with our vibrant community.
              </p>
            </div>
            
            {/* Social Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">Follow Us</h4>
              <div className="flex space-x-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    className="p-2 rounded-lg bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 hover-lift transition-all duration-200"
                    aria-label={social.name}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white">Quick Links</h4>
            <ul className="space-y-3">
              {footerSections.quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-200 group"
                  >
                    <span className="group-hover:scale-110 transition-transform duration-200">
                      {link.icon}
                    </span>
                    <span className="hover:underline">{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Organizers */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white">For Organizers</h4>
            <ul className="space-y-3">
              {footerSections.organizers.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-200 group"
                  >
                    <span className="group-hover:scale-110 transition-transform duration-200">
                      {link.icon}
                    </span>
                    <span className="hover:underline">{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white">Support</h4>
            <ul className="space-y-3">
              {footerSections.support.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-200 group"
                  >
                    <span className="group-hover:scale-110 transition-transform duration-200">
                      {link.icon}
                    </span>
                    <span className="hover:underline">{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Newsletter Subscription */}
      <div className="border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h4 className="text-lg font-semibold mb-2 text-white flex items-center">
                <span className="mr-2">📧</span>
                Stay Updated
              </h4>
              <p className="text-gray-300">Get the latest events and updates delivered to your inbox.</p>
            </div>
            <div className="flex-shrink-0">
              {subscribed ? (
                <div className="flex items-center space-x-2 text-green-400">
                  <span className="animate-scale-in">✓</span>
                  <span className="font-medium">Successfully subscribed!</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="input min-w-[250px]"
                  />
                  <button type="submit" className="btn btn-primary whitespace-nowrap">
                    Subscribe
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="md:flex md:items-center md:justify-between">
            <div className="text-center md:text-left">
              <p className="text-gray-400">
                &copy; {currentYear} EventHub. All rights reserved.
              </p>
            </div>
            <div className="mt-4 md:mt-0 text-center md:text-right">
              <p className="text-gray-400 text-sm flex items-center justify-center md:justify-end">
                Made with 
                <span className="text-red-500 mx-1 animate-float">❤️</span> 
                for event enthusiasts
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
