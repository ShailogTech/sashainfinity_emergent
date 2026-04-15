import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Get API base from environment or use default
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

  // Create a fetch wrapper that includes auth headers
  const authFetch = useCallback(async (url, options = {}) => {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return fetch(url, { ...options, headers });
  }, []);

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await authFetch(`${API_BASE}/auth/me`);

          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          } else {
            // Token is invalid, remove it
            localStorage.removeItem('token');
            localStorage.removeItem('refresh_token');
          }
        } catch (err) {
          console.error('Auth check failed:', err);
          localStorage.removeItem('token');
          localStorage.removeItem('refresh_token');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [API_BASE, authFetch]);

  // Set up token refresh timer
  useEffect(() => {
    if (!user) return;

    // Refresh token 5 minutes before expiry
    const refreshInterval = setInterval(async () => {
      const result = await refreshToken();
      if (!result.success) {
        clearInterval(refreshInterval);
      }
    }, 25 * 60 * 1000); // 25 minutes

    return () => clearInterval(refreshInterval);
  }, [user]);

  const login = useCallback(async (email, password) => {
    try {
      setError(null);

      const response = await fetch(`${API_BASE}/auth/login-json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.error || 'Login failed');
      }

      // Store tokens
      localStorage.setItem('token', data.access_token);
      if (data.refresh_token) {
        localStorage.setItem('refresh_token', data.refresh_token);
      }

      // Set user data
      setUser(data.user);

      return { success: true, user: data.user };
    } catch (err) {
      const errorMessage = err.message || 'An error occurred during login';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [API_BASE]);

  const register = useCallback(async (userData) => {
    try {
      setError(null);

      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Registration failed');
      }

      // Auto-login after registration
      if (userData.email && userData.password) {
        const loginResult = await login(userData.email, userData.password);
        return loginResult;
      }

      return { success: true, user: data };
    } catch (err) {
      const errorMessage = err.message || 'An error occurred during registration';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [API_BASE, login]);

  const logout = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        // Call logout endpoint (for future extensibility)
        await authFetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
        });
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Always clear local storage and state
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      setUser(null);
      navigate('/login');
    }
  }, [API_BASE, authFetch, navigate]);

  const refreshToken = useCallback(async () => {
    try {
      const refreshTokenValue = localStorage.getItem('refresh_token');
      if (!refreshTokenValue) {
        throw new Error('No refresh token found');
      }

      const response = await authFetch(`${API_BASE}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshTokenValue }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();

      // Update token
      localStorage.setItem('token', data.access_token);

      return { success: true };
    } catch (err) {
      console.error('Token refresh failed:', err);
      // If refresh fails, logout the user
      await logout();
      return { success: false, error: 'Session expired. Please login again.' };
    }
  }, [authFetch, API_BASE, logout]);

  const updateUser = useCallback((updatedUserData) => {
    setUser(prev => ({ ...prev, ...updatedUserData }));
  }, []);

  const updateProfile = useCallback(async (profileData) => {
    try {
      setError(null);

      const response = await authFetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Profile update failed');
      }

      setUser(data);
      return { success: true, user: data };
    } catch (err) {
      const errorMessage = err.message || 'An error occurred during profile update';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [API_BASE, authFetch]);

  const changePassword = useCallback(async (passwordData) => {
    try {
      setError(null);

      const response = await authFetch(`${API_BASE}/auth/change-password`, {
        method: 'POST',
        body: JSON.stringify(passwordData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Password change failed');
      }

      return { success: true, message: data.message };
    } catch (err) {
      const errorMessage = err.message || 'An error occurred during password change';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [API_BASE, authFetch]);

  const forgotPassword = useCallback(async (email) => {
    try {
      setError(null);

      const response = await authFetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Password reset request failed');
      }

      return { success: true, message: data.message };
    } catch (err) {
      const errorMessage = err.message || 'An error occurred during password reset request';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [API_BASE, authFetch]);

  const resetPassword = useCallback(async (token, newPassword, confirm_password) => {
    try {
      setError(null);

      const response = await authFetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        body: JSON.stringify({ token, new_password: newPassword, confirm_password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Password reset failed');
      }

      return { success: true, message: data.message };
    } catch (err) {
      const errorMessage = err.message || 'An error occurred during password reset';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [API_BASE, authFetch]);

  const isAuthenticated = useCallback(() => {
    return !!user && !!localStorage.getItem('token');
  }, [user]);

  const hasRole = useCallback((roles) => {
    if (!user) return false;
    return Array.isArray(roles) ? roles.includes(user.role) : user.role === roles;
  }, [user]);

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    refreshToken,
    updateUser,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    isAuthenticated,
    hasRole,
    setError,
    authFetch,
    API_BASE,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
