import api from '../api.js';

/**
 * Error Tracking API Service - Failed Requests, Exceptions, Slow APIs
 */
export const errorTrackingApi = {
  // ==================
  // Error Logs
  // ==================

  /**
   * Get all error logs with pagination
   */
  getErrorLogs: async (page = 0, size = 20, filters = {}) => {
    const response = await api.get('/admin/errors/logs', {
      params: { page, size, ...filters },
    });
    return response.data;
  },

  /**
   * Get error log by ID
   */
  getErrorById: async (errorId) => {
    const response = await api.get(`/admin/errors/logs/${errorId}`);
    return response.data;
  },

  /**
   * Get error statistics summary
   */
  getErrorSummary: async (period = '24h') => {
    const response = await api.get('/admin/errors/summary', {
      params: { period },
    });
    return response.data;
  },

  // ==================
  // Failed Requests
  // ==================

  /**
   * Get failed requests
   */
  getFailedRequests: async (page = 0, size = 20) => {
    const response = await api.get('/admin/errors/failed-requests', {
      params: { page, size },
    });
    return response.data;
  },

  /**
   * Get failed requests by endpoint
   */
  getFailedRequestsByEndpoint: async (endpoint) => {
    const response = await api.get('/admin/errors/failed-requests/by-endpoint', {
      params: { endpoint },
    });
    return response.data;
  },

  /**
   * Get failed requests trend
   */
  getFailedRequestsTrend: async (period = '7d') => {
    const response = await api.get('/admin/errors/failed-requests/trend', {
      params: { period },
    });
    return response.data;
  },

  // ==================
  // Exceptions
  // ==================

  /**
   * Get exceptions grouped by type
   */
  getExceptionsByType: async () => {
    const response = await api.get('/admin/errors/exceptions/by-type');
    return response.data;
  },

  /**
   * Get exception details
   */
  getExceptionDetails: async (exceptionId) => {
    const response = await api.get(`/admin/errors/exceptions/${exceptionId}`);
    return response.data;
  },

  /**
   * Get exceptions trend
   */
  getExceptionsTrend: async (period = '7d') => {
    const response = await api.get('/admin/errors/exceptions/trend', {
      params: { period },
    });
    return response.data;
  },

  // ==================
  // Slow APIs
  // ==================

  /**
   * Get slow API endpoints
   */
  getSlowApis: async (threshold = 1000) => {
    const response = await api.get('/admin/errors/slow-apis', {
      params: { threshold },
    });
    return response.data;
  },

  /**
   * Get API response times
   */
  getApiResponseTimes: async (period = '24h') => {
    const response = await api.get('/admin/errors/api-response-times', {
      params: { period },
    });
    return response.data;
  },

  /**
   * Get API performance metrics
   */
  getApiPerformanceMetrics: async () => {
    const response = await api.get('/admin/errors/api-performance');
    return response.data;
  },

  // ==================
  // Dashboard Data
  // ==================

  /**
   * Get error dashboard data
   */
  getErrorDashboard: async () => {
    const response = await api.get('/admin/errors/dashboard');
    return response.data;
  },

  /**
   * Get error rate by hour
   */
  getErrorRateByHour: async (date = null) => {
    const response = await api.get('/admin/errors/rate-by-hour', {
      params: { date },
    });
    return response.data;
  },

  /**
   * Get most common errors
   */
  getMostCommonErrors: async (limit = 10) => {
    const response = await api.get('/admin/errors/most-common', {
      params: { limit },
    });
    return response.data;
  },

  // ==================
  // Actions
  // ==================

  /**
   * Mark error as resolved
   */
  markAsResolved: async (errorId) => {
    const response = await api.post(`/admin/errors/logs/${errorId}/resolve`);
    return response.data;
  },

  /**
   * Mark multiple errors as resolved
   */
  bulkResolve: async (errorIds) => {
    const response = await api.post('/admin/errors/logs/bulk-resolve', { errorIds });
    return response.data;
  },

  /**
   * Delete error log
   */
  deleteErrorLog: async (errorId) => {
    const response = await api.delete(`/admin/errors/logs/${errorId}`);
    return response.data;
  },

  /**
   * Clear old error logs
   */
  clearOldLogs: async (daysOld = 30) => {
    const response = await api.delete('/admin/errors/logs/old', {
      params: { daysOld },
    });
    return response.data;
  },

  // ==================
  // Real-time Monitoring
  // ==================

  /**
   * Get real-time error stream endpoint URL
   */
  getErrorStreamUrl: () => {
    return `${api.defaults.baseURL}/admin/errors/stream`;
  },

  /**
   * Subscribe to error notifications (SSE)
   */
  subscribeToErrors: (onError, onClose) => {
    const eventSource = new EventSource(
      `${api.defaults.baseURL}/admin/errors/stream`,
      { withCredentials: true }
    );

    eventSource.onmessage = (event) => {
      const errorData = JSON.parse(event.data);
      onError(errorData);
    };

    eventSource.onerror = (error) => {
      console.error('Error stream connection error:', error);
      if (onClose) onClose(error);
    };

    return () => eventSource.close();
  },
};

export default errorTrackingApi;
