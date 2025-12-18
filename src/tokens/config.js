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

export const PRIVACY_COPY = {
  candidateLink:
    'Single-use link. Expires in 24 hours. Your inputs are deleted after the run.',
  companyLink:
    'Works once and expires in 24 hours. Your max is deleted after the run.',
  resultStorage:
    'Stored: status, final number, timestamp. Inputs deleted; result expires in 7 days.',
};

export const RESULT_CONFIG = {
  success: {
    emoji: '✅',
    color: 'text-emerald-600',
    bgRing: 'ring-emerald-100',
    title: 'Deal: Fair split',
    line: 'Ranges overlapped; we split the surplus 50/50.',
    actionIcon: '🔁',
  },
  close: {
    emoji: '🤏',
    color: 'text-amber-600',
    bgRing: 'ring-amber-100',
    title: 'Close gap',
    line: 'Within 10% of the max; start at the midpoint together.',
    actionIcon: '💬',
  },
  fail: {
    emoji: '❌',
    color: 'text-rose-600',
    bgRing: 'ring-rose-100',
    title: 'No deal',
    line: 'Gap is over 10%; we won’t ask either side to stretch.',
    actionIcon: '🔍',
  },
};


