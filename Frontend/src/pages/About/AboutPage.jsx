import React from 'react';

const AboutPage = () => {
  const features = [
    {
      icon: '🎪',
      title: 'Diverse Events',
      description: 'From concerts and workshops to webinars and community meetups, discover events that match your interests.'
    },
    {
      icon: '🚀',
      title: 'Easy Organization',
      description: 'Create and manage events with our intuitive tools. Handle bookings, payments, and communications seamlessly.'
    },
    {
      icon: '💳',
      title: 'Secure Payments',
      description: 'Integrated with Stripe and Razorpay for safe, secure, and fast payment processing worldwide.'
    },
    {
      icon: '💬',
      title: 'Real-Time Chat',
      description: 'Connect with event organizers and attendees through our built-in messaging system.'
    },
    {
      icon: '📊',
      title: 'Analytics Dashboard',
      description: 'Track your events performance with detailed insights, attendance reports, and revenue analytics.'
    },
    {
      icon: '📱',
      title: 'Mobile Responsive',
      description: 'Access EventHub from any device with our fully responsive design and mobile-optimized experience.'
    }
  ];

  const teamMembers = [
    {
      name: 'Sarah Johnson',
      role: 'CEO & Founder',
      image: null,
      bio: 'Passionate about connecting people through amazing experiences.',
      social: { twitter: '#', linkedin: '#' }
    },
    {
      name: 'Michael Chen',
      role: 'CTO',
      image: null,
      bio: 'Building scalable technology solutions for the events industry.',
      social: { twitter: '#', linkedin: '#' }
    },
    {
      name: 'Emma Rodriguez',
      role: 'Head of Design',
      image: null,
      bio: 'Creating beautiful, user-centered experiences that delight.',
      social: { twitter: '#', linkedin: '#' }
    },
    {
      name: 'David Thompson',
      role: 'Head of Marketing',
      image: null,
      bio: 'Spreading the word about amazing events happening everywhere.',
      social: { twitter: '#', linkedin: '#' }
    }
  ];

  const stats = [
    { number: '50K+', label: 'Events Created', icon: '📅' },
    { number: '500K+', label: 'Happy Users', icon: '👥' },
    { number: '2M+', label: 'Tickets Sold', icon: '🎫' },
    { number: '100+', label: 'Cities Covered', icon: '🌍' }
  ];

  const values = [
    {
      title: 'Innovation',
      description: 'We continuously push boundaries to create cutting-edge solutions that transform the events industry.',
      icon: '💡',
      color: 'from-blue-600 to-purple-600'
    },
    {
      title: 'Community',
      description: 'We believe in the power of bringing people together and fostering meaningful connections through events.',
      icon: '🤝',
      color: 'from-purple-600 to-pink-600'
    },
    {
      title: 'Excellence',
      description: 'We strive for perfection in every detail, ensuring our platform delivers exceptional experiences.',
      icon: '⭐',
      color: 'from-pink-600 to-blue-600'
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 bg-gray-900">
        <div className="absolute inset-0 gradient-bg opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              About <span className="text-blue-500 animate-float">EventHub</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed animate-slide-up">
              We're on a mission to make event discovery and organization simple, enjoyable, and accessible to everyone. 
              Join millions of people creating unforgettable experiences worldwide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-scale-in">
              <button className="btn-primary text-lg px-8 py-4">
                Start Your Journey
              </button>
              <button className="btn-secondary text-lg px-8 py-4">
                Watch Our Story
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 lg:py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="animate-slide-up order-2 lg:order-1">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Our <span className="text-blue-500">Mission</span>
              </h2>
              <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                EventHub was born from a simple belief: that great events shouldn't be hard to find or organize. 
                We've built a platform that bridges the gap between event creators and attendees, making it easier 
                than ever to discover, share, and participate in meaningful experiences.
              </p>
              <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                Whether you're looking to attend a local workshop, organize a community meetup, or host a large-scale 
                conference, EventHub provides the tools and community to make it happen.
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full gradient-bg border-2 border-gray-800 flex items-center justify-center text-white font-semibold text-sm"
                    >
                      {i}
                    </div>
                  ))}
                </div>
                <span className="text-gray-300 font-medium">Trusted by event organizers worldwide</span>
              </div>
            </div>
            <div className="animate-slide-up order-1 lg:order-2">
              <div className="relative">
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 lg:p-8 transform hover:scale-105 transition-transform duration-300 shadow-medium">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                    <span className="text-2xl mr-3">🚀</span>
                    Platform Highlights
                  </h3>
                  <ul className="space-y-4 text-gray-300">
                    {[
                      'Real-time event discovery',
                      'Integrated payment processing',
                      'Advanced analytics dashboard',
                      '24/7 customer support',
                      'Mobile-first design',
                      'Global reach & accessibility'
                    ].map((feature, index) => (
                      <li key={index} className="flex items-center animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                        <span className="text-green-400 mr-3 text-lg">✓</span>
                        <span className="font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 lg:py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 animate-slide-up">
              EventHub by the <span className="text-blue-500">Numbers</span>
            </h2>
            <p className="text-xl text-gray-300 animate-slide-up">
              Join a growing community of event enthusiasts
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="bg-gray-800 border border-gray-700 rounded-xl p-6 lg:p-8 text-center hover:scale-105 transition-all duration-300 animate-scale-in shadow-medium"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-4xl lg:text-5xl mb-3 animate-float" style={{ animationDelay: `${index * 0.2}s` }}>
                  {stat.icon}
                </div>
                <div className="text-2xl lg:text-3xl font-bold text-blue-500 mb-2">{stat.number}</div>
                <div className="text-gray-300 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 animate-slide-up">
              Why Choose <span className="text-blue-500">EventHub?</span>
            </h2>
            <p className="text-xl text-gray-300 animate-slide-up">
              Everything you need to create, discover, and manage exceptional events
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="bg-gray-800 border border-gray-700 rounded-xl p-6 lg:p-8 group hover:scale-105 transition-all duration-300 animate-scale-in shadow-medium"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-4xl lg:text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 lg:py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 animate-slide-up">
              Meet Our <span className="text-blue-500">Team</span>
            </h2>
            <p className="text-xl text-gray-300 animate-slide-up">
              The passionate people behind EventHub's success
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {teamMembers.map((member, index) => (
              <div
                key={member.name}
                className="bg-gray-800 border border-gray-700 rounded-xl group hover:scale-105 transition-all duration-300 animate-scale-in overflow-hidden shadow-medium"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative h-48 lg:h-56 gradient-bg flex items-center justify-center">
                  {member.image ? (
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gray-700 rounded-full flex items-center justify-center text-2xl lg:text-3xl text-white font-bold">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-lg lg:text-xl font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">
                    {member.name}
                  </h3>
                  <p className="text-blue-400 font-medium mb-3 text-sm lg:text-base">{member.role}</p>
                  <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                    {member.bio}
                  </p>
                  <div className="flex space-x-3">
                    <a
                      href={member.social.twitter}
                      className="p-2 rounded-lg bg-gray-700 text-gray-300 hover:text-white hover:bg-gray-600 transition-all duration-200"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                    </a>
                    <a
                      href={member.social.linkedin}
                      className="p-2 rounded-lg bg-gray-700 text-gray-300 hover:text-white hover:bg-gray-600 transition-all duration-200"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 lg:py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 animate-slide-up">
              Our <span className="text-blue-500">Values</span>
            </h2>
            <p className="text-xl text-gray-300 animate-slide-up">
              The principles that guide everything we do
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {values.map((value, index) => (
              <div
                key={value.title}
                className="relative bg-gray-800 border border-gray-700 rounded-xl p-6 lg:p-8 overflow-hidden group hover:scale-105 transition-all duration-300 animate-scale-in shadow-medium"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${value.color} opacity-10 group-hover:opacity-20 transition-opacity duration-300`}></div>
                <div className="relative">
                  <div className="text-4xl lg:text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {value.icon}
                  </div>
                  <h3 className="text-xl lg:text-2xl font-bold text-white mb-4 group-hover:text-blue-400 transition-colors">
                    {value.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-20 gradient-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Create Amazing Events?
            </h2>
            <p className="text-lg lg:text-xl text-blue-100 mb-8 leading-relaxed max-w-2xl mx-auto">
              Join thousands of event organizers who trust EventHub to bring their ideas to life. 
              Start your journey today and see the difference we can make.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 hover:bg-gray-100 font-semibold py-4 px-8 rounded-lg text-lg transition-all duration-200 hover:scale-105">
                Get Started Free
              </button>
              <button className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold py-4 px-8 rounded-lg text-lg transition-all duration-200 hover:scale-105">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
