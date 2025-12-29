/**
 * Routing Module
 * Hash-based routing utilities
 */

/**
 * Parse hash from URL
 * Returns a normalized route object with graceful fallbacks.
 */
export function parseHash(hash) {
  const raw = (hash || '').trim();
  if (!raw || raw === '#') {
    return { type: 'home' };
  }

  if (raw.startsWith('#result=')) {
    const id = raw.slice('#result='.length);
    return id ? { type: 'result', id } : { type: 'home' };
  }

  if (raw.startsWith('#offer=')) {
    const id = raw.slice('#offer='.length);
    return id ? { type: 'offer', id } : { type: 'home' };
  }

  return { type: 'home' };
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
}

export function goToOffer(id) {
  if (!id) return;
  window.location.hash = `#offer=${id}`;
}

export function goToResult(id) {
  if (!id) return;
  window.location.hash = `#result=${id}`;
}




