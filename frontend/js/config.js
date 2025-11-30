/**
 * Application Configuration
 * Centralized constants and configuration values
 * 
 * Note: This file is optional - the main app can work without it.
 * It provides AppConfig object for potential future modularization.
 */

// API Configuration - only define if not already defined
var AppConfig_API_BASE = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000'
    : '';

// Mechanism Constants (mirrored from backend for client-side reference)
const BRIDGE_ZONE_PCT = 0.10;       // 10% gap treated as "close, talk"
const ROUNDING_GRANULARITY = 1000;  // $1,000 rounding

// Form Validation Ranges
const COMPANY_RANGES = {
    BASE_MIN: 50000,
    BASE_MAX: 300000,
    EQUITY_MIN: 0,
    EQUITY_MAX: 200000,
    get TOTAL_MIN() { return this.BASE_MIN; },
    get TOTAL_MAX() { return this.BASE_MAX + this.EQUITY_MAX; }
};

const CANDIDATE_RANGES = {
    BASE_MIN: 80000,
    BASE_MAX: 250000,
    EQUITY_MIN: 0,
    EQUITY_MAX: 150000,
    get TOTAL_MIN() { return this.BASE_MIN; },
    get TOTAL_MAX() { return this.BASE_MAX + this.EQUITY_MAX; }
};

// Status Configuration for Result Display
const STATUS_CONFIG = {
    success: {
        color: 'var(--success-color)',
        colorHex: '#34C759',
        bgClass: 'bg-[#E5F9F0]',
        borderClass: 'border-[#34C759]',
        title: 'Deal Closed',
        subtitle: 'The mechanism found a fair midpoint.',
        icon: 'Handshake',
        emojis: ['✅', '🎯'],
    },
    close: {
        color: 'var(--warning-color)',
        colorHex: '#FF9500',
        bgClass: 'bg-[#FFF5E6]',
        borderClass: 'border-[#FF9500]',
        title: 'Close Gap',
        subtitle: "You're within 10% — a conversation could bridge this gap.",
        icon: 'AlertCircle',
        emojis: ['💬', '🤝'],
    },
    fail: {
        color: 'var(--error-color)',
        colorHex: '#FF3B30',
        bgClass: 'bg-[#FFEBEB]',
        borderClass: 'border-[#FF3B30]',
        title: 'No Deal',
        subtitle: 'Too far apart for a fair midpoint.',
        icon: 'X',
        emojis: ['🗨️', '💬'],
    },
};

// Progress Steps Configuration
const PROGRESS_STEPS = [
    { key: 'setMax', label: 'Set Max' },
    { key: 'sendLink', label: 'Send Link' },
    { key: 'seeResult', label: 'See Result' },
];

// Export for use in other modules
window.AppConfig = {
    API_BASE,
    BRIDGE_ZONE_PCT,
    ROUNDING_GRANULARITY,
    COMPANY_RANGES,
    CANDIDATE_RANGES,
    STATUS_CONFIG,
    PROGRESS_STEPS,
};

