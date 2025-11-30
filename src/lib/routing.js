/**
 * Routing Module
 * Hash-based routing utilities
 */

/**
 * Parse hash from URL
 */
export function parseHash(hash) {
  const resultMatch = hash.match(/#result=(.+)/);
  const offerMatch = hash.match(/#offer=(.+)/);
  
  if (resultMatch) {
    return { type: 'result', id: resultMatch[1] };
  }
  
  if (offerMatch) {
    return { type: 'offer', id: offerMatch[1] };
  }
  
  return { type: 'company' };
}

/**
 * Navigate to a route
 */
export function navigateTo(route) {
  if (route.type === 'result') {
    window.location.hash = `#result=${route.id}`;
  } else if (route.type === 'offer') {
    window.location.hash = `#offer=${route.id}`;
  } else {
    window.location.hash = '';
  }
}

/**
 * Clear hash and go to home
 */
export function goHome() {
  window.location.hash = '';
  window.location.reload();
}

