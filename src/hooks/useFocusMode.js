import { useEffect, useRef, useCallback } from 'react';

/**
 * Centralized focus-mode toggling to avoid stale body class.
 * Maintains a reference count so multiple components can request focus mode.
 */
export function useFocusMode() {
  const counterRef = useRef(0);

  const enable = useCallback(() => {
    counterRef.current += 1;
    if (counterRef.current === 1) {
      document.body.classList.add('focus-mode');
    }
  }, []);

  const disable = useCallback(() => {
    counterRef.current = Math.max(0, counterRef.current - 1);
    if (counterRef.current === 0) {
      document.body.classList.remove('focus-mode');
    }
  }, []);

  useEffect(() => {
    return () => {
      counterRef.current = 0;
      document.body.classList.remove('focus-mode');
    };
  }, []);

  return { enable, disable };
}


