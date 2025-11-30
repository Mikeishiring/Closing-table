/**
 * Deal Math Module
 * Pure functions for compensation calculations, validation, and limits
 */

export const LIMITS = {
  BASE_MIN: 50_000,
  BASE_MAX: 300_000,
  EQUITY_MIN: 0,
  EQUITY_MAX: 200_000,
  TOTAL_MIN: 50_000,
  TOTAL_MAX: 500_000,
};

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
 * Clamp a value within total budget limits
 */
export function clampBudget(value) {
  const { TOTAL_MIN, TOTAL_MAX } = LIMITS;
  return Math.min(TOTAL_MAX, Math.max(TOTAL_MIN, value));
}

/**
 * Clamp base salary within limits
 */
export function clampBase(value) {
  const { BASE_MIN, BASE_MAX } = LIMITS;
  return Math.min(BASE_MAX, Math.max(BASE_MIN, value));
}

/**
 * Clamp equity within limits
 */
export function clampEquity(value) {
  const { EQUITY_MIN, EQUITY_MAX } = LIMITS;
  return Math.min(EQUITY_MAX, Math.max(EQUITY_MIN, value));
}

/**
 * Split total budget into base + equity
 */
export function splitBudget(total, equityEnabled, equityRatio = 0.3) {
  const clamped = clampBudget(total);
  
  if (!equityEnabled) {
    return { base: clamped, equity: 0 };
  }

  const equity = Math.round(clamped * equityRatio);
  const base = clamped - equity;
  
  return { 
    base: clampBase(base), 
    equity: clampEquity(equity) 
  };
}

/**
 * Calculate total from base + equity
 */
export function calculateTotal(base, equity) {
  return base + equity;
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
 * Validate base salary
 */
export function validateBase(value) {
  const num = typeof value === 'string' ? parseCurrency(value) : value;
  
  if (isNaN(num)) {
    return { valid: false, error: 'Please enter a valid number' };
  }
  
  if (num < LIMITS.BASE_MIN) {
    return { valid: false, error: `Minimum base is ${formatCurrency(LIMITS.BASE_MIN)}` };
  }
  
  if (num > LIMITS.BASE_MAX) {
    return { valid: false, error: `Maximum base is ${formatCurrency(LIMITS.BASE_MAX)}` };
  }
  
  return { valid: true, value: num };
}

/**
 * Validate equity
 */
export function validateEquity(value) {
  const num = typeof value === 'string' ? parseCurrency(value) : value;
  
  if (isNaN(num)) {
    return { valid: false, error: 'Please enter a valid number' };
  }
  
  if (num < LIMITS.EQUITY_MIN) {
    return { valid: false, error: `Minimum equity is ${formatCurrency(LIMITS.EQUITY_MIN)}` };
  }
  
  if (num > LIMITS.EQUITY_MAX) {
    return { valid: false, error: `Maximum equity is ${formatCurrency(LIMITS.EQUITY_MAX)}` };
  }
  
  return { valid: true, value: num };
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

/**
 * Calculate scale factor for animations based on total compensation
 */
export function calculateOverlapScale(totalComp) {
  const maxPossible = LIMITS.BASE_MAX + LIMITS.EQUITY_MAX;
  const norm = Math.min(1, Math.max(0, totalComp / maxPossible));
  return 0.98 + norm * 0.18;
}

