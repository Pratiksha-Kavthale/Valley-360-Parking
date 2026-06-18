// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://spirited-essence-production.up.railway.app';

// User Roles
export const ROLES = {
  ADMIN: 'ROLE_ADMIN',
  OWNER: 'ROLE_OWNER',
  CUSTOMER: 'ROLE_CUSTOMER',
};

// Booking Status
export const BOOKING_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
};

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  SUBMITTED: 'SUBMITTED',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED',
  EXPIRED: 'EXPIRED',
};

// Slot Status
export const SLOT_STATUS = {
  AVAILABLE: 'AVAILABLE',
  NOT_AVAILABLE: 'NOT_AVAILABLE',
};

// Vehicle Types
export const VEHICLE_TYPES = {
  TWO_WHEELER: 'TWO_WHEELER',
  FOUR_WHEELER: 'FOUR_WHEELER',
};

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  
  // Customer Routes
  CUSTOMER_DASHBOARD: '/dashboard',
  CUSTOMER_BOOKINGS: '/bookings',
  CUSTOMER_PROFILE: '/profile',
  BOOKING_PAYMENT: '/booking/:bookingId/payment',
  VIEW_SLOTS: '/parking/:parkingId/slots',
  BOOK_SLOT: '/slot/:slotId/book',
  
  // Owner Routes
  OWNER_DASHBOARD: '/owner',
  OWNER_PARKING_AREAS: '/owner/parking-areas',
  OWNER_ADD_AREA: '/owner/parking-areas/new',
  OWNER_EDIT_AREA: '/owner/parking-areas/:areaId/edit',
  OWNER_SLOTS: '/owner/parking-areas/:areaId/slots',
  OWNER_ADD_SLOT: '/owner/parking-areas/:areaId/slots/new',
  OWNER_ANALYTICS: '/owner/analytics',
  OWNER_PAYMENTS: '/owner/payments',
  OWNER_SETTINGS: '/owner/settings',
  
  // Admin Routes
  ADMIN_DASHBOARD: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_OWNERS: '/admin/owners',
  ADMIN_CUSTOMERS: '/admin/customers',
  ADMIN_PARKING_AREAS: '/admin/parking-areas',
  ADMIN_PARKING_SLOTS: '/admin/parking-slots',
  ADMIN_PAYMENTS: '/admin/payments',
  ADMIN_ANALYTICS: '/admin/analytics',
  ADMIN_QR_VALIDATE: '/admin/validate-qr',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  JWT_TOKEN: 'jwtToken',
  USER: 'user',
  ROLE: 'role',
  THEME: 'theme',
  PARKING_AREA: 'parkingArea',
};

// Theme
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
};

// Validation Patterns
export const PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[0-9]{10}$/,
  PINCODE: /^\d{6}$/,
  PASSWORD: /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])(?=.*[0-9]).{8,}$/,
};

// Toast Messages
export const MESSAGES = {
  LOGIN_SUCCESS: 'Welcome back! Login successful.',
  LOGIN_FAILED: 'Invalid email or password.',
  REGISTER_SUCCESS: 'Account created successfully! Please login.',
  REGISTER_FAILED: 'Registration failed. Please try again.',
  LOGOUT_SUCCESS: 'You have been logged out.',
  SESSION_EXPIRED: 'Your session has expired. Please login again.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  BOOKING_SUCCESS: 'Booking confirmed successfully!',
  BOOKING_FAILED: 'Booking failed. Please try again.',
  PAYMENT_SUCCESS: 'Payment submitted successfully!',
  PAYMENT_FAILED: 'Payment failed. Please try again.',
  SLOT_ADDED: 'Parking slot added successfully!',
  AREA_ADDED: 'Parking area added successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  GENERIC_ERROR: 'Something went wrong. Please try again.',
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  LIMITS: [10, 25, 50, 100],
};
