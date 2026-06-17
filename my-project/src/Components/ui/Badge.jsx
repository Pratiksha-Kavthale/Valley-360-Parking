import React from 'react';

const variants = {
  default: 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300',
  primary: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300',
  success: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  warning: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
  danger: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  outline: 'border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300',
};

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1 text-sm',
};

const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  removable = false,
  onRemove,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center gap-1.5 font-medium rounded-full transition-colors';

  return (
    <span className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${
          variant === 'success' ? 'bg-green-500' :
          variant === 'danger' ? 'bg-red-500' :
          variant === 'warning' ? 'bg-yellow-500' :
          variant === 'info' ? 'bg-blue-500' :
          variant === 'primary' ? 'bg-rose-500' :
          'bg-slate-500'
        }`} />
      )}
      {children}
      {removable && (
        <button
          onClick={onRemove}
          className="ml-0.5 p-0.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  );
};

// Status Badge with predefined states
export const StatusBadge = ({ status }) => {
  const statusConfig = {
    active: { variant: 'success', label: 'Active', dot: true },
    inactive: { variant: 'default', label: 'Inactive', dot: true },
    pending: { variant: 'warning', label: 'Pending', dot: true },
    confirmed: { variant: 'success', label: 'Confirmed', dot: true },
    cancelled: { variant: 'danger', label: 'Cancelled', dot: true },
    completed: { variant: 'info', label: 'Completed', dot: true },
    available: { variant: 'success', label: 'Available', dot: true },
    occupied: { variant: 'danger', label: 'Occupied', dot: true },
    reserved: { variant: 'warning', label: 'Reserved', dot: true },
    paid: { variant: 'success', label: 'Paid' },
    unpaid: { variant: 'danger', label: 'Unpaid' },
  };

  const config = statusConfig[status?.toLowerCase()] || { variant: 'default', label: status };

  return (
    <Badge variant={config.variant} dot={config.dot}>
      {config.label}
    </Badge>
  );
};

export default Badge;
