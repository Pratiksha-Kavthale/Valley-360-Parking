import React from 'react';

const sizes = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl',
  '2xl': 'w-20 h-20 text-2xl',
};

const Avatar = ({
  src,
  alt = '',
  name = '',
  size = 'md',
  className = '',
  status,
  statusPosition = 'bottom-right',
  ...props
}) => {
  // Generate initials from name
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  // Generate a consistent color based on name
  const getColor = (name) => {
    const colors = [
      'bg-rose-500',
      'bg-orange-500',
      'bg-amber-500',
      'bg-emerald-500',
      'bg-teal-500',
      'bg-cyan-500',
      'bg-blue-500',
      'bg-indigo-500',
      'bg-violet-500',
      'bg-purple-500',
      'bg-pink-500',
    ];
    
    if (!name) return colors[0];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-slate-400',
    busy: 'bg-red-500',
    away: 'bg-yellow-500',
  };

  const statusPositions = {
    'top-right': 'top-0 right-0',
    'top-left': 'top-0 left-0',
    'bottom-right': 'bottom-0 right-0',
    'bottom-left': 'bottom-0 left-0',
  };

  const statusSizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4',
    '2xl': 'w-5 h-5',
  };

  return (
    <div className={`relative inline-block ${className}`} {...props}>
      {src ? (
        <img
          src={src}
          alt={alt || name}
          className={`${sizes[size]} rounded-full object-cover ring-2 ring-white dark:ring-slate-800`}
        />
      ) : (
        <div
          className={`
            ${sizes[size]} ${getColor(name)}
            rounded-full flex items-center justify-center
            text-white font-semibold
            ring-2 ring-white dark:ring-slate-800
          `}
        >
          {getInitials(name)}
        </div>
      )}
      
      {status && (
        <span
          className={`
            absolute ${statusPositions[statusPosition]}
            ${statusSizes[size]} ${statusColors[status]}
            rounded-full ring-2 ring-white dark:ring-slate-800
          `}
        />
      )}
    </div>
  );
};

// Avatar Group
export const AvatarGroup = ({ avatars = [], max = 4, size = 'md' }) => {
  const visible = avatars.slice(0, max);
  const remaining = avatars.length - max;

  const overlapSizes = {
    xs: '-ml-2',
    sm: '-ml-2.5',
    md: '-ml-3',
    lg: '-ml-4',
    xl: '-ml-5',
    '2xl': '-ml-6',
  };

  return (
    <div className="flex items-center">
      {visible.map((avatar, index) => (
        <div key={avatar.id || index} className={index > 0 ? overlapSizes[size] : ''}>
          <Avatar {...avatar} size={size} />
        </div>
      ))}
      {remaining > 0 && (
        <div
          className={`
            ${overlapSizes[size]}
            ${sizes[size]}
            rounded-full flex items-center justify-center
            bg-slate-200 dark:bg-slate-700
            text-slate-600 dark:text-slate-300
            font-semibold ring-2 ring-white dark:ring-slate-800
          `}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
};

export default Avatar;
