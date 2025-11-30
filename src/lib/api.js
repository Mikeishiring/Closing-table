/**
 * API Client Module
 * Centralized API calls with consistent error handling
 */

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

/**
 * Generic API call wrapper with error handling
 */
async function api(path, options = {}) {
  const url = `${API_BASE}${path}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  };

  try {
    const res = await fetch(url, config);
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

/**
 * Create a new offer (Company side)
 */
export async function createOffer(offerData) {
  return api('/api/offers', {
    method: 'POST',
    body: JSON.stringify(offerData),
  });
}

/**
 * Get offer details (Candidate side)
 */
export async function getOffer(offerId) {
  return api(`/api/offers/${offerId}`);
}

/**
 * Submit candidate response
 */
export async function submitResponse(offerId, responseData) {
  return api(`/api/offers/${offerId}/response`, {
    method: 'POST',
    body: JSON.stringify(responseData),
  });
}

/**
 * Get result by ID
 */
export async function getResult(resultId) {
  return api(`/api/results/${resultId}`);
}

/**
 * Validate email format
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Generate shareable link for offer
 */
export function generateOfferLink(offerId) {
  return `${window.location.origin}${window.location.pathname}#offer=${offerId}`;
}

/**
 * Generate shareable link for result
 */
export function generateResultLink(resultId) {
  return `${window.location.origin}${window.location.pathname}#result=${resultId}`;
}

/**
 * Copy text to clipboard (with fallback)
 */
export async function copyToClipboard(text) {
  // Try modern clipboard API first
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return { success: true };
    } catch (error) {
      // Fall through to legacy method
    }
  }

  // Fallback: hidden textarea method
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return { success };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

