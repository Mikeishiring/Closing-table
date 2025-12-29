/**
 * API Client Module
 * Centralized API calls with consistent error handling
 */

const API_BASE = (() => {
  // Highest priority: explicitly configured API base
  if (import.meta.env.VITE_API_BASE) {
    console.log('[API Client] Using VITE_API_BASE:', import.meta.env.VITE_API_BASE);
    return import.meta.env.VITE_API_BASE;
  }

  // If running locally (page served from localhost), talk to local backend
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    const isLocalHost =
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '0.0.0.0';
    if (isLocalHost) {
      console.log('[API Client] Localhost detected, using http://localhost:3001');
      return 'http://localhost:3001';
    }
  }

  // Default for hosted builds: use the hosted API
  console.log('[API Client] Using production API');
  return 'https://closing-table-backend.onrender.com';
})();

// Optional frontend base for shareable links
const FRONTEND_BASE =
  import.meta.env.VITE_APP_BASE_URL ||
  (typeof window !== 'undefined'
    ? (() => {
        // Get the full URL path without hash
        const pathname = window.location.pathname;
        // Remove index.html if present to get clean base path
        const cleanPath = pathname.endsWith('index.html') 
          ? pathname.slice(0, -'index.html'.length)
          : pathname.endsWith('/')
          ? pathname
          : pathname + '/';
        return `${window.location.origin}${cleanPath}`;
      })()
    : '');

// Add timeout support - increased for cold starts on hosted services
const DEFAULT_TIMEOUT = 30000; // 30 seconds

/**
 * Generic API call wrapper with error handling and timeout
 */
export async function api(path, options = {}) {
  const url = `${API_BASE}${path}`;
  console.log('[API Client] Making request to:', url);
  
  const controller = options.signal ? null : new AbortController();
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    signal: options.signal || controller?.signal,
    ...options,
  };

  // Create timeout promise with proper abort reason
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      if (controller) {
        controller.abort('Request timeout - the server took too long to respond');
      }
      reject(new Error('Request timeout - the server took too long to respond. The backend may be starting up.'));
    }, DEFAULT_TIMEOUT);
  });

  try {
    const fetchPromise = fetch(url, config);
    const res = await Promise.race([fetchPromise, timeoutPromise]);
    
    // Clear timeout if request completed successfully
    if (timeoutId) clearTimeout(timeoutId);
    
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
    // Clear timeout on error
    if (timeoutId) clearTimeout(timeoutId);
    
    // Handle abort errors with better messaging
    if (error.name === 'AbortError') {
      throw new Error('Request was cancelled. The server may be starting up - please try again.');
    }
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


