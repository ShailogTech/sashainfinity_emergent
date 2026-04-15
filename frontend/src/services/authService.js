/**
 * Authentication Service
 * Centralized API calls for authentication operations
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

/**
 * Helper to get auth headers
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

/**
 * Handle API response errors
 */
const handleResponse = async (response) => {
  const data = await response.json();

  if (!response.ok) {
    // Handle 401 Unauthorized - token might be expired
    if (response.status === 401) {
      // Try to refresh token or redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    throw new Error(data.detail || data.message || 'An error occurred');
  }

  return data;
};

/**
 * Authentication API endpoints
 */
export const authAPI = {
  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} - Response with token and user data
   */
  login: async (email, password) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      body: formData,
    });

    const data = await handleResponse(response);

    // Store token
    if (data.access_token) {
      localStorage.setItem('token', data.access_token);
    }

    return data;
  },

  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} - Response with user data
   */
  register: async (userData) => {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    return handleResponse(response);
  },

  /**
   * Logout user
   */
  logout: async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
    }
  },

  /**
   * Get current user info
   * @returns {Promise<Object>} - User data
   */
  getCurrentUser: async () => {
    const response = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });

    return handleResponse(response);
  },

  /**
   * Get user profile
   * @returns {Promise<Object>} - User profile data
   */
  getProfile: async () => {
    const response = await fetch(`${API_BASE}/auth/profile`, {
      headers: getAuthHeaders(),
    });

    return handleResponse(response);
  },

  /**
   * Update user profile
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} - Updated user data
   */
  updateProfile: async (updateData) => {
    const response = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData),
    });

    return handleResponse(response);
  },

  /**
   * Change password
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} - Response data
   */
  changePassword: async (currentPassword, newPassword) => {
    const response = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    });

    return handleResponse(response);
  },

  /**
   * Refresh access token
   * @returns {Promise<Object>} - New token data
   */
  refreshToken: async () => {
    const response = await fetch(`${API_BASE}/auth/refresh-token`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    const data = await handleResponse(response);

    // Update stored token
    if (data.access_token) {
      localStorage.setItem('token', data.access_token);
    }

    return data;
  },
};

export default authAPI;
