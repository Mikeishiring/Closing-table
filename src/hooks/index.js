/**
 * Custom Hooks
 * Reusable React hooks for common patterns
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { parseHash } from '../lib/routing';
import { 
  clampTotal,
  validateTotal,
} from '../lib/deal-math';
import { 
  createClickSound, 
  createSuccessSound,
  createTensionSound,
  createThunkSound,
  prefersReducedMotion,
} from '../lib/audio';

// Re-export new hooks
export { useHaptics } from './useHaptics';
export { useReducedMotion } from './useReducedMotion';

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

/**
 * Hook for managing a single total compensation control
 */
export function useBudgetControls(initialTotal) {
  const [total, setTotal] = useState(() => clampTotal(initialTotal));
  const [totalError, setTotalError] = useState('');

  // Update total when the single control changes
  const updateTotal = useCallback((newTotal) => {
    const validation = validateTotal(newTotal);
    
    if (!validation.valid) {
      setTotalError(validation.error);
      return;
    }
    
    setTotalError('');
    const clamped = clampTotal(validation.value);
    setTotal(clamped);
  }, []);

  return {
    total,
    totalError,
    updateTotal,
    setTotalError,
  };
}

/**
 * Hook for audio effects
 */
export function useAudio() {
  const clickSound = useRef(null);
  const successSound = useRef(null);
  const tensionSound = useRef(null);
  const thunkSound = useRef(null);
  const reducedMotion = prefersReducedMotion();

  useEffect(() => {
    if (!reducedMotion) {
      try {
        clickSound.current = createClickSound();
        successSound.current = createSuccessSound();
        tensionSound.current = createTensionSound();
        thunkSound.current = createThunkSound();
      } catch (error) {
        console.warn('Audio initialization failed:', error);
      }
    }
  }, [reducedMotion]);

  const playClick = useCallback(() => {
    if (!reducedMotion && clickSound.current) {
      try {
        clickSound.current();
      } catch (error) {
        console.warn('Click sound failed:', error);
      }
    }
  }, [reducedMotion]);

  const playSuccess = useCallback(() => {
    if (!reducedMotion && successSound.current) {
      try {
        successSound.current();
      } catch (error) {
        console.warn('Success sound failed:', error);
      }
    }
  }, [reducedMotion]);

  const playTension = useCallback((progress) => {
    if (!reducedMotion && tensionSound.current) {
      try {
        tensionSound.current.play(progress);
      } catch (error) {
        console.warn('Tension sound failed:', error);
      }
    }
  }, [reducedMotion]);

  const stopTension = useCallback(() => {
    if (!reducedMotion && tensionSound.current) {
      try {
        tensionSound.current.stop();
      } catch (error) {
        console.warn('Stop tension sound failed:', error);
      }
    }
  }, [reducedMotion]);

  const playThunk = useCallback(() => {
    if (!reducedMotion && thunkSound.current) {
      try {
        thunkSound.current();
      } catch (error) {
        console.warn('Thunk sound failed:', error);
      }
    }
  }, [reducedMotion]);

  return {
    playClick,
    playSuccess,
    playTension,
    stopTension,
    playThunk,
  };
}

/**
 * Hook for copy to clipboard with toast
 */
export function useCopyToClipboard() {
  const [showToast, setShowToast] = useState(false);
  const [copyError, setCopyError] = useState('');

  const copy = useCallback(async (text) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      
      setShowToast(true);
      setCopyError('');
      setTimeout(() => setShowToast(false), 3000);
      return true;
    } catch (error) {
      setCopyError('Failed to copy. Please copy manually.');
      return false;
    }
  }, []);

  return { copy, showToast, copyError };
}

