/**
 * Custom Hooks
 * Reusable React hooks for common patterns
 */

import { useState, useEffect } from 'react';
import { parseHash } from '../routing';

// Re-export specialized hooks
export { useHaptics } from './useHaptics';
export { useReducedMotion } from './useReducedMotion';
export { useFocusMode } from './useFocusMode';

/**
 * Hook for hash-based routing
 */
export function useHashRoute() {
  const [route, setRoute] = useState(() => parseHash(window.location.hash));

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(parseHash(window.location.hash));
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return route;
}


