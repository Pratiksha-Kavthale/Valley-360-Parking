import api from '../api.js';

/**
 * User API Service
 */
export const userApi = {
  /**
   * Get current user profile
   */
  getProfile: async () => {
    const response = await api.get('/User/profile');
    return response.data;
  },

  /**
   * Update user profile
   */
  updateProfile: async (email, userData) => {
    const response = await api.put(`/User/updateUser/${email}`, userData);
    return response.data;
  },

  /**
   * Delete user account
   */
  deleteAccount: async (email) => {
    const response = await api.delete(`/User/Delete/${email}`);
    return response.data;
  },

  /**
   * Get all users (admin)
   */
  getAllUsers: async () => {
    const response = await api.get('/Admin/ViewAllUsers');
    return response.data;
  },

  /**
   * Get all customers (admin)
   */
  getAllCustomers: async () => {
    const response = await api.get('/Admin/ViewAllCustomers');
    return response.data;
  },

  /**
   * Get all owners (admin)
   */
  getAllOwners: async () => {
    const response = await api.get('/Admin/ViewAllOwners');
    return response.data;
  },

  /**
   * Get user by email
   */
  getUserByEmail: async (email) => {
    const response = await api.get(`/User/getUser/${email}`);
    return response.data;
  },

  /**
   * Promote user to owner
   */
  promoteToOwner: async (userId) => {
    const response = await api.post(`/Admin/promoteToOwner/${userId}`);
    return response.data;
  },

  /**
   * Upload profile picture
   */
  uploadProfilePicture: async (email, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/User/uploadPicture/${email}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

export default userApi;
