import React, { forwardRef, useState } from 'react';

const Input = forwardRef(({
  label,
  error,
  hint,
  icon,
  iconPosition = 'left',
  type = 'text',
  className = '',
  containerClassName = '',
  required = false,
  disabled = false,
  success = false,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  const baseInputStyles = `
    w-full px-4 py-2.5 rounded-lg border transition-all duration-200
    bg-white dark:bg-slate-800 
    text-slate-900 dark:text-white
    placeholder:text-slate-400 dark:placeholder:text-slate-500
    focus:outline-none focus:ring-2 focus:ring-offset-0
    disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-50 dark:disabled:bg-slate-900
  `;

  const stateStyles = error
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
    : success
    ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20'
    : 'border-slate-200 dark:border-slate-700 focus:border-rose-500 focus:ring-rose-500/20';

  const iconStyles = icon ? (iconPosition === 'left' ? 'pl-11' : 'pr-11') : '';
  const passwordIconStyles = isPassword ? 'pr-11' : '';

  return (
    <div className={`space-y-1.5 ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${iconPosition === 'left' ? 'left-3.5' : 'right-3.5'}`}>
            {icon}
          </div>
        )}

        <input
          ref={ref}
          type={inputType}
          disabled={disabled}
          className={`${baseInputStyles} ${stateStyles} ${iconStyles} ${passwordIconStyles} ${className}`}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        )}

        {success && !error && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-green-500">
            <CheckIcon />
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <ErrorIcon />
          {error}
        </p>
      )}

      {hint && !error && (
        <p className="text-sm text-slate-500 dark:text-slate-400">{hint}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

// Icon Components
const EyeIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const ErrorIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// Select Component
export const Select = forwardRef(({
  label,
  error,
  hint,
  options = [],
  placeholder = 'Select an option',
  required = false,
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  const baseStyles = `
    w-full px-4 py-2.5 rounded-lg border transition-all duration-200
    bg-white dark:bg-slate-800 
    text-slate-900 dark:text-white
    focus:outline-none focus:ring-2 focus:ring-offset-0
    disabled:opacity-50 disabled:cursor-not-allowed
    appearance-none cursor-pointer
  `;

  const stateStyles = error
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
    : 'border-slate-200 dark:border-slate-700 focus:border-rose-500 focus:ring-rose-500/20';

  return (
    <div className={`space-y-1.5 ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <select
          ref={ref}
          className={`${baseStyles} ${stateStyles} pr-10 ${className}`}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <ErrorIcon />
          {error}
        </p>
      )}

      {hint && !error && (
        <p className="text-sm text-slate-500 dark:text-slate-400">{hint}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

// Textarea Component
export const Textarea = forwardRef(({
  label,
  error,
  hint,
  required = false,
  className = '',
  containerClassName = '',
  rows = 4,
  ...props
}, ref) => {
  const baseStyles = `
    w-full px-4 py-2.5 rounded-lg border transition-all duration-200
    bg-white dark:bg-slate-800 
    text-slate-900 dark:text-white
    placeholder:text-slate-400 dark:placeholder:text-slate-500
    focus:outline-none focus:ring-2 focus:ring-offset-0
    disabled:opacity-50 disabled:cursor-not-allowed
    resize-none
  `;

  const stateStyles = error
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
    : 'border-slate-200 dark:border-slate-700 focus:border-rose-500 focus:ring-rose-500/20';

  return (
    <div className={`space-y-1.5 ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <textarea
        ref={ref}
        rows={rows}
        className={`${baseStyles} ${stateStyles} ${className}`}
        {...props}
      />

      {error && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <ErrorIcon />
          {error}
        </p>
      )}

      {hint && !error && (
        <p className="text-sm text-slate-500 dark:text-slate-400">{hint}</p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Input;
