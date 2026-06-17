import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for responsive design breakpoints
 */
const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (e) => setMatches(e.matches);
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
};

export const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState('xs');
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);

  const updateBreakpoint = useCallback(() => {
    const currentWidth = window.innerWidth;
    setWidth(currentWidth);

    if (currentWidth >= breakpoints['2xl']) {
      setBreakpoint('2xl');
    } else if (currentWidth >= breakpoints.xl) {
      setBreakpoint('xl');
    } else if (currentWidth >= breakpoints.lg) {
      setBreakpoint('lg');
    } else if (currentWidth >= breakpoints.md) {
      setBreakpoint('md');
    } else if (currentWidth >= breakpoints.sm) {
      setBreakpoint('sm');
    } else {
      setBreakpoint('xs');
    }
  }, []);

  useEffect(() => {
    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, [updateBreakpoint]);

  return {
    breakpoint,
    width,
    isMobile: breakpoint === 'xs' || breakpoint === 'sm',
    isTablet: breakpoint === 'md',
    isDesktop: breakpoint === 'lg' || breakpoint === 'xl' || breakpoint === '2xl',
    isXs: breakpoint === 'xs',
    isSm: breakpoint === 'sm',
    isMd: breakpoint === 'md',
    isLg: breakpoint === 'lg',
    isXl: breakpoint === 'xl',
    is2xl: breakpoint === '2xl',
  };
};

export default useMediaQuery;
