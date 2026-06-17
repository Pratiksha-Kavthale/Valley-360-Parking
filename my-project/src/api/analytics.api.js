import api from '../api.js';

/**
 * Analytics API Service - Charts, Stats, and Utilization
 */
export const analyticsApi = {
  // ==================
  // Dashboard Analytics
  // ==================

  /**
   * Get daily bookings data for charts
   */
  getDailyBookings: async (startDate, endDate) => {
    const response = await api.get('/analytics/bookings/daily', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  /**
   * Get monthly revenue data for charts
   */
  getMonthlyRevenue: async (year) => {
    const response = await api.get('/analytics/revenue/monthly', {
      params: { year },
    });
    return response.data;
  },

  /**
   * Get occupancy trends over time
   */
  getOccupancyTrends: async (period = '30d') => {
    const response = await api.get('/analytics/occupancy/trends', {
      params: { period },
    });
    return response.data;
  },

  /**
   * Get peak usage hours
   */
  getPeakUsageHours: async (startDate, endDate) => {
    const response = await api.get('/analytics/usage/peak-hours', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  // ==================
  // Owner Analytics
  // ==================

  /**
   * Get owner dashboard analytics
   */
  getOwnerAnalytics: async (ownerId) => {
    const response = await api.get(`/analytics/owner/${ownerId}/dashboard`);
    return response.data;
  },

  /**
   * Get owner revenue analytics
   */
  getOwnerRevenue: async (ownerId, period = '30d') => {
    const response = await api.get(`/analytics/owner/${ownerId}/revenue`, {
      params: { period },
    });
    return response.data;
  },

  /**
   * Get owner booking analytics
   */
  getOwnerBookings: async (ownerId, period = '7d') => {
    const response = await api.get(`/analytics/owner/${ownerId}/bookings`, {
      params: { period },
    });
    return response.data;
  },

  // ==================
  // User Analytics
  // ==================

  /**
   * Get user dashboard analytics
   */
  getUserAnalytics: async (userId) => {
    const response = await api.get(`/analytics/user/${userId}/dashboard`);
    return response.data;
  },

  /**
   * Get user booking history analytics
   */
  getUserBookingHistory: async (userId, period = '30d') => {
    const response = await api.get(`/analytics/user/${userId}/booking-history`, {
      params: { period },
    });
    return response.data;
  },

  /**
   * Get user spending analytics
   */
  getUserSpending: async (userId, period = '30d') => {
    const response = await api.get(`/analytics/user/${userId}/spending`, {
      params: { period },
    });
    return response.data;
  },

  // ==================
  // Utilization Analytics
  // ==================

  /**
   * Get current parking utilization
   */
  getCurrentUtilization: async () => {
    const response = await api.get('/analytics/utilization/current');
    return response.data;
  },

  /**
   * Get utilization by parking area
   */
  getAreaUtilization: async (areaId) => {
    const response = await api.get(`/analytics/utilization/area/${areaId}`);
    return response.data;
  },

  /**
   * Get historical utilization trends
   */
  getUtilizationHistory: async (period = '30d') => {
    const response = await api.get('/analytics/utilization/history', {
      params: { period },
    });
    return response.data;
  },

  /**
   * Get utilization heatmap data (by hour and day)
   */
  getUtilizationHeatmap: async (areaId = null) => {
    const response = await api.get('/analytics/utilization/heatmap', {
      params: { areaId },
    });
    return response.data;
  },

  // ==================
  // Admin Analytics
  // ==================

  /**
   * Get platform-wide statistics
   */
  getPlatformStats: async () => {
    const response = await api.get('/analytics/admin/platform-stats');
    return response.data;
  },

  /**
   * Get revenue breakdown by area
   */
  getRevenueByArea: async (period = '30d') => {
    const response = await api.get('/analytics/admin/revenue-by-area', {
      params: { period },
    });
    return response.data;
  },

  /**
   * Get top performing parking areas
   */
  getTopAreas: async (limit = 10) => {
    const response = await api.get('/analytics/admin/top-areas', {
      params: { limit },
    });
    return response.data;
  },

  /**
   * Get booking conversion rate
   */
  getConversionRate: async (period = '30d') => {
    const response = await api.get('/analytics/admin/conversion-rate', {
      params: { period },
    });
    return response.data;
  },
};

export default analyticsApi;
