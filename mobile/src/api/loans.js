import { apiRequest } from './client';

export async function listLoans({ baseUrl, token, chamaId }) {
  return apiRequest({ baseUrl, path: `/api/v1/chamas/${chamaId}/loans`, token });
}

export async function applyLoan({ baseUrl, token, chamaId, principal_amount, interest_rate = '0', term_months = 1 }) {
  return apiRequest({
    baseUrl,
    path: `/api/v1/chamas/${chamaId}/loans`,
    method: 'POST',
    token,
    body: { principal_amount, interest_rate, term_months },
  });
}
