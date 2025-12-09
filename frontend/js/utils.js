/**
 * Utility Functions Module
 * Common helper functions used across the application
 */

const Utils = {
    /**
     * Format a number as currency
     * @param {number} value - The number to format
     * @returns {string} Formatted currency string
     */
    formatCurrency: (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    },
    
    /**
     * Format a number with locale separators
     * @param {number} value - The number to format
     * @returns {string} Formatted number string
     */
    formatNumber: (value) => {
        return value.toLocaleString('en-US');
    },
    
    /**
     * Parse a formatted currency/number string back to a number
     * @param {string} str - The string to parse
     * @returns {number} Parsed number
     */
    parseFormattedNumber: (str) => {
        return parseInt(str.replace(/[^0-9]/g, ''), 10) || 0;
    },
    
    /**
     * Clamp a value between min and max
     * @param {number} value - Value to clamp
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} Clamped value
     */
    clamp: (value, min, max) => {
        return Math.max(min, Math.min(max, value));
    },
    
    /**
     * Generate a unique ID
     * @param {string} prefix - Optional prefix for the ID
     * @returns {string} Unique ID
     */
    generateId: (prefix = '') => {
        const id = Math.random().toString(36).slice(2, 10);
        return prefix ? `${prefix}_${id}` : id;
    },
    
    /**
     * Copy text to clipboard with fallback
     * @param {string} text - Text to copy
     * @returns {Promise<boolean>} Success status
     */
    copyToClipboard: async (text) => {
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(text);
                return true;
            }
        } catch (err) {
            console.warn('Clipboard API failed, trying fallback:', err);
        }
        
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        textarea.setAttribute('aria-hidden', 'true');
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        
        try {
            document.execCommand('copy');
            document.body.removeChild(textarea);
            return true;
        } catch (err) {
            console.error('Could not copy text:', err);
            document.body.removeChild(textarea);
            return false;
        }
    },
    
    /**
     * Debounce a function
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in ms
     * @returns {Function} Debounced function
     */
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    /**
     * Format a date for display
     * @param {number|Date} date - Date to format
     * @returns {string} Formatted date string
     */
    formatDate: (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    },
    
    /**
     * Log an analytics event (stub for future implementation)
     * @param {string} type - Event type
     * @param {Object} payload - Event payload
     */
    logEvent: (type, payload = {}) => {
        const event = {
            type,
            timestamp: new Date().toISOString(),
            ...payload,
        };
        console.log('[analytics]', event);
        // Future: Send to analytics service
    },
};

// Export for global access
window.Utils = Utils;



