import React from 'react';

const sizes = {
  xs: 'w-4 h-4',
  sm: 'w-5 h-5',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

const Spinner = ({ size = 'md', color = 'primary', className = '' }) => {
  const colors = {
    primary: 'text-rose-500',
    secondary: 'text-slate-500',
    white: 'text-white',
    current: 'text-current',
  };

  return (
    <svg
      className={`animate-spin ${sizes[size]} ${colors[color]} ${className}`}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
};

// Loading Overlay
export const LoadingOverlay = ({ loading, children, blur = true }) => {
  if (!loading) return children;

  return (
    <div className="relative">
      {children}
      <div className={`absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-slate-800/70 ${blur ? 'backdrop-blur-sm' : ''} rounded-lg z-10`}>
        <Spinner size="lg" />
      </div>
    </div>
  );
};

// Full Page Loader
export const PageLoader = ({ message = 'Loading...' }) => (
  <div className="fixed inset-0 bg-white dark:bg-slate-900 flex items-center justify-center z-50">
    <div className="text-center">
      <Spinner size="xl" />
      <p className="mt-4 text-slate-600 dark:text-slate-400 font-medium">{message}</p>
    </div>
  </div>
);

// Skeleton Loader
export const Skeleton = ({ className = '', variant = 'text', animation = true }) => {
  const variants = {
    text: 'h-4 rounded',
    title: 'h-6 rounded',
    avatar: 'w-10 h-10 rounded-full',
    thumbnail: 'w-16 h-16 rounded-lg',
    card: 'h-32 rounded-xl',
    button: 'h-10 w-24 rounded-lg',
  };

  return (
    <div
      className={`
        bg-slate-200 dark:bg-slate-700
        ${variants[variant]}
        ${animation ? 'animate-pulse' : ''}
        ${className}
      `}
    />
  );
};

// Skeleton Card
export const SkeletonCard = () => (
  <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
    <div className="flex items-start gap-4">
      <Skeleton variant="avatar" />
      <div className="flex-1 space-y-2">
        <Skeleton variant="title" className="w-1/3" />
        <Skeleton variant="text" className="w-2/3" />
      </div>
    </div>
    <div className="mt-4 space-y-2">
      <Skeleton variant="text" />
      <Skeleton variant="text" className="w-5/6" />
      <Skeleton variant="text" className="w-4/6" />
    </div>
    <div className="mt-4 flex gap-2">
      <Skeleton variant="button" />
      <Skeleton variant="button" />
    </div>
  </div>
);

export default Spinner;
