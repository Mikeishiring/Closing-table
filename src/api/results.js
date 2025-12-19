import { api, FRONTEND_BASE } from './client';

export async function getResult(resultId, options = {}) {
  return api(`/api/results/${resultId}`, options);
}

export function generateResultLink(resultId) {
  return `${FRONTEND_BASE}#result=${resultId}`;
}


