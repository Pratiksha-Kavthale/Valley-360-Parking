import React from 'react';

const Card = ({
  children,
  className = '',
  padding = 'md',
  hover = false,
  onClick,
  ...props
}) => {
  const paddingSizes = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const baseStyles = `
    bg-white dark:bg-slate-800 
    rounded-2xl border border-slate-200 dark:border-slate-700
    shadow-sm
    transition-all duration-200
  `;

  const hoverStyles = hover || onClick
    ? 'hover:shadow-lg hover:border-rose-200 dark:hover:border-rose-800 cursor-pointer'
    : '';

  return (
    <div
      className={`${baseStyles} ${paddingSizes[padding]} ${hoverStyles} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      {...props}
    >
      {children}
    </div>
  );
};

// Card Header
Card.Header = ({ children, className = '', action }) => (
  <div className={`flex items-center justify-between mb-4 ${className}`}>
    <div>{children}</div>
    {action && <div>{action}</div>}
  </div>
);

// Card Title
Card.Title = ({ children, className = '', subtitle }) => (
  <div className={className}>
    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{children}</h3>
    {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
  </div>
);

// Card Body
Card.Body = ({ children, className = '' }) => (
  <div className={className}>{children}</div>
);

// Card Footer
Card.Footer = ({ children, className = '', border = true }) => (
  <div className={`mt-4 pt-4 ${border ? 'border-t border-slate-200 dark:border-slate-700' : ''} ${className}`}>
    {children}
  </div>
);

// Stats Card
export const StatsCard = ({ title, value, icon, change, changeType = 'neutral', className = '' }) => {
  const changeColors = {
    positive: 'text-green-500 bg-green-50 dark:bg-green-900/30',
    negative: 'text-red-500 bg-red-50 dark:bg-red-900/30',
    neutral: 'text-slate-500 bg-slate-50 dark:bg-slate-700/50',
  };

  return (
    <Card className={className}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
          {change && (
            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full mt-2 ${changeColors[changeType]}`}>
              {changeType === 'positive' && (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              )}
              {changeType === 'negative' && (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              )}
              {change}
            </span>
          )}
        </div>
        {icon && (
          <div className="p-3 bg-gradient-to-br from-rose-100 to-orange-100 dark:from-rose-900/30 dark:to-orange-900/30 rounded-xl text-rose-500">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};

// Feature Card
export const FeatureCard = ({ icon, title, description, onClick, className = '' }) => (
  <Card hover onClick={onClick} className={className}>
    <div className="flex items-start gap-4">
      <div className="p-3 bg-gradient-to-br from-rose-100 to-orange-100 dark:from-rose-900/30 dark:to-orange-900/30 rounded-xl text-rose-500 flex-shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{description}</p>
      </div>
    </div>
  </Card>
);

export default Card;
