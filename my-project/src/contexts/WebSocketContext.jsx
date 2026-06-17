import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { notificationApi, NOTIFICATION_TYPES } from '../api/notification.api';

// WebSocket Notification Context
const WebSocketContext = createContext(null);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

// Live Notification Context
const LiveNotificationContext = createContext(null);

export const useLiveNotifications = () => {
  const context = useContext(LiveNotificationContext);
  if (!context) {
    throw new Error('useLiveNotifications must be used within a LiveNotificationProvider');
  }
  return context;
};

// WebSocket Provider Component
export const WebSocketProvider = ({ children, userId }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;

  const connect = useCallback(() => {
    if (!userId) return;

    try {
      notificationApi.connect(
        userId,
        // onMessage
        (notification) => {
          console.log('Received notification:', notification);
          handleNotification(notification);
        },
        // onConnect
        () => {
          setIsConnected(true);
          setConnectionError(null);
          reconnectAttemptsRef.current = 0;
          console.log('WebSocket connected');
        },
        // onDisconnect
        (event) => {
          setIsConnected(false);
          if (event.code !== 1000) {
            scheduleReconnect();
          }
        },
        // onError
        (error) => {
          console.error('WebSocket error:', error);
          setConnectionError('Connection error');
        }
      );
    } catch (error) {
      console.error('Failed to connect:', error);
      setConnectionError('Failed to connect');
    }
  }, [userId]);

  const disconnect = useCallback(() => {
    notificationApi.disconnect();
    setIsConnected(false);
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
  }, []);

  const scheduleReconnect = useCallback(() => {
    if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
      setConnectionError('Max reconnection attempts reached');
      return;
    }

    reconnectAttemptsRef.current++;
    const delay = Math.min(3000 * reconnectAttemptsRef.current, 15000);
    
    reconnectTimeoutRef.current = setTimeout(() => {
      console.log(`Reconnecting... Attempt ${reconnectAttemptsRef.current}`);
      connect();
    }, delay);
  }, [connect]);

  const handleNotification = useCallback((notification) => {
    // Show toast based on notification type
    const { type, title, message, data } = notification;

    switch (type) {
      case NOTIFICATION_TYPES.BOOKING_CONFIRMED:
        toast.success(message || 'Your booking has been confirmed!', {
          icon: '✅',
          autoClose: 5000,
        });
        break;

      case NOTIFICATION_TYPES.SLOT_RESERVED:
        toast.info(message || 'Parking slot has been reserved!', {
          icon: '🅿️',
          autoClose: 5000,
        });
        break;

      case NOTIFICATION_TYPES.PARKING_AREA_CLOSED:
        toast.warning(message || 'A parking area has been closed', {
          icon: '⚠️',
          autoClose: 7000,
        });
        break;

      case NOTIFICATION_TYPES.ADMIN_ANNOUNCEMENT:
        toast.info(message || 'New announcement from admin', {
          icon: '📢',
          autoClose: 10000,
        });
        break;

      case NOTIFICATION_TYPES.PAYMENT_VERIFIED:
        toast.success(message || 'Payment has been verified!', {
          icon: '💳',
          autoClose: 5000,
        });
        break;

      case NOTIFICATION_TYPES.DELETION_WARNING:
        toast.warning(message || 'Resource scheduled for deletion', {
          icon: '🗑️',
          autoClose: 15000,
        });
        break;

      case NOTIFICATION_TYPES.BOOKING_CANCELLED:
        toast.error(message || 'Booking has been cancelled', {
          icon: '❌',
          autoClose: 7000,
        });
        break;

      case NOTIFICATION_TYPES.REVIEW_RECEIVED:
        toast.info(message || 'New review received', {
          icon: '⭐',
          autoClose: 5000,
        });
        break;

      case NOTIFICATION_TYPES.SLOT_AVAILABLE:
        toast.success(message || 'A slot is now available!', {
          icon: '🎉',
          autoClose: 5000,
        });
        break;

      default:
        toast.info(message || title || 'New notification', {
          autoClose: 5000,
        });
    }
  }, []);

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    if (userId) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [userId, connect, disconnect]);

  const value = {
    isConnected,
    connectionError,
    connect,
    disconnect,
    send: notificationApi.send,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

WebSocketProvider.propTypes = {
  children: PropTypes.node.isRequired,
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

// Live Notification Provider with full features
export const LiveNotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  // Get user from session
  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const [notificationsRes, unreadRes] = await Promise.all([
        notificationApi.getNotifications(user.id, 0, 50),
        notificationApi.getUnreadCount(user.id),
      ]);

      setNotifications(notificationsRes?.content || notificationsRes || []);
      setUnreadCount(unreadRes?.count || unreadRes || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Fetch on mount
  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
    }
  }, [user?.id, fetchNotifications]);

  // Add notification (from WebSocket)
  const addNotification = useCallback((notification) => {
    setNotifications((prev) => [notification, ...prev]);
    setUnreadCount((prev) => prev + 1);
  }, []);

  // Mark as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await notificationApi.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return;

    try {
      await notificationApi.markAllAsRead(user.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }, [user?.id]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await notificationApi.deleteNotification(notificationId);
      const notification = notifications.find((n) => n.id === notificationId);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      if (!notification?.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, [notifications]);

  // Clear all
  const clearAll = useCallback(async () => {
    if (!user?.id) return;

    try {
      await notificationApi.clearAllNotifications(user.id);
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }, [user?.id]);

  const value = {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  };

  return (
    <LiveNotificationContext.Provider value={value}>
      <WebSocketProvider userId={user?.id}>
        {children}
      </WebSocketProvider>
    </LiveNotificationContext.Provider>
  );
};

LiveNotificationProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// Notification Bell Component
export const NotificationBell = ({ onClick }) => {
  const { unreadCount } = useLiveNotifications();
  const { isConnected } = useWebSocket();

  return (
    <button
      onClick={onClick}
      className="relative p-2 rounded-full hover:bg-slate-100 transition-colors"
      title={isConnected ? 'Connected' : 'Disconnected'}
    >
      <svg
        className="w-6 h-6 text-slate-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>
      
      {/* Unread badge */}
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}

      {/* Connection indicator */}
      <span
        className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
          isConnected ? 'bg-emerald-500' : 'bg-red-500'
        }`}
      />
    </button>
  );
};

NotificationBell.propTypes = {
  onClick: PropTypes.func,
};

// Notification Panel Component
export const NotificationPanel = ({ isOpen, onClose }) => {
  const { notifications, loading, markAsRead, markAllAsRead, deleteNotification, clearAll } = useLiveNotifications();

  if (!isOpen) return null;

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case NOTIFICATION_TYPES.BOOKING_CONFIRMED:
        return '✅';
      case NOTIFICATION_TYPES.SLOT_RESERVED:
        return '🅿️';
      case NOTIFICATION_TYPES.PARKING_AREA_CLOSED:
        return '⚠️';
      case NOTIFICATION_TYPES.ADMIN_ANNOUNCEMENT:
        return '📢';
      case NOTIFICATION_TYPES.PAYMENT_VERIFIED:
        return '💳';
      case NOTIFICATION_TYPES.DELETION_WARNING:
        return '🗑️';
      case NOTIFICATION_TYPES.BOOKING_CANCELLED:
        return '❌';
      case NOTIFICATION_TYPES.REVIEW_RECEIVED:
        return '⭐';
      case NOTIFICATION_TYPES.SLOT_AVAILABLE:
        return '🎉';
      default:
        return '🔔';
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-4 top-16 w-96 max-h-[80vh] bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800">Notifications</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={markAllAsRead}
              className="text-sm text-rose-500 hover:text-rose-600 font-medium"
            >
              Mark all read
            </button>
            <button
              onClick={onClose}
              className="p-1 hover:bg-slate-100 rounded-full"
            >
              <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-rose-500 border-t-transparent mx-auto" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <span className="text-4xl mb-2 block">🔔</span>
              <p className="text-slate-500">No notifications yet</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors ${
                  !notification.read ? 'bg-rose-50/50' : ''
                }`}
              >
                <div className="flex gap-3">
                  <span className="text-xl">{getNotificationIcon(notification.type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-slate-800 text-sm">{notification.title}</p>
                      <span className="text-xs text-slate-400 whitespace-nowrap">
                        {formatTime(notification.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mt-1 line-clamp-2">{notification.message}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs text-rose-500 hover:text-rose-600"
                        >
                          Mark as read
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="text-xs text-slate-400 hover:text-slate-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-3 border-t border-slate-100 flex justify-between items-center">
            <button
              onClick={clearAll}
              className="text-sm text-slate-500 hover:text-slate-700"
            >
              Clear all
            </button>
            <button
              onClick={() => {/* Navigate to all notifications */}}
              className="text-sm text-rose-500 hover:text-rose-600 font-medium"
            >
              View all
            </button>
          </div>
        )}
      </div>
    </>
  );
};

NotificationPanel.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default LiveNotificationProvider;
