import React from 'react';

const variants = {
  primary: 'bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl',
  secondary: 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-white',
  outline: 'border-2 border-rose-500 text-rose-500 hover:bg-rose-500 hover:text-white',
  ghost: 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700',
  danger: 'bg-red-500 hover:bg-red-600 text-white',
  success: 'bg-green-500 hover:bg-green-600 text-white',
  link: 'text-rose-500 hover:text-rose-600 underline-offset-4 hover:underline p-0',
};

const sizes = {
  xs: 'px-2.5 py-1 text-xs',
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
  xl: 'px-6 py-3 text-lg',
  icon: 'p-2',
};

const Button = React.forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  type = 'button',
  ...props
}, ref) => {
  const baseStyles = `
    inline-flex items-center justify-center gap-2 
    font-medium rounded-lg transition-all duration-200 
    focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 
    dark:focus:ring-offset-slate-900
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    active:scale-[0.98]
  `;

  const widthStyles = fullWidth ? 'w-full' : '';

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyles} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <Spinner size={size} />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="flex-shrink-0">{icon}</span>}
          {children}
          {icon && iconPosition === 'right' && <span className="flex-shrink-0">{icon}</span>}
        </>
      )}
    </button>
  );
});

Button.displayName = 'Button';

// Loading Spinner Component
const Spinner = ({ size = 'md' }) => {
  const spinnerSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6',
    icon: 'w-4 h-4',
  };

  return (
    <svg
      className={`animate-spin ${spinnerSizes[size]}`}
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

export default Button;
export { Spinner };
