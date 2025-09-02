import React, { useState } from 'react';
import {contactAPI} from '../../api'
const ContactPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    category: 'General Inquiry'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    try {
       e.preventDefault();
       setIsSubmitting(true);
       const response = await contactAPI.submitContactForm(formData);
       console.log('Contact form submitted successfully:', response);
       setFormData({
        fullName: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        category: 'General Inquiry'
       })
       setIsSubmitting(false);
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setIsSubmitting(false);

    }
   
    
  };

  const contactInfo = [
    {
      icon: '📍',
      title: 'Visit Us',
      details: ['123 EventHub Street', 'Tech District, Mumbai 400001', 'Maharashtra, India'],
      color: 'text-green-400'
    },
    {
      icon: '📞',
      title: 'Call Us',
      details: ['+91 98765 43210', '+91 87654 32109', 'Mon-Fri: 9AM-6PM IST'],
      color: 'text-blue-400'
    },
    {
      icon: '📧',
      title: 'Email Us',
      details: ['hello@eventhub.com', 'support@eventhub.com', 'press@eventhub.com'],
      color: 'text-purple-400'
    },
    {
      icon: '💬',
      title: 'Live Chat',
      details: ['24/7 Support Available', 'Average response: 2 minutes', 'Available in 5 languages'],
      color: 'text-orange-400'
    }
  ];

  const socialLinks = [
    { name: 'Facebook', icon: '📘', url: '#', color: 'hover:text-blue-400' },
    { name: 'Twitter', icon: '🐦', url: '#', color: 'hover:text-sky-400' },
    { name: 'LinkedIn', icon: '💼', url: '#', color: 'hover:text-blue-600' },
    { name: 'Instagram', icon: '📷', url: '#', color: 'hover:text-pink-400' },
    { name: 'YouTube', icon: '📺', url: '#', color: 'hover:text-red-400' },
    { name: 'Discord', icon: '🎮', url: '#', color: 'hover:text-indigo-400' }
  ];

  const faqs = [
    {
      question: 'How do I create an event on EventHub?',
      answer: 'Simply sign up for an account, click "Create Event" and follow our step-by-step wizard to set up your event details, pricing, and promotion.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, debit cards, UPI, net banking, and digital wallets through our secure payment partners Stripe and Razorpay.'
    },
    {
      question: 'Can I get a refund for my ticket?',
      answer: 'Refund policies depend on the event organizer. Most events offer refunds up to 48 hours before the event. Check the specific event page for details.'
    },
    {
      question: 'How do I promote my event?',
      answer: 'EventHub provides built-in promotion tools including social media sharing, email marketing, early bird discounts, and featured event placement options.'
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative py-16 lg:py-20 bg-gray-900">
        <div className="absolute inset-0 gradient-bg opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Contact <span className="text-blue-500 animate-float">Us</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed animate-slide-up">
              Have questions about EventHub? We're here to help! Reach out to our friendly team for support, 
              partnerships, or just to say hello.
            </p>
            
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {contactInfo.map((info, index) => (
              <div
                key={info.title}
                className="bg-gray-800 border border-gray-700 rounded-xl p-6 text-center hover:scale-105 transition-all duration-300 animate-scale-in shadow-medium"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`text-4xl mb-4 ${info.color}`}>
                  {info.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{info.title}</h3>
                <div className="space-y-2">
                  {info.details.map((detail, idx) => (
                    <p key={idx} className="text-gray-300 text-sm leading-relaxed">
                      {detail}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Contact Form Section */}
      <section className="py-16 lg:py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="animate-slide-up">
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 shadow-medium">
                <h2 className="text-3xl font-bold text-white mb-2">
                  Send us a <span className="text-blue-500">Message</span>
                </h2>
                <p className="text-gray-300 mb-8">
                  Fill out the form below and we'll get back to you within 24 hours.
                </p>

                {isSubmitted && (
                  <div className="bg-green-900 border border-green-700 rounded-lg p-4 mb-6 animate-scale-in">
                    <div className="flex items-center">
                      <span className="text-green-400 text-xl mr-3">✅</span>
                      <div>
                        <h3 className="text-green-300 font-medium">Message Sent Successfully!</h3>
                        <p className="text-green-200 text-sm">We'll get back to you soon.</p>
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name and Email Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                        className="w-full py-3 px-4 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors focus:ring-2 focus:ring-blue-500/20"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full py-3 px-4 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors focus:ring-2 focus:ring-blue-500/20"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  {/* Phone and Category Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full py-3 px-4 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors focus:ring-2 focus:ring-blue-500/20"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
                        Category
                      </label>
                      <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full py-3 px-4 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none transition-colors focus:ring-2 focus:ring-blue-500/20"
                      >
                        <option value="General Inquiry" className="bg-gray-700">General Inquiry</option>
                        <option value="Technical Support" className="bg-gray-700">Technical Support</option>
                        <option value="Partnership" className="bg-gray-700">Partnership</option>
                        <option value="Press & Media" className="bg-gray-700">Press & Media</option>
                        <option value="Billing" className="bg-gray-700">Billing</option>
                        <option value="Other" className="bg-gray-700">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full py-3 px-4 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors focus:ring-2 focus:ring-blue-500/20"
                      placeholder="How can we help you?"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows="5"
                      className="w-full py-3 px-4 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors resize-none focus:ring-2 focus:ring-blue-500/20"
                      placeholder="Tell us more about your inquiry..."
                    ></textarea>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full btn-primary text-lg py-4 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending Message...
                      </>
                    ) : (
                      <>
                        Send Message
                        <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Right Side - Additional Info */}
            <div className="animate-slide-up space-y-8">
              {/* Office Hours */}
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-medium">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <span className="text-2xl mr-3">⏰</span>
                  Office Hours
                </h3>
                <div className="space-y-3">
                  {[
                    { days: 'Monday - Friday', hours: '9:00 AM - 6:00 PM IST' },
                    { days: 'Saturday', hours: '10:00 AM - 4:00 PM IST' },
                    { days: 'Sunday', hours: 'Closed' },
                    { days: 'Public Holidays', hours: 'Limited Support' }
                  ].map((schedule, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-700 last:border-0">
                      <span className="text-gray-300 font-medium">{schedule.days}</span>
                      <span className="text-white">{schedule.hours}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social Media */}
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-medium">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <span className="text-2xl mr-3">🌐</span>
                  Follow Us
                </h3>
                <p className="text-gray-300 mb-6">
                  Stay updated with the latest news and events on our social media channels.
                </p>
                <div className="grid grid-cols-3 gap-4">
                  {socialLinks.map((social, index) => (
                    <a
                      key={social.name}
                      href={social.url}
                      className={`bg-gray-700 p-4 rounded-lg text-center transition-all duration-200 hover:scale-105 ${social.color}`}
                    >
                      <div className="text-2xl mb-2">{social.icon}</div>
                      <span className="text-xs text-gray-300">{social.name}</span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Response Time */}
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-medium">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <span className="text-2xl mr-3">⚡</span>
                  Response Times
                </h3>
                <div className="space-y-4">
                  {[
                    { type: 'Live Chat', time: '< 2 minutes', color: 'text-green-400' },
                    { type: 'Email Support', time: '< 4 hours', color: 'text-blue-400' },
                    { type: 'General Inquiries', time: '< 24 hours', color: 'text-yellow-400' },
                    { type: 'Technical Issues', time: '< 1 hour', color: 'text-red-400' }
                  ].map((response, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-gray-300">{response.type}</span>
                      <span className={`font-semibold ${response.color}`}>{response.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 lg:py-20 bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 animate-slide-up">
              Frequently Asked <span className="text-blue-500">Questions</span>
            </h2>
            <p className="text-xl text-gray-300 animate-slide-up">
              Find quick answers to common questions about EventHub
            </p>
          </div>
          
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-gray-800 border border-gray-700 rounded-xl p-6 animate-scale-in shadow-medium"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <h3 className="text-lg font-bold text-white mb-3 flex items-start">
                  <span className="text-blue-500 mr-3 mt-1">Q.</span>
                  {faq.question}
                </h3>
                <p className="text-gray-300 leading-relaxed ml-8">
                  <span className="text-green-400 mr-2">A.</span>
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
          
          
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
