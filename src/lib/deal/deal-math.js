/**
 * Deal Math Module
 * Pure functions for compensation calculations, validation, and limits
 */

import { DEAL_LIMITS } from '../../tokens';

export const LIMITS = DEAL_LIMITS;

/**
 * Normalize money input strings with support for k/m suffixes.
 * Returns clamped numeric value within limits and a formatted display string.
 */
export function parseMoneyInput(raw, limits = LIMITS) {
  if (raw === null || raw === undefined) {
    return { value: limits.TOTAL_MIN, display: formatNumber(limits.TOTAL_MIN) };
  }

  const str = raw.toString().trim().toLowerCase().replace(/[$,\s]/g, '');
  const multiplier = str.includes('m') ? 1_000_000 : str.includes('k') ? 1_000 : 1;
  const numeric = parseFloat(str.replace(/[km]/g, ''));
  const parsed = Number.isNaN(numeric) ? limits.TOTAL_MIN : Math.round(numeric * multiplier);
  const value = clampTotal(parsed);
  return { value, display: formatNumber(value) };
}

/**
 * Human-friendly number formatter used for inputs (no currency symbol).
 */
export function formatNumber(value) {
  if (!Number.isFinite(value)) return '';
  return value.toLocaleString('en-US');
}

/**
 * Snap points - market reference values every 50k
 * These create subtle "bumps" that encourage thoughtful selection
 */
export const SNAP_POINTS = [
  50_000, 100_000, 150_000, 200_000, 250_000, 
  300_000, 350_000, 400_000, 450_000, 500_000
];

/**
 * Snap point configuration
 */
export const SNAP_CONFIG = {
  THRESHOLD: 5_000,      // Distance in $ to trigger snap behavior
  FRICTION: 0.4,         // 0-1, how much to slow down near snap points
  NUDGE_STRENGTH: 0.3,   // 0-1, how strongly to nudge toward snap point
};

/**
 * Check if a value is near a snap point
 * @returns {object|null} - { snapPoint, distance, isActive } or null
 */
export function getNearestSnapPoint(value) {
  for (const snapPoint of SNAP_POINTS) {
    const distance = Math.abs(value - snapPoint);
    if (distance < SNAP_CONFIG.THRESHOLD) {
      return {
        snapPoint,
        distance,
        isActive: true,
        // Normalized proximity: 1 at snap point, 0 at threshold edge
        proximity: 1 - (distance / SNAP_CONFIG.THRESHOLD),
      };
    }
  }
  return null;
}

/**
 * Apply snap friction/nudge to a target value
 * Creates the "magnetic" effect near snap points
 */
export function applySnapBehavior(currentValue, targetValue) {
  const snapInfo = getNearestSnapPoint(targetValue);
  
  if (!snapInfo) {
    return { value: targetValue, snapping: false };
  }
  
  const { snapPoint, proximity } = snapInfo;
  
  // Nudge toward snap point based on proximity
  const nudgeFactor = proximity * SNAP_CONFIG.NUDGE_STRENGTH;
  const nudgedValue = targetValue + (snapPoint - targetValue) * nudgeFactor;
  
  return {
    value: Math.round(nudgedValue),
    snapping: true,
    snapPoint,
    proximity,
  };
}

/**
 * Get snap points within a given range (for rendering tick marks)
 */
export function getSnapPointsInRange(min, max) {
  return SNAP_POINTS.filter(point => point >= min && point <= max);
}

/**
 * Calculate snap point position as percentage of range
 */
export function getSnapPointPercent(snapPoint, min, max) {
  return ((snapPoint - min) / (max - min)) * 100;
}

/**
 * Clamp a value within total compensation limits
 */
export function clampTotal(value) {
  const { TOTAL_MIN, TOTAL_MAX } = LIMITS;
  return Math.min(TOTAL_MAX, Math.max(TOTAL_MIN, value));
}

/**
 * Check if company range overlaps with candidate range
 */
export function checkOverlap(companyMin, companyMax, candidateMin, candidateMax) {
  return companyMax >= candidateMin && candidateMax >= companyMin;
}

/**
 * Calculate fair midpoint when ranges overlap
 */
export function calculateMidpoint(companyMax, candidateMin) {
  if (companyMax < candidateMin) {
    return null; // No overlap
  }
  return Math.round((companyMax + candidateMin) / 2);
}

/**
 * Format currency for display
 */
export function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format currency in thousands (e.g., "$90k")
 */
export function formatCurrencyShort(value) {
  const thousands = Math.round(value / 1000);
  return `$${thousands}k`;
}

/**
 * Parse currency string to number
 */
export function parseCurrency(str) {
  const cleaned = str.replace(/[^0-9]/g, '');
  const value = parseInt(cleaned, 10);
  return isNaN(value) ? 0 : value;
}

/**
 * Validate total budget
 */
export function validateTotal(value) {
  const num = typeof value === 'string' ? parseCurrency(value) : value;
  
  if (isNaN(num)) {
    return { valid: false, error: 'Please enter a valid number' };
  }
  
  if (num < LIMITS.TOTAL_MIN) {
    return { valid: false, error: `Minimum total is ${formatCurrency(LIMITS.TOTAL_MIN)}` };
  }
  
  if (num > LIMITS.TOTAL_MAX) {
    return { valid: false, error: `Maximum total is ${formatCurrency(LIMITS.TOTAL_MAX)}` };
  }
  
  return { valid: true, value: num };
}




