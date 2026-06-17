import api from '../api.js';

/**
 * Payment API Service
 */
export const paymentApi = {
  /**
   * Get all payments (admin)
   */
  getAllPayments: async () => {
    const response = await api.get('/payment/viewAllPayments');
    return response.data;
  },

  /**
   * Get payment by ID
   */
  getPaymentById: async (paymentId) => {
    const response = await api.get(`/payment/viewPayment/${paymentId}`);
    return response.data;
  },

  /**
   * Get payments by user
   */
  getPaymentsByUser: async (userId) => {
    const response = await api.get(`/payment/getByUserId/${userId}`);
    return response.data;
  },

  /**
   * Get payments by booking
   */
  getPaymentByBooking: async (bookingId) => {
    const response = await api.get(`/payment/getByBookingId/${bookingId}`);
    return response.data;
  },

  /**
   * Get payments by owner
   */
  getPaymentsByOwner: async (ownerId) => {
    const response = await api.get(`/payment/getByOwnerId/${ownerId}`);
    return response.data;
  },

  /**
   * Process payment
   */
  processPayment: async (paymentData) => {
    const response = await api.post('/payment/processPayment', paymentData);
    return response.data;
  },

  /**
   * Create payment order (for payment gateway)
   */
  createPaymentOrder: async (bookingId, amount) => {
    const response = await api.post('/payment/createOrder', {
      bookingId,
      amount,
    });
    return response.data;
  },

  /**
   * Verify payment
   */
  verifyPayment: async (paymentId, signature, orderId) => {
    const response = await api.post('/payment/verifyPayment', {
      paymentId,
      signature,
      orderId,
    });
    return response.data;
  },

  /**
   * Request refund
   */
  requestRefund: async (paymentId, reason) => {
    const response = await api.post(`/payment/refund/${paymentId}`, { reason });
    return response.data;
  },

  /**
   * Get payment settings (owner)
   */
  getPaymentSettings: async (ownerId) => {
    const response = await api.get(`/payment/settings/${ownerId}`);
    return response.data;
  },

  /**
   * Update payment settings (owner)
   */
  updatePaymentSettings: async (ownerId, settings) => {
    const response = await api.put(`/payment/settings/${ownerId}`, settings);
    return response.data;
  },

  /**
   * Get payment analytics
   */
  getPaymentAnalytics: async (ownerId, startDate, endDate) => {
    const response = await api.get(`/payment/analytics/${ownerId}`, {
      params: { startDate, endDate },
    });
    return response.data;
  },
};

export default paymentApi;
