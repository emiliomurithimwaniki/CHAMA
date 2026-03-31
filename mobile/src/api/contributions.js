import { apiRequest } from './client';

export async function listContributions({ baseUrl, token, chamaId }) {
  return apiRequest({ baseUrl, path: `/api/v1/chamas/${chamaId}/contributions`, token });
}

export async function addContribution({ baseUrl, token, chamaId, amount }) {
  return apiRequest({
    baseUrl,
    path: `/api/v1/chamas/${chamaId}/contributions`,
    method: 'POST',
    token,
    body: { amount },
  });
}
