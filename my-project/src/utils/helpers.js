import { PATTERNS, STORAGE_KEYS } from './constants';

/**
 * Format currency in INR
 */
export const formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format date to readable string
 */
export const formatDate = (date, options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  };
  return new Date(date).toLocaleDateString('en-IN', defaultOptions);
};

/**
 * Format date and time
 */
export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format time only
 */
export const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Get relative time (e.g., "2 hours ago")
 */
export const getRelativeTime = (date) => {
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now - then) / 1000);

  if (diffInSeconds < 60) return rtf.format(-diffInSeconds, 'second');
  if (diffInSeconds < 3600) return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
  if (diffInSeconds < 86400) return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
  if (diffInSeconds < 2592000) return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
  return formatDate(date);
};

/**
 * Validate email
 */
export const isValidEmail = (email) => PATTERNS.EMAIL.test(email);

/**
 * Validate phone number
 */
export const isValidPhone = (phone) => PATTERNS.PHONE.test(phone);

/**
 * Validate pincode
 */
export const isValidPincode = (pincode) => PATTERNS.PINCODE.test(pincode);

/**
 * Validate password strength
 */
export const isValidPassword = (password) => PATTERNS.PASSWORD.test(password);

/**
 * Get password strength
 */
export const getPasswordStrength = (password) => {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
  
  if (strength <= 2) return { level: 'weak', color: 'red', percentage: 33 };
  if (strength <= 4) return { level: 'medium', color: 'yellow', percentage: 66 };
  return { level: 'strong', color: 'green', percentage: 100 };
};

/**
 * Decode JWT token
 */
export const decodeToken = (token) => {
  try {
    const payload = token.split('.')[1];
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(normalized));
  } catch (e) {
    return null;
  }
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token) => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  return decoded.exp * 1000 < Date.now();
};

/**
 * Get user from storage
 */
export const getStoredUser = () => {
  try {
    const user = sessionStorage.getItem(STORAGE_KEYS.USER);
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

/**
 * Get token from storage
 */
export const getStoredToken = () => {
  return sessionStorage.getItem(STORAGE_KEYS.JWT_TOKEN) || localStorage.getItem(STORAGE_KEYS.TOKEN);
};

/**
 * Clear auth storage
 */
export const clearAuthStorage = () => {
  sessionStorage.clear();
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Capitalize first letter
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Format vehicle type for display
 */
export const formatVehicleType = (type) => {
  const types = {
    TWO_WHEELER: '🏍️ Two Wheeler',
    FOUR_WHEELER: '🚗 Four Wheeler',
  };
  return types[type] || type;
};

/**
 * Format status for display
 */
export const formatStatus = (status) => {
  const statuses = {
    AVAILABLE: { label: 'Available', color: 'green' },
    NOT_AVAILABLE: { label: 'Not Available', color: 'red' },
    PENDING: { label: 'Pending', color: 'yellow' },
    CONFIRMED: { label: 'Confirmed', color: 'green' },
    CANCELLED: { label: 'Cancelled', color: 'red' },
    COMPLETED: { label: 'Completed', color: 'blue' },
    SUBMITTED: { label: 'Submitted', color: 'yellow' },
    VERIFIED: { label: 'Verified', color: 'green' },
    REJECTED: { label: 'Rejected', color: 'red' },
    EXPIRED: { label: 'Expired', color: 'gray' },
  };
  return statuses[status] || { label: status, color: 'gray' };
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Generate random ID
 */
export const generateId = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

/**
 * Debounce function
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle function
 */
export const throttle = (func, limit = 300) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Deep clone object
 */
export const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

// Validation aliases for convenience
export const validateEmail = isValidEmail;
export const validatePhone = isValidPhone;
export const validatePassword = (password) => {
  const errors = [];
  if (!password || password.length < 8) errors.push('Password must be at least 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('Password must contain an uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('Password must contain a lowercase letter');
  if (!/[0-9]/.test(password)) errors.push('Password must contain a number');
  return { isValid: errors.length === 0, errors };
};

/**
 * Check if object is empty
 */
export const isEmpty = (obj) => {
  if (!obj) return true;
  if (Array.isArray(obj)) return obj.length === 0;
  return Object.keys(obj).length === 0;
};

/**
 * Get initials from name
 */
export const getInitials = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Download file from blob
 */
export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

/**
 * Get greeting based on time of day
 */
export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};
