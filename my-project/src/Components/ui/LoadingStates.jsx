import { motion } from 'framer-motion';

// Skeleton Loader Component
export const Skeleton = ({ className = '', variant = 'rectangular' }) => {
  const baseClasses = 'animate-pulse bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%]';
  const variantClasses = {
    rectangular: 'rounded-lg',
    circular: 'rounded-full',
    text: 'rounded h-4',
  };

  return <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} />;
};

// Loading Spinner Component
export const Spinner = ({ size = 'md', color = 'rose' }) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
    xl: 'w-16 h-16 border-4',
  };

  const colors = {
    rose: 'border-rose-500',
    orange: 'border-orange-500',
    emerald: 'border-emerald-500',
    blue: 'border-blue-500',
    white: 'border-white',
  };

  return (
    <div
      className={`${sizes[size]} ${colors[color]} border-t-transparent rounded-full animate-spin`}
    />
  );
};

// Loading Overlay Component
export const LoadingOverlay = ({ message = 'Loading...' }) => (
  <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-4">
    <Spinner size="lg" />
    <p className="text-slate-600 font-medium">{message}</p>
  </div>
);

// Page Loading Skeleton
export const PageSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 p-8">
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <Skeleton className="h-4 w-24 mb-3" />
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <Skeleton className="h-6 w-48 mb-6" />
            <Skeleton className="h-64 w-full" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Card Skeleton
export const CardSkeleton = ({ count = 1 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-start gap-4">
          <Skeleton className="w-12 h-12 rounded-xl" variant="rectangular" />
          <div className="flex-1">
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2 mb-2" />
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Empty State Component
export const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  actionLabel,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-16 px-4 text-center"
  >
    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
      <Icon className="w-10 h-10 text-slate-400" />
    </div>
    <h3 className="text-xl font-semibold text-slate-800 mb-2">{title}</h3>
    <p className="text-slate-500 max-w-sm mb-6">{description}</p>
    {action && (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={action}
        className="px-6 py-2.5 bg-gradient-to-r from-rose-500 to-orange-500 text-white font-medium rounded-xl shadow-lg shadow-rose-200 hover:shadow-xl transition-all"
      >
        {actionLabel}
      </motion.button>
    )}
  </motion.div>
);

// Glass Card Component
export const GlassCard = ({ children, className = '', hover = true }) => (
  <motion.div
    whileHover={hover ? { y: -4, boxShadow: '0 20px 40px -12px rgba(0,0,0,0.15)' } : {}}
    className={`bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg ${className}`}
  >
    {children}
  </motion.div>
);

// Gradient Card Component
export const GradientCard = ({
  children,
  className = '',
  gradient = 'from-rose-500 to-orange-500',
}) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className={`bg-gradient-to-br ${gradient} rounded-2xl shadow-lg ${className}`}
  >
    {children}
  </motion.div>
);

// Stat Badge Component
export const StatBadge = ({ value, trend = 'up', label }) => {
  const trendColors = {
    up: 'text-emerald-600 bg-emerald-50',
    down: 'text-red-600 bg-red-50',
    neutral: 'text-slate-600 bg-slate-50',
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${trendColors[trend]}`}>
      {trend === 'up' && '↑'}
      {trend === 'down' && '↓'}
      {value}
      {label && <span className="text-slate-400 ml-1">{label}</span>}
    </span>
  );
};

// Progress Bar Component
export const ProgressBar = ({ value, max = 100, color = 'rose', showLabel = true, size = 'md' }) => {
  const percentage = Math.min((value / max) * 100, 100);

  const colors = {
    rose: 'bg-gradient-to-r from-rose-500 to-rose-400',
    orange: 'bg-gradient-to-r from-orange-500 to-orange-400',
    emerald: 'bg-gradient-to-r from-emerald-500 to-emerald-400',
    blue: 'bg-gradient-to-r from-blue-500 to-blue-400',
  };

  const sizes = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className="w-full">
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${sizes[size]}`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={`h-full rounded-full ${colors[color]}`}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between mt-1 text-xs text-slate-500">
          <span>{value}</span>
          <span>{max}</span>
        </div>
      )}
    </div>
  );
};

// Notification Dot Component
export const NotificationDot = ({ count, size = 'md' }) => {
  const sizes = {
    sm: 'w-4 h-4 text-[10px]',
    md: 'w-5 h-5 text-xs',
    lg: 'w-6 h-6 text-sm',
  };

  if (!count || count <= 0) return null;

  return (
    <span
      className={`absolute -top-1 -right-1 ${sizes[size]} bg-rose-500 text-white font-bold rounded-full flex items-center justify-center`}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
};

// Tooltip Component
export const Tooltip = ({ children, content, position = 'top' }) => {
  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div className="relative group">
      {children}
      <div
        className={`absolute ${positions[position]} px-2 py-1 bg-slate-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50`}
      >
        {content}
      </div>
    </div>
  );
};

export default {
  Skeleton,
  Spinner,
  LoadingOverlay,
  PageSkeleton,
  CardSkeleton,
  EmptyState,
  GlassCard,
  GradientCard,
  StatBadge,
  ProgressBar,
  NotificationDot,
  Tooltip,
};
