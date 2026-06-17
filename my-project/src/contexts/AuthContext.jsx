import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { STORAGE_KEYS, ROLES } from '../utils/constants';
import { decodeToken, isTokenExpired, clearAuthStorage } from '../utils/helpers';
import api from '../api.js';

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
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from storage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedToken = sessionStorage.getItem(STORAGE_KEYS.JWT_TOKEN) || 
                           localStorage.getItem(STORAGE_KEYS.TOKEN);
        const storedUser = sessionStorage.getItem(STORAGE_KEYS.USER);

        if (storedToken && !isTokenExpired(storedToken)) {
          setToken(storedToken);
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        } else if (storedToken) {
          // Token expired, clear storage
          clearAuthStorage();
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        clearAuthStorage();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login
  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/User/Login', null, {
        params: { email, password },
      });

      const { token: jwtToken, jwtToken: altToken, ...userData } = response.data;
      const finalToken = jwtToken || altToken;

      if (!finalToken) {
        throw new Error('No token received from server');
      }

      // Store auth data
      localStorage.setItem(STORAGE_KEYS.TOKEN, finalToken);
      sessionStorage.setItem(STORAGE_KEYS.JWT_TOKEN, finalToken);
      sessionStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));

      // Decode token for role
      const decoded = decodeToken(finalToken);
      if (decoded?.role) {
        sessionStorage.setItem(STORAGE_KEYS.ROLE, decoded.role);
      }

      setToken(finalToken);
      setUser(userData);

      return { success: true, user: userData };
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Login failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Admin Login
  const adminLogin = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/Admin/Login', null, {
        params: { email, password },
      });

      const { token: jwtToken, jwtToken: altToken, ...userData } = response.data;
      const finalToken = jwtToken || altToken;

      if (!finalToken) {
        throw new Error('No token received from server');
      }

      localStorage.setItem(STORAGE_KEYS.TOKEN, finalToken);
      sessionStorage.setItem(STORAGE_KEYS.JWT_TOKEN, finalToken);
      sessionStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
      sessionStorage.setItem(STORAGE_KEYS.ROLE, ROLES.ADMIN);

      setToken(finalToken);
      setUser({ ...userData, role: ROLES.ADMIN });

      return { success: true, user: userData };
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Admin login failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Register
  const register = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      await api.post('/User/Register', userData);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Registration failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout
  const logout = useCallback(() => {
    clearAuthStorage();
    setUser(null);
    setToken(null);
    setError(null);
  }, []);

  // Update user profile
  const updateProfile = useCallback(async (email, profileData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.put(`/User/updateUser/${email}`, profileData);
      const updatedUser = { ...user, ...response.data };
      
      sessionStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
      setUser(updatedUser);

      return { success: true, user: updatedUser };
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Profile update failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Check if user has role
  const hasRole = useCallback((role) => {
    if (!user) return false;
    const userRoles = user.userRoles || [];
    if (Array.isArray(role)) {
      return role.some((r) => userRoles.includes(r));
    }
    return userRoles.includes(role);
  }, [user]);

  // Check authentication
  const isAuthenticated = !!token && !!user && !isTokenExpired(token);

  // Role checks
  const isAdmin = hasRole(ROLES.ADMIN);
  const isOwner = hasRole(ROLES.OWNER);
  const isCustomer = hasRole(ROLES.CUSTOMER);

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    isOwner,
    isCustomer,
    login,
    adminLogin,
    register,
    logout,
    updateProfile,
    hasRole,
    clearError: () => setError(null),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
