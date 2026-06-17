import api from '../api.js';

/**
 * Authentication API Service
 */
export const authApi = {
  /**
   * User login
   */
  login: async (email, password) => {
    const response = await api.post('/User/Login', null, {
      params: { email, password },
    });
    return response.data;
  },

  /**
   * Admin login
   */
  adminLogin: async (email, password) => {
    const response = await api.post('/Admin/Login', null, {
      params: { email, password },
    });
    return response.data;
  },

  /**
   * User registration
   */
  register: async (userData) => {
    const response = await api.post('/User/Register', userData);
    return response.data;
  },

  /**
   * Validate JWT token
   */
  validateToken: async () => {
    const response = await api.get('/User/validateToken');
    return response.data;
  },

  /**
   * Refresh token
   */
  refreshToken: async () => {
    const response = await api.post('/User/refreshToken');
    return response.data;
  },

  /**
   * Forgot password - send reset email
   */
  forgotPassword: async (email) => {
    const response = await api.post('/User/forgotPassword', null, {
      params: { email },
    });
    return response.data;
  },

  /**
   * Reset password with token
   */
  resetPassword: async (token, newPassword) => {
    const response = await api.post('/User/resetPassword', {
      token,
      newPassword,
    });
    return response.data;
  },

  /**
   * Change password (authenticated user)
   */
  changePassword: async (oldPassword, newPassword) => {
    const response = await api.post('/User/changePassword', {
      oldPassword,
      newPassword,
    });
    return response.data;
  },
};

export default authApi;
