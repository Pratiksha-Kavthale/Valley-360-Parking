import api from '../api.js';

/**
 * Booking API Service
 */
export const bookingApi = {
  /**
   * Get all bookings (admin)
   */
  getAllBookings: async () => {
    const response = await api.get('/booking/viewAllBookings');
    return response.data;
  },

  /**
   * Get booking by ID
   */
  getBookingById: async (bookingId) => {
    const response = await api.get(`/booking/viewBooking/${bookingId}`);
    return response.data;
  },

  /**
   * Get bookings by user
   */
  getBookingsByUser: async (userId) => {
    const response = await api.get(`/booking/getByUserId/${userId}`);
    return response.data;
  },

  /**
   * Get bookings by slot
   */
  getBookingsBySlot: async (slotId) => {
    const response = await api.get(`/booking/getBySlotId/${slotId}`);
    return response.data;
  },

  /**
   * Get bookings by owner
   */
  getBookingsByOwner: async (ownerId) => {
    const response = await api.get(`/booking/getByOwnerId/${ownerId}`);
    return response.data;
  },

  /**
   * Create new booking
   */
  createBooking: async (bookingData) => {
    const response = await api.post('/booking/addBooking', bookingData);
    return response.data;
  },

  /**
   * Update booking
   */
  updateBooking: async (bookingId, bookingData) => {
    const response = await api.put(`/booking/updateBooking/${bookingId}`, bookingData);
    return response.data;
  },

  /**
   * Cancel booking
   */
  cancelBooking: async (bookingId) => {
    const response = await api.delete(`/booking/cancelBooking/${bookingId}`);
    return response.data;
  },

  /**
   * Confirm booking
   */
  confirmBooking: async (bookingId) => {
    const response = await api.post(`/booking/confirmBooking/${bookingId}`);
    return response.data;
  },

  /**
   * Complete booking (check-out)
   */
  completeBooking: async (bookingId) => {
    const response = await api.post(`/booking/completeBooking/${bookingId}`);
    return response.data;
  },

  /**
   * Get booking QR code
   */
  getBookingQR: async (bookingId) => {
    const response = await api.get(`/booking/getQR/${bookingId}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Validate booking QR code
   */
  validateBookingQR: async (qrData) => {
    const response = await api.post('/booking/validateQR', { qrData });
    return response.data;
  },

  /**
   * Get active bookings
   */
  getActiveBookings: async (userId) => {
    const response = await api.get(`/booking/activeBookings/${userId}`);
    return response.data;
  },

  /**
   * Get booking history
   */
  getBookingHistory: async (userId, page = 0, size = 10) => {
    const response = await api.get(`/booking/history/${userId}`, {
      params: { page, size },
    });
    return response.data;
  },

  /**
   * Check slot availability
   */
  checkAvailability: async (slotId, startTime, endTime) => {
    const response = await api.get(`/booking/checkAvailability/${slotId}`, {
      params: { startTime, endTime },
    });
    return response.data;
  },

  /**
   * Calculate booking price
   */
  calculatePrice: async (slotId, startTime, endTime) => {
    const response = await api.get(`/booking/calculatePrice/${slotId}`, {
      params: { startTime, endTime },
    });
    return response.data;
  },
};

export default bookingApi;
