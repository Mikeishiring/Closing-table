/**
 * useHaptics Hook
 * Provides a clean interface for triggering haptic feedback patterns
 * Safe to call on server (no window/navigator references at creation time)
 */

import { useCallback, useMemo } from 'react';
import { triggerHaptic, HAPTIC_PATTERNS } from '../lib/haptics';

/**
 * Hook for triggering haptic feedback
 * @returns {{ pulse: (type: string) => boolean }}
 */
export function useHaptics() {
  /**
   * Trigger a haptic pulse of the specified type
   * @param {'tap' | 'confirm' | 'error' | 'milestone' | 'light' | 'snap'} type
   * @returns {boolean} - Whether the haptic was triggered
   */
  const pulse = useCallback((type = 'tap') => {
    const pattern = HAPTIC_PATTERNS[type] || HAPTIC_PATTERNS.tap;
    return triggerHaptic(pattern);
  }, []);

  return useMemo(() => ({ pulse }), [pulse]);
}

export default useHaptics;







