import React, { createContext, useContext, useState, useCallback } from 'react';
import { generateId } from '../utils/helpers';

const NotificationContext = createContext(null);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

const DEFAULT_DURATION = 5000;

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const addNotification = useCallback(({ type, title, message, duration = DEFAULT_DURATION, action }) => {
    const id = generateId();
    
    const notification = {
      id,
      type,
      title,
      message,
      action,
      timestamp: Date.now(),
    };

    setNotifications((prev) => [...prev, notification]);

    if (duration > 0) {
      setTimeout(() => removeNotification(id), duration);
    }

    return id;
  }, [removeNotification]);

  const success = useCallback((message, options = {}) => {
    return addNotification({
      type: NOTIFICATION_TYPES.SUCCESS,
      title: options.title || 'Success',
      message,
      ...options,
    });
  }, [addNotification]);

  const error = useCallback((message, options = {}) => {
    return addNotification({
      type: NOTIFICATION_TYPES.ERROR,
      title: options.title || 'Error',
      message,
      duration: options.duration ?? 7000, // Errors stay longer
      ...options,
    });
  }, [addNotification]);

  const warning = useCallback((message, options = {}) => {
    return addNotification({
      type: NOTIFICATION_TYPES.WARNING,
      title: options.title || 'Warning',
      message,
      ...options,
    });
  }, [addNotification]);

  const info = useCallback((message, options = {}) => {
    return addNotification({
      type: NOTIFICATION_TYPES.INFO,
      title: options.title || 'Info',
      message,
      ...options,
    });
  }, [addNotification]);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const value = {
    notifications,
    addNotification,
    removeNotification,
    success,
    error,
    warning,
    info,
    clearAll,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer notifications={notifications} onRemove={removeNotification} />
    </NotificationContext.Provider>
  );
};

// Notification Container Component
const NotificationContainer = ({ notifications, onRemove }) => {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
};

// Individual Notification Item
const NotificationItem = ({ notification, onRemove }) => {
  const { id, type, title, message, action } = notification;

  const typeStyles = {
    success: 'bg-green-50 dark:bg-green-900/30 border-green-500 text-green-800 dark:text-green-200',
    error: 'bg-red-50 dark:bg-red-900/30 border-red-500 text-red-800 dark:text-red-200',
    warning: 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-500 text-yellow-800 dark:text-yellow-200',
    info: 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-800 dark:text-blue-200',
  };

  const icons = {
    success: (
      <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  return (
    <div
      className={`animate-slide-in-right border-l-4 rounded-lg p-4 shadow-lg backdrop-blur-sm ${typeStyles[type]}`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">{icons[type]}</div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">{title}</p>
          <p className="text-sm opacity-90 mt-0.5">{message}</p>
          {action && (
            <button
              onClick={action.onClick}
              className="mt-2 text-sm font-medium underline hover:no-underline"
            >
              {action.label}
            </button>
          )}
        </div>
        <button
          onClick={() => onRemove(id)}
          className="flex-shrink-0 p-1 hover:opacity-70 transition-opacity"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default NotificationContext;
