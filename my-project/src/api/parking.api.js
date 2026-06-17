import api from '../api.js';

/**
 * Parking API Service - Areas and Slots
 */
export const parkingApi = {
  // ==================
  // Parking Areas
  // ==================

  /**
   * Get all parking areas
   */
  getAllAreas: async () => {
    const response = await api.get('/parkingArea/viewAllParkingAreas');
    return response.data;
  },

  /**
   * Get parking area by ID
   */
  getAreaById: async (areaId) => {
    const response = await api.get(`/parkingArea/viewParkingArea/${areaId}`);
    return response.data;
  },

  /**
   * Get areas by owner
   */
  getAreasByOwner: async (ownerId) => {
    const response = await api.get(`/parkingArea/getByUserId/${ownerId}`);
    return response.data;
  },

  /**
   * Create new parking area
   */
  createArea: async (areaData) => {
    const response = await api.post('/parkingArea/addParkingArea', areaData);
    return response.data;
  },

  /**
   * Update parking area
   */
  updateArea: async (areaId, areaData) => {
    const response = await api.put(`/parkingArea/updateParkingArea/${areaId}`, areaData);
    return response.data;
  },

  /**
   * Delete parking area
   */
  deleteArea: async (areaId) => {
    const response = await api.delete(`/parkingArea/deleteParkingArea/${areaId}`);
    return response.data;
  },

  /**
   * Search parking areas by location
   */
  searchByLocation: async (latitude, longitude, radius = 5) => {
    const response = await api.get('/parkingArea/searchByLocation', {
      params: { latitude, longitude, radius },
    });
    return response.data;
  },

  // ==================
  // Parking Slots
  // ==================

  /**
   * Get all parking slots
   */
  getAllSlots: async () => {
    const response = await api.get('/parking-slot/viewAllParkingSlots');
    return response.data;
  },

  /**
   * Get slot by ID
   */
  getSlotById: async (slotId) => {
    const response = await api.get(`/parking-slot/viewParkingSlot/${slotId}`);
    return response.data;
  },

  /**
   * Get slots by parking area
   */
  getSlotsByArea: async (areaId) => {
    const response = await api.get(`/parking-slot/viewSlotsByAreaId/${areaId}`);
    return response.data;
  },

  /**
   * Get slots by owner
   */
  getSlotsByOwner: async (ownerId) => {
    const response = await api.get(`/parking-slot/getSlotsByOwnerId/${ownerId}`);
    return response.data;
  },

  /**
   * Create new parking slot
   */
  createSlot: async (slotData) => {
    const response = await api.post('/parking-slot/addParkingSlot', slotData);
    return response.data;
  },

  /**
   * Update parking slot
   */
  updateSlot: async (slotId, slotData) => {
    const response = await api.put(`/parking-slot/updateParkingSlot/${slotId}`, slotData);
    return response.data;
  },

  /**
   * Delete parking slot
   */
  deleteSlot: async (slotId) => {
    const response = await api.delete(`/parking-slot/deleteParkingSlot/${slotId}`);
    return response.data;
  },

  /**
   * Get available slots by area
   */
  getAvailableSlots: async (areaId) => {
    const response = await api.get(`/parking-slot/availableSlots/${areaId}`);
    return response.data;
  },

  /**
   * Update slot status
   */
  updateSlotStatus: async (slotId, status) => {
    const response = await api.patch(`/parking-slot/updateStatus/${slotId}`, null, {
      params: { status },
    });
    return response.data;
  },

  // ==================
  // Slot Timeline
  // ==================

  /**
   * Get slot timeline/schedule
   */
  getSlotTimeline: async (slotId, date) => {
    const response = await api.get(`/parking-slot/timeline/${slotId}`, {
      params: { date },
    });
    return response.data;
  },
};

export default parkingApi;
