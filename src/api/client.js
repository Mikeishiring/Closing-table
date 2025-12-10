/**
 * API Client Module
 * Centralized API calls with consistent error handling
 */

const API_BASE = (() => {
  // Highest priority: explicitly configured API base
  if (import.meta.env.VITE_API_BASE) return import.meta.env.VITE_API_BASE;

  // If running locally (page served from localhost), talk to local backend
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    const isLocalHost =
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '0.0.0.0';
    if (isLocalHost) return 'http://localhost:3000';
  }

  // Default for hosted builds: use the hosted API
  return 'https://closing-table-backend.onrender.com';
})();

// Optional frontend base for shareable links
const FRONTEND_BASE =
  import.meta.env.VITE_APP_BASE_URL ||
  (typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname.split('#')[0] || '/'}`
    : '');

// Add timeout support
const DEFAULT_TIMEOUT = 10000; // 10 seconds

/**
 * Generic API call wrapper with error handling and timeout
 */
export async function api(path, options = {}) {
  const url = `${API_BASE}${path}`;
  
  const controller = options.signal ? null : new AbortController();
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    signal: options.signal || controller?.signal,
    ...options,
  };

  // Create timeout promise
  const timeoutPromise = new Promise((_, reject) => {
    const timer = setTimeout(() => {
      if (controller) controller.abort();
      reject(new Error('Request timeout'));
    }, DEFAULT_TIMEOUT);
    // Clear timer when request completes/aborts
    if (config.signal) {
      config.signal.addEventListener('abort', () => clearTimeout(timer), { once: true });
    }
  });

  try {
    const fetchPromise = fetch(url, config);
    const res = await Promise.race([fetchPromise, timeoutPromise]);
    let data;

    // Try to parse JSON response
    try {
      data = await res.json();
    } catch {
      // If JSON parse fails and response is not OK, throw generic error
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      return null;
    }

    // If response is not OK, throw with error message from server or generic
    if (!res.ok) {
      throw new Error(data.error || `HTTP ${res.status}: ${res.statusText}`);
    }

    return data;
  } catch (error) {
    // Network errors or fetch failures
    if (error instanceof TypeError) {
      throw new Error('Network error. Please check your connection.');
    }
    throw error;
  }
}

export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export { API_BASE, FRONTEND_BASE, DEFAULT_TIMEOUT };

