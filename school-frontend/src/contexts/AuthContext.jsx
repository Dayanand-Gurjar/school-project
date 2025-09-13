import React, { createContext, useState, useContext, useEffect } from 'react';
import { api } from '../services/api';
import { API_BASE } from '../config/constants';

const AuthContext = createContext();

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await fetch(`${API_BASE}/api/auth/verify`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (data.success) {
          setUser(data.user);
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('token');
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await api.login(credentials);
      if (response.success) {
        const { token, user } = response;
        localStorage.setItem('token', token);
        setUser(user);
        setIsAuthenticated(true);
        return { success: true, user };
      }
      return { success: false, error: response.error };
    } catch (error) {
      return { success: false, error: error.message || 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.register(userData);
      return response;
    } catch (error) {
      return { success: false, error: error.message || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const googleAuth = async (googleToken) => {
    try {
      const response = await api.post('/auth/google', { token: googleToken });
      if (response.data.success) {
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        setUser(user);
        setIsAuthenticated(true);
        return { success: true, user };
      }
      return { success: false, error: response.data.error };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Google authentication failed' };
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    googleAuth,
    checkAuthStatus,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
