import { api, FRONTEND_BASE } from './client';

export async function getResult(resultId, options = {}) {
  return api(`/api/results/${resultId}`, options);
}

export function generateResultLink(resultId) {
  const base = FRONTEND_BASE || (typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}`
    : '');
  return `${base}#result=${resultId}`;
}


