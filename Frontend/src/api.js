// src/api.js
import axios from 'axios';

const API_URL =  'https://event-platform-ktlv.onrender.com/api';

// Create axios instance with base configuration
const api = axios.create({  
  baseURL: API_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Log API calls in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor: Handle errors globally
api.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    }
    return response;
  },
  (error) => {
    if (!error.response) {
      // Network error or server not reachable
      console.error('Network Error:', error.message);
      return Promise.reject({
        status: 0,
        message: 'Network error. Please check your connection.',
      });
    }

    const { status, data } = error.response;

    // Handle different error statuses
    switch (status) {
      case 401:
        // Unauthorized: Clear token and redirect to login
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject({
          status,
          message: 'Session expired. Please login again.',
        });

      case 403:
        return Promise.reject({
          status,
          message: 'Access denied. You do not have permission.',
        });

      case 404:
        return Promise.reject({
          status,
          message: 'Resource not found.',
        });

      case 422:
        return Promise.reject({
          status,
          message: data?.message || 'Validation error.',
          errors: data?.errors || [],
        });

      case 500:
        return Promise.reject({
          status,
          message: 'Server error. Please try again later.',
        });

      default:
        return Promise.reject({
          status,
          message: data?.message || `Error ${status}: Something went wrong.`,
        });
    }
  }
);

// HTTP Methods Helper Functions

// GET request with optional query parameters
export const get = async (url, params = {}) => {
  try {
    const response = await api.get(url, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// POST request
export const post = async (url, data = {}, config = {}) => {
  try {
    const response = await api.post(url, data, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// PUT request (full update)
export const put = async (url, data = {}, config = {}) => {
  try {
    const response = await api.put(url, data, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// PATCH request (partial update)
export const patch = async (url, data = {}, config = {}) => {
  try {
    const response = await api.patch(url, data, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// DELETE request
export const del = async (url, config = {}) => {
  try {
    const response = await api.delete(url, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// File upload helper (for images with Cloudinary)
export const uploadFile = async (url, formData) => {
  try {
    const response = await api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ===========================================
// API ENDPOINTS - Organized by Feature
// ===========================================

// AUTH APIs
export const authAPI = {
  register: (data) => post('/users/register', data),
  login: (data) => post('/users/login', data),
  getProfile: () => get('/users/profile'),
  updateProfile: (data) => put('/users/profile', data),
  forgotPassword: (email) => post('/users/forgot-password', { email }),
  resetPassword: (token, password) => post('/users/reset-password', { token, password }),
  getCurrentProfile: () => get('/users/profile/current'),
  updateCurrentProfile: (data) => put('/users/profile/current', data),
  changePassword: (data) => post('/users/change-password', data),
  downloadUserData: () => {
    return api.get('/users/download-data', { responseType: 'blob' })
      .then(response => {
        // Create download link
        const blob = new Blob([response.data], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `my_data_${Date.now()}.json`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        return { success: true };
      });
  }
};

// Updated EVENT APIs with FormData support
export const eventAPI = {
  getAllEvents: (params = {}) => get('/events', params),
  getEventById: (id) => get(`/events/${id}`),
  
  // Updated to handle both JSON and FormData
  createEvent: (data) => {
    if (data instanceof FormData) {
      return post('/events', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }
    return post('/events', data);
  },
  
  // Updated to handle both JSON and FormData
  updateEvent: (id, data) => {
    if (data instanceof FormData) {
      return put(`/events/${id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }
    return put(`/events/${id}`, data);
  },
  
  deleteEvent: (id) => del(`/events/${id}`),
  getOrganizerEvents: () => get('/events/organizer/my-events'),
  searchEvents: (query) => get('/events', { search: query }),
  getEventsByCategory: (category) => get('/events', { category }),
};

// BOOKING APIs
export const bookingAPI = {
  createBooking: (data) => post('/bookings', data),
  createPaymentOrder: (data) => post('/bookings/create-order', data),
  verifyPayment: (data) => post('/bookings/verify-payment', data),
  handlePaymentFailure: (data) => post('/bookings/payment-failure', data),
  getUserBookings: (params = {}) => get('/bookings/my-bookings', params),
  getBookingById: (id) => get(`/bookings/${id}`),
  cancelBooking: (id) => patch(`/bookings/${id}/cancel`),
  getAllBookings: (params = {}) => get('/bookings', params),
  getEventAttendees: (eventId) => get(`/bookings/event/${eventId}/attendees`),

  downloadTicket: async (bookingId) => {
    try {
      const response = await api.get(`/bookings/${bookingId}/download-ticket`, {
        responseType: 'blob' // Important for file downloads
      });
      
      // Create download link
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Ticket_${bookingId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      throw error;
    }
  }
};


// PAYMENT APIs
export const paymentAPI = {
  createPaymentIntent: (amount, currency = 'usd') => 
    post('/payments/create-intent', { amount, currency }),
  confirmPayment: (bookingId, paymentMethodId) => 
    post('/payments/confirm', { bookingId, paymentMethodId }),
  processPayment: (data) => post('/bookings/payment', data),
};

// CHAT APIs (for real-time messaging)
export const chatAPI = {
  getConversations: async () => {
    try {
      const response = await get('/chat/conversations');
      return response;
    } catch (error) {
      console.error('Error in getConversations:', error);
      throw error;
    }
  },
  
  getMessages: async (conversationId, params = {}) => {
    try {
      const response = await get(`/chat/conversations/${conversationId}/messages`, params);
      return response;
    } catch (error) {
      console.error('Error in getMessages:', error);
      throw error;
    }
  },
  
  sendMessage: async (conversationId, data) => {
    try {
      const response = await post(`/chat/conversations/${conversationId}/messages`, data);
      return response;
    } catch (error) {
      console.error('Error in sendMessage:', error);
      throw error;
    }
  },
  
  startConversation: async (eventId) => {
    try {
      const response = await post('/chat/conversations/start', { eventId });
      return response;
    } catch (error) {
      console.error('Error in startConversation:', error);
      throw error;
    }
  },
  
  startOrganizerConversation: async (eventId, attendeeId) => {
    try {
      const response = await post('/chat/conversations/start-organizer', { eventId, attendeeId });
      return response;
    } catch (error) {
      console.error('Error in startOrganizerConversation:', error);
      throw error;
    }
  },
  
  markMessagesAsRead: async (conversationId) => {
    try {
      const response = await patch(`/chat/conversations/${conversationId}/read`);
      return response;
    } catch (error) {
      console.error('Error in markMessagesAsRead:', error);
      throw error;
    }
  }
};


// ADMIN APIs
export const adminAPI = {
  deleteUser: (id) => del(`/admin/users/${id}`),
  updateUserRole: (id, role) => patch(`/admin/users/${id}/role`, { role }),
  getDashboardStats: () => get('/admin/dashboard/stats'),
  getAllUsers: () => get('/admin/users'),
  blockUser: (id) => patch(`/admin/users/${id}/block`),
  unblockUser: (id) => patch(`/admin/users/${id}/unblock`),
  approveOrganizer: (id) => patch(`/admin/users/${id}/approve-organizer`),
  rejectOrganizer: (id) => patch(`/admin/users/${id}/reject-organizer`),
  getAllEvents: () => get('/admin/events'),
  getDashboardStats: () => get('/admin/dashboard/stats'),
  getAllUsers: (params = {}) => get('/admin/users', params),
  getAllContactQueries: (params = {}) => get('/admin/contact-queries', params),
};

// FILE UPLOAD APIs
export const uploadAPI = {
  uploadEventImage: (formData) => uploadFile('/upload/event-image', formData),
  uploadProfileImage: (formData) => uploadFile('/upload/profile-image', formData),
  uploadMultipleImages: (formData) => uploadFile('/upload/multiple', formData),
};
export const analyticsAPI = {
  // Get organizer dashboard analytics with optional period filter
  getOrganizerAnalytics: (period = '30d') => 
    get('/analytics/dashboard', { period }),

  // Get specific event analytics by event ID
  getEventAnalytics: (eventId) => 
    get(`/analytics/event/${eventId}`),

  // Get revenue analytics with optional period filter
  getRevenueAnalytics: (period = '12m') => 
    get('/analytics/revenue', { period }),

  // Get audience analytics and customer insights
  getAudienceAnalytics: () => 
    get('/analytics/audience'),

  // Additional analytics endpoints you might want to add
  getEventPerformanceComparison: (eventIds) => 
    get('/analytics/compare', { eventIds: eventIds.join(',') }),

  getCategoryAnalytics: () => 
    get('/analytics/categories'),

  getBookingTrends: (startDate, endDate) => 
    get('/analytics/booking-trends', { startDate, endDate }),

  // Real-time analytics (if you implement WebSocket updates)
  getLiveEventStats: (eventId) => 
    get(`/analytics/live/${eventId}`),

  // Export analytics data
  exportAnalyticsReport: (period = '30d', format = 'csv') => 
    get('/analytics/export', { period, format }, {
      responseType: 'blob', // For file downloads
    }),
};
// Add to your api.js file
export const organizerDashboardAPI = {
  getDashboardOverview: () => get('/organizer/dashboard/overview'),
};
// Add to your api.js file
export const organizerEarningsAPI = {
  getEarningsOverview: (timeFilter) => get('/organizer/earnings/overview', { timeFilter }),
};
// Add to your api.js file
export const userDashboardAPI = {
  getDashboardOverview: () => get('/user/dashboard/overview'),
  getUserStats: () => get('/user/dashboard/stats'),
};

// COntact APIs
export const contactAPI = {
  submitContactForm: (data) => post('/contact', data),
};
// ===========================================
// UTILITY FUNCTIONS
// ===========================================
export const analyticsUtils = {
  // Format revenue data for charts
  formatRevenueData: (revenueData) => {
    return revenueData.map(item => ({
      date: `${item._id.year}-${String(item._id.month).padStart(2, '0')}${item._id.day ? `-${String(item._id.day).padStart(2, '0')}` : ''}`,
      revenue: item.revenue,
      bookings: item.bookings,
      tickets: item.tickets || 0
    }));
  },

  // Calculate period over period growth
  calculateGrowth: (current, previous) => {
    if (!previous || previous === 0) return 100;
    return (((current - previous) / previous) * 100).toFixed(2);
  },

  // Format currency for display
  formatCurrency: (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  },

  // Format percentage
  formatPercentage: (value, decimals = 2) => {
    return `${parseFloat(value).toFixed(decimals)}%`;
  },

  // Process event stats for charts
  processEventStats: (eventStats) => {
    const statusMap = {
      'active': 'Active',
      'completed': 'Completed',
      'cancelled': 'Cancelled',
      'draft': 'Draft'
    };

    return eventStats.map(stat => ({
      status: statusMap[stat._id] || stat._id,
      count: stat.count,
      totalCapacity: stat.totalCapacity,
      totalRevenue: stat.totalRevenue
    }));
  },

  // Calculate key performance indicators
  calculateKPIs: (analyticsData) => {
    const { overview, bookingStats } = analyticsData;
    
    return {
      // Revenue per event
      revenuePerEvent: overview.totalEvents > 0 
        ? (overview.totalRevenue / overview.totalEvents).toFixed(2) 
        : 0,
      
      // Average order value
      averageOrderValue: bookingStats.totalBookings > 0 
        ? (bookingStats.totalRevenue / bookingStats.totalBookings).toFixed(2) 
        : 0,
      
      // Occupancy rate
      occupancyRate: overview.occupancyRate || 0,
      
      // Revenue per ticket
      revenuePerTicket: overview.totalSold > 0 
        ? (overview.totalRevenue / overview.totalSold).toFixed(2) 
        : 0,
    };
  }
};

// Error handling specifically for analytics
export const analyticsErrorHandler = (error, context = 'analytics') => {
  console.error(`Analytics Error in ${context}:`, error);
  
  // Custom error messages for analytics
  const errorMessages = {
    403: 'Access denied. Organizer role required for analytics.',
    404: 'Analytics data not found for the specified event.',
    500: 'Failed to load analytics data. Please try again.',
  };

  const status = error?.status || 500;
  return errorMessages[status] || error?.message || 'Failed to load analytics data';
};

// Analytics data cache utility (optional - for performance)
export const analyticsCache = {
  cache: new Map(),
  
  // Set cache with expiration (5 minutes default)
  set(key, data, expirationMs = 5 * 60 * 1000) {
    const expirationTime = Date.now() + expirationMs;
    this.cache.set(key, { data, expirationTime });
  },
  
  // Get from cache if not expired
  get(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() > cached.expirationTime) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  },
  
  // Clear all cache
  clear() {
    this.cache.clear();
  },
  
  // Remove expired entries
  cleanup() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now > value.expirationTime) {
        this.cache.delete(key);
      }
    }
  }
};
// Token management
export const tokenUtils = {
  getToken: () => localStorage.getItem('token'),
  setToken: (token) => localStorage.setItem('token', token),
  removeToken: () => localStorage.removeItem('token'),
  isAuthenticated: () => !!localStorage.getItem('token'),
};

// Error handler for components
export const handleApiError = (error, setError) => {
  console.error('API Error:', error);
  
  if (typeof error === 'string') {
    setError(error);
  } else if (error?.message) {
    setError(error.message);
  } else {
    setError('An unexpected error occurred');
  }
};

// Success handler
export const handleApiSuccess = (response, successMessage, setSuccess) => {
  console.log('API Success:', response);
  if (setSuccess && successMessage) {
    setSuccess(successMessage);
  }
};

export default api;
