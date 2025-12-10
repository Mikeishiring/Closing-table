import { api, FRONTEND_BASE } from './client';

export async function createOffer(offerData, options = {}) {
  return api('/api/offers', {
    method: 'POST',
    body: JSON.stringify(offerData),
    ...options,
  });
}

export async function getOffer(offerId, options = {}) {
  return api(`/api/offers/${offerId}`, options);
}

export async function submitResponse(offerId, responseData, options = {}) {
  // Backend expects "/submit" (not "/response")
  return api(`/api/offers/${offerId}/submit`, {
    method: 'POST',
    body: JSON.stringify(responseData),
    ...options,
  });
}

export function generateOfferLink(offerId) {
  const base = FRONTEND_BASE || (typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}`
    : '');
  return `${base}#offer=${offerId}`;
}

