/**
 * Haptics Utility Module
 * Provides tactile feedback on supported devices with reduced motion support
 */

/**
 * Check if user prefers reduced motion
 * Safe to call on server (returns false)
 */
function prefersReducedMotion() {
  if (typeof window === 'undefined') {
    return false;
  }
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  return mediaQuery.matches;
}

/**
 * Check if haptic feedback is supported
 * Safe to call on server (returns false)
 */
export function supportsHaptics() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }
  return 'vibrate' in navigator;
}

/**
 * Haptic vibration patterns (in milliseconds)
 * Each pattern is optimized for different feedback types
 */
export const HAPTIC_PATTERNS = {
  // Single short tap - button press, light interaction
  tap: 12,
  // Double-pulse confirmation - success, completion
  confirm: [18, 40, 18],
  // Triple error pulse - validation error, failure
  error: [24, 24, 24],
  // Quick subtle bump - crossing milestones, snap points
  milestone: [10, 30, 10],
  // Very light touch - slider movement
  light: 4,
  // Satisfying snap feedback
  snap: 8,
};

/**
 * Trigger a haptic vibration pattern
 * No-ops safely if unsupported or if reduced motion is preferred
 * 
 * @param {number | number[]} pattern - Vibration pattern in ms
 * @returns {boolean} - Whether vibration was triggered
 */
export function triggerHaptic(pattern) {
  // Check for browser environment
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }
  
  // Respect reduced motion preference
  if (prefersReducedMotion()) {
    return false;
  }
  
  // Check for vibration support
  if (!supportsHaptics()) {
    return false;
  }
  
  try {
    navigator.vibrate(pattern);
    return true;
  } catch (e) {
    console.warn('Haptic feedback failed:', e);
    return false;
  }
}

/**
 * Cancel any ongoing vibration
 */
export function cancelHaptic() {
  if (supportsHaptics()) {
    try {
      navigator.vibrate(0);
    } catch (e) {
      // Silently fail
    }
  }
}





