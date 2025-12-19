/**
 * Product-wide configuration for copy, limits, and expiry windows.
 * Centralizes language and behavioural constants so we can adjust them in one place.
 */

export const DEAL_LIMITS = {
  TOTAL_MIN: 50_000,
  TOTAL_MAX: 500_000,
};

export const EXPIRY = {
  offerHours: 24,
  resultDays: 7,
};


export const RESULT_CONFIG = {
  success: {
    emoji: '✅',
    color: 'text-emerald-600',
    bgRing: 'ring-emerald-100',
    title: 'You have a deal',
    line: 'We split the difference.',
    actionIcon: '🔄',
  },
  close: {
    emoji: '🤏',
    color: 'text-amber-600',
    bgRing: 'ring-amber-100',
    title: "You're close",
    line: "Talk through the gap.",
    actionIcon: '💬',
  },
  fail: {
    emoji: '❌',
    color: 'text-rose-600',
    bgRing: 'ring-rose-100',
    title: 'No match',
    line: 'Your ranges are too far apart.',
    actionIcon: '🔍',
  },
};



