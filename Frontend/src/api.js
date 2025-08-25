// src/api.js
import axios from 'axios';

const API_URL =  'http://localhost:5000/api';

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
};

// EVENT APIs
export const eventAPI = {
  getAllEvents: (params = {}) => get('/events', params),
  getEventById: (id) => get(`/events/${id}`),
  createEvent: (data) => post('/events', data),
  updateEvent: (id, data) => put(`/events/${id}`, data),
  deleteEvent: (id) => del(`/events/${id}`),
  getOrganizerEvents: () => get('/events/organizer/my-events'),
  searchEvents: (query) => get('/events', { search: query }),
  getEventsByCategory: (category) => get('/events', { category }),
};

// BOOKING APIs
export const bookingAPI = {
  createBooking: (data) => post('/bookings', data),
  getUserBookings: () => get('/bookings/my-bookings'),
  getBookingById: (id) => get(`/bookings/${id}`),
  cancelBooking: (id) => patch(`/bookings/${id}/cancel`),
  getAllBookings: (params = {}) => get('/bookings', params), // Admin only
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
  sendMessage: (data) => post('/chat/messages', data),
  getMessages: (userId, params = {}) => get(`/chat/messages/${userId}`, params),
  getChatUsers: () => get('/chat/users'),
  markAsRead: (userId) => patch(`/chat/messages/${userId}/read`),
};

// ADMIN APIs
export const adminAPI = {
  getAllUsers: (params = {}) => get('/admin/users', params),
  deleteUser: (id) => del(`/admin/users/${id}`),
  updateUserRole: (id, role) => patch(`/admin/users/${id}/role`, { role }),
  getDashboardStats: () => get('/admin/dashboard/stats'),
};

// FILE UPLOAD APIs
export const uploadAPI = {
  uploadEventImage: (formData) => uploadFile('/upload/event-image', formData),
  uploadProfileImage: (formData) => uploadFile('/upload/profile-image', formData),
  uploadMultipleImages: (formData) => uploadFile('/upload/multiple', formData),
};

// ===========================================
// UTILITY FUNCTIONS
// ===========================================

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
