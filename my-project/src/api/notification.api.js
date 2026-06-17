import api from '../api.js';

/**
 * WebSocket Notification API Service - Real-time Notifications
 */

const WS_BASE_URL = 'ws://localhost:8080/ws';
let wsConnection = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 3000;

/**
 * Notification types
 */
export const NOTIFICATION_TYPES = {
  BOOKING_CONFIRMED: 'BOOKING_CONFIRMED',
  SLOT_RESERVED: 'SLOT_RESERVED',
  PARKING_AREA_CLOSED: 'PARKING_AREA_CLOSED',
  ADMIN_ANNOUNCEMENT: 'ADMIN_ANNOUNCEMENT',
  PAYMENT_VERIFIED: 'PAYMENT_VERIFIED',
  DELETION_WARNING: 'DELETION_WARNING',
  BOOKING_CANCELLED: 'BOOKING_CANCELLED',
  REVIEW_RECEIVED: 'REVIEW_RECEIVED',
  SLOT_AVAILABLE: 'SLOT_AVAILABLE',
  PRICE_UPDATED: 'PRICE_UPDATED',
};

export const notificationApi = {
  // ==================
  // WebSocket Connection
  // ==================

  /**
   * Initialize WebSocket connection
   */
  connect: (userId, onMessage, onConnect, onDisconnect, onError) => {
    if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return wsConnection;
    }

    const token = sessionStorage.getItem('token');
    const wsUrl = `${WS_BASE_URL}/notifications?userId=${userId}&token=${token}`;

    try {
      wsConnection = new WebSocket(wsUrl);

      wsConnection.onopen = () => {
        console.log('WebSocket connected');
        reconnectAttempts = 0;
        if (onConnect) onConnect();
      };

      wsConnection.onmessage = (event) => {
        try {
          const notification = JSON.parse(event.data);
          if (onMessage) onMessage(notification);
        } catch (error) {
          console.error('Failed to parse notification:', error);
        }
      };

      wsConnection.onclose = (event) => {
        console.log('WebSocket disconnected', event.code, event.reason);
        if (onDisconnect) onDisconnect(event);

        // Auto-reconnect logic
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS && event.code !== 1000) {
          reconnectAttempts++;
          console.log(`Reconnecting... Attempt ${reconnectAttempts}`);
          setTimeout(() => {
            notificationApi.connect(userId, onMessage, onConnect, onDisconnect, onError);
          }, RECONNECT_DELAY);
        }
      };

      wsConnection.onerror = (error) => {
        console.error('WebSocket error:', error);
        if (onError) onError(error);
      };

      return wsConnection;
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      if (onError) onError(error);
      return null;
    }
  },

  /**
   * Disconnect WebSocket
   */
  disconnect: () => {
    if (wsConnection) {
      wsConnection.close(1000, 'User disconnected');
      wsConnection = null;
    }
  },

  /**
   * Check connection status
   */
  isConnected: () => {
    return wsConnection && wsConnection.readyState === WebSocket.OPEN;
  },

  /**
   * Send message through WebSocket
   */
  send: (message) => {
    if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
      wsConnection.send(JSON.stringify(message));
      return true;
    }
    console.warn('WebSocket not connected, cannot send message');
    return false;
  },

  // ==================
  // REST API Endpoints
  // ==================

  /**
   * Get all notifications for user
   */
  getNotifications: async (userId, page = 0, size = 20) => {
    const response = await api.get(`/notifications/user/${userId}`, {
      params: { page, size },
    });
    return response.data;
  },

  /**
   * Get unread notifications count
   */
  getUnreadCount: async (userId) => {
    const response = await api.get(`/notifications/user/${userId}/unread-count`);
    return response.data;
  },

  /**
   * Mark notification as read
   */
  markAsRead: async (notificationId) => {
    const response = await api.post(`/notifications/${notificationId}/read`);
    return response.data;
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (userId) => {
    const response = await api.post(`/notifications/user/${userId}/mark-all-read`);
    return response.data;
  },

  /**
   * Delete notification
   */
  deleteNotification: async (notificationId) => {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  },

  /**
   * Clear all notifications
   */
  clearAllNotifications: async (userId) => {
    const response = await api.delete(`/notifications/user/${userId}/clear-all`);
    return response.data;
  },

  // ==================
  // Admin Operations
  // ==================

  /**
   * Send admin announcement to all users
   */
  sendAnnouncement: async (announcement) => {
    const response = await api.post('/notifications/admin/announcement', announcement);
    return response.data;
  },

  /**
   * Send notification to specific user
   */
  sendToUser: async (userId, notification) => {
    const response = await api.post(`/notifications/admin/send/${userId}`, notification);
    return response.data;
  },

  /**
   * Send notification to all users of a parking area
   */
  sendToAreaUsers: async (areaId, notification) => {
    const response = await api.post(`/notifications/admin/send-to-area/${areaId}`, notification);
    return response.data;
  },

  /**
   * Send bulk notifications
   */
  sendBulk: async (userIds, notification) => {
    const response = await api.post('/notifications/admin/bulk-send', {
      userIds,
      ...notification,
    });
    return response.data;
  },

  // ==================
  // Notification Preferences
  // ==================

  /**
   * Get user notification preferences
   */
  getPreferences: async (userId) => {
    const response = await api.get(`/notifications/preferences/${userId}`);
    return response.data;
  },

  /**
   * Update notification preferences
   */
  updatePreferences: async (userId, preferences) => {
    const response = await api.put(`/notifications/preferences/${userId}`, preferences);
    return response.data;
  },

  // ==================
  // Email/SMS Notifications
  // ==================

  /**
   * Send email notification
   */
  sendEmail: async (userId, emailData) => {
    const response = await api.post(`/notifications/email/${userId}`, emailData);
    return response.data;
  },

  /**
   * Send SMS notification
   */
  sendSms: async (userId, smsData) => {
    const response = await api.post(`/notifications/sms/${userId}`, smsData);
    return response.data;
  },

  /**
   * Send deletion warning notification (email + SMS)
   */
  sendDeletionWarning: async (resourceType, resourceId, ownerId) => {
    const response = await api.post('/notifications/deletion-warning', {
      resourceType,
      resourceId,
      ownerId,
    });
    return response.data;
  },

  // ==================
  // Subscription Topics
  // ==================

  /**
   * Subscribe to a topic (e.g., parking area updates)
   */
  subscribeToTopic: async (userId, topic) => {
    const response = await api.post(`/notifications/subscribe/${userId}`, { topic });
    return response.data;
  },

  /**
   * Unsubscribe from a topic
   */
  unsubscribeFromTopic: async (userId, topic) => {
    const response = await api.post(`/notifications/unsubscribe/${userId}`, { topic });
    return response.data;
  },

  /**
   * Get user subscriptions
   */
  getSubscriptions: async (userId) => {
    const response = await api.get(`/notifications/subscriptions/${userId}`);
    return response.data;
  },
};

export default notificationApi;
