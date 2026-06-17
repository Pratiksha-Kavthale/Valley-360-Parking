import api from '../api.js';

/**
 * Cleanup API Service - Inactive Parking Areas & Slots Management
 */
export const cleanupApi = {
  // ==================
  // Inactive Resources
  // ==================

  /**
   * Get all inactive parking areas (>45 days)
   */
  getInactiveParkingAreas: async (daysInactive = 45) => {
    const response = await api.get('/admin/cleanup/inactive-areas', {
      params: { daysInactive },
    });
    return response.data;
  },

  /**
   * Get all inactive parking slots (>45 days)
   */
  getInactiveParkingSlots: async (daysInactive = 45) => {
    const response = await api.get('/admin/cleanup/inactive-slots', {
      params: { daysInactive },
    });
    return response.data;
  },

  /**
   * Get cleanup summary statistics
   */
  getCleanupSummary: async () => {
    const response = await api.get('/admin/cleanup/summary');
    return response.data;
  },

  // ==================
  // Admin Actions
  // ==================

  /**
   * Delete parking area permanently
   */
  deleteParkingArea: async (areaId) => {
    const response = await api.delete(`/admin/cleanup/area/${areaId}`);
    return response.data;
  },

  /**
   * Delete parking slot permanently
   */
  deleteParkingSlot: async (slotId) => {
    const response = await api.delete(`/admin/cleanup/slot/${slotId}`);
    return response.data;
  },

  /**
   * Archive parking area
   */
  archiveParkingArea: async (areaId) => {
    const response = await api.post(`/admin/cleanup/area/${areaId}/archive`);
    return response.data;
  },

  /**
   * Archive parking slot
   */
  archiveParkingSlot: async (slotId) => {
    const response = await api.post(`/admin/cleanup/slot/${slotId}/archive`);
    return response.data;
  },

  /**
   * Restore archived parking area
   */
  restoreParkingArea: async (areaId) => {
    const response = await api.post(`/admin/cleanup/area/${areaId}/restore`);
    return response.data;
  },

  /**
   * Restore archived parking slot
   */
  restoreParkingSlot: async (slotId) => {
    const response = await api.post(`/admin/cleanup/slot/${slotId}/restore`);
    return response.data;
  },

  /**
   * Mark parking area as active
   */
  markAreaAsActive: async (areaId) => {
    const response = await api.post(`/admin/cleanup/area/${areaId}/activate`);
    return response.data;
  },

  /**
   * Mark parking slot as active
   */
  markSlotAsActive: async (slotId) => {
    const response = await api.post(`/admin/cleanup/slot/${slotId}/activate`);
    return response.data;
  },

  // ==================
  // Bulk Actions
  // ==================

  /**
   * Bulk delete parking areas
   */
  bulkDeleteAreas: async (areaIds) => {
    const response = await api.post('/admin/cleanup/areas/bulk-delete', { areaIds });
    return response.data;
  },

  /**
   * Bulk archive parking areas
   */
  bulkArchiveAreas: async (areaIds) => {
    const response = await api.post('/admin/cleanup/areas/bulk-archive', { areaIds });
    return response.data;
  },

  /**
   * Bulk delete parking slots
   */
  bulkDeleteSlots: async (slotIds) => {
    const response = await api.post('/admin/cleanup/slots/bulk-delete', { slotIds });
    return response.data;
  },

  /**
   * Bulk archive parking slots
   */
  bulkArchiveSlots: async (slotIds) => {
    const response = await api.post('/admin/cleanup/slots/bulk-archive', { slotIds });
    return response.data;
  },

  // ==================
  // Reports
  // ==================

  /**
   * Get monthly cleanup report
   */
  getMonthlyReport: async (month, year) => {
    const response = await api.get('/admin/cleanup/report/monthly', {
      params: { month, year },
    });
    return response.data;
  },

  /**
   * Generate cleanup report
   */
  generateReport: async () => {
    const response = await api.post('/admin/cleanup/report/generate');
    return response.data;
  },

  /**
   * Get pending deletion notifications
   */
  getPendingDeletions: async () => {
    const response = await api.get('/admin/cleanup/pending-deletions');
    return response.data;
  },

  /**
   * Schedule deletion with notification
   */
  scheduleDeletion: async (resourceType, resourceId, deletionDate) => {
    const response = await api.post('/admin/cleanup/schedule-deletion', {
      resourceType,
      resourceId,
      deletionDate,
    });
    return response.data;
  },

  /**
   * Cancel scheduled deletion (when user clicks cancel link)
   */
  cancelScheduledDeletion: async (token) => {
    const response = await api.post(`/admin/cleanup/cancel-deletion/${token}`);
    return response.data;
  },

  // ==================
  // Archived Resources
  // ==================

  /**
   * Get all archived parking areas
   */
  getArchivedAreas: async () => {
    const response = await api.get('/admin/cleanup/archived-areas');
    return response.data;
  },

  /**
   * Get all archived parking slots
   */
  getArchivedSlots: async () => {
    const response = await api.get('/admin/cleanup/archived-slots');
    return response.data;
  },
};

export default cleanupApi;
