/**
 * Custom Hooks
 * Reusable React hooks for common patterns
 */

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { parseHash } from '../lib/routing';
import { 
  clampBase, 
  clampEquity, 
  clampBudget, 
  calculateTotal,
  splitBudget,
  validateBase,
  validateEquity,
  validateTotal,
} from '../lib/deal-math';
import { 
  createClickSound, 
  createSuccessSound,
  createTensionSound,
  createThunkSound,
  prefersReducedMotion,
} from '../lib/audio';

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
 * Hook for managing budget controls (base, equity, total)
 */
export function useBudgetControls(initialTotal, equityDefault = false) {
  const [equityEnabled, setEquityEnabled] = useState(equityDefault);
  const [total, setTotal] = useState(initialTotal);
  
  // Calculate base and equity from total
  const { base: initialBase, equity: initialEquity } = useMemo(
    () => splitBudget(total, equityEnabled),
    [total, equityEnabled]
  );
  
  const [base, setBase] = useState(initialBase);
  const [equity, setEquity] = useState(initialEquity);
  const [baseError, setBaseError] = useState('');
  const [equityError, setEquityError] = useState('');
  const [totalError, setTotalError] = useState('');

  // Update total when base or equity changes
  const updateTotal = useCallback((newTotal) => {
    const validation = validateTotal(newTotal);
    
    if (!validation.valid) {
      setTotalError(validation.error);
      return;
    }
    
    setTotalError('');
    const clamped = clampBudget(validation.value);
    setTotal(clamped);
    
    // Recalculate base/equity split
    const split = splitBudget(clamped, equityEnabled);
    setBase(split.base);
    setEquity(split.equity);
  }, [equityEnabled]);

  // Update base salary
  const updateBase = useCallback((newBase) => {
    const validation = validateBase(newBase);
    
    if (!validation.valid) {
      setBaseError(validation.error);
      return;
    }
    
    setBaseError('');
    const clamped = clampBase(validation.value);
    setBase(clamped);
    setTotal(calculateTotal(clamped, equity));
  }, [equity]);

  // Update equity
  const updateEquity = useCallback((newEquity) => {
    const validation = validateEquity(newEquity);
    
    if (!validation.valid) {
      setEquityError(validation.error);
      return;
    }
    
    setEquityError('');
    const clamped = clampEquity(validation.value);
    setEquity(clamped);
    setTotal(calculateTotal(base, clamped));
  }, [base]);

  // Toggle equity
  const toggleEquity = useCallback(() => {
    setEquityEnabled(prev => {
      const next = !prev;
      if (!next) {
        // When disabling equity, move it all to base
        setEquity(0);
        setTotal(base);
      } else {
        // When enabling, split current total
        const split = splitBudget(total, true);
        setBase(split.base);
        setEquity(split.equity);
      }
      return next;
    });
  }, [base, total]);

  return {
    base,
    equity,
    total,
    equityEnabled,
    baseError,
    equityError,
    totalError,
    setEquityEnabled: toggleEquity,
    updateTotal,
    updateBase,
    updateEquity,
    setBaseError,
    setEquityError,
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

