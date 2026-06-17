import api from '../api.js';

/**
 * Review API Service
 */
export const reviewApi = {
  /**
   * Get all reviews
   */
  getAllReviews: async () => {
    const response = await api.get('/review/viewAllReviews');
    return response.data;
  },

  /**
   * Get review by ID
   */
  getReviewById: async (reviewId) => {
    const response = await api.get(`/review/viewReview/${reviewId}`);
    return response.data;
  },

  /**
   * Get reviews by parking area
   */
  getReviewsByArea: async (areaId) => {
    const response = await api.get(`/review/getByAreaId/${areaId}`);
    return response.data;
  },

  /**
   * Get reviews by user
   */
  getReviewsByUser: async (userId) => {
    const response = await api.get(`/review/getByUserId/${userId}`);
    return response.data;
  },

  /**
   * Get reviews by owner
   */
  getReviewsByOwner: async (ownerId) => {
    const response = await api.get(`/review/getByOwnerId/${ownerId}`);
    return response.data;
  },

  /**
   * Create review
   */
  createReview: async (reviewData) => {
    const response = await api.post('/review/addReview', reviewData);
    return response.data;
  },

  /**
   * Update review
   */
  updateReview: async (reviewId, reviewData) => {
    const response = await api.put(`/review/updateReview/${reviewId}`, reviewData);
    return response.data;
  },

  /**
   * Delete review
   */
  deleteReview: async (reviewId) => {
    const response = await api.delete(`/review/deleteReview/${reviewId}`);
    return response.data;
  },

  /**
   * Get average rating for parking area
   */
  getAverageRating: async (areaId) => {
    const response = await api.get(`/review/averageRating/${areaId}`);
    return response.data;
  },

  /**
   * Get review analytics for owner
   */
  getReviewAnalytics: async (ownerId) => {
    const response = await api.get(`/review/analytics/${ownerId}`);
    return response.data;
  },

  /**
   * Reply to review (owner)
   */
  replyToReview: async (reviewId, reply) => {
    const response = await api.post(`/review/reply/${reviewId}`, { reply });
    return response.data;
  },

  /**
   * Report review
   */
  reportReview: async (reviewId, reason) => {
    const response = await api.post(`/review/report/${reviewId}`, { reason });
    return response.data;
  },
};

export default reviewApi;
