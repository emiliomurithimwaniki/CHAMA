import { apiRequest } from './client';

export async function listChamas({ baseUrl, token }) {
  return apiRequest({ baseUrl, path: '/api/v1/chamas', token });
}

export async function createChama({ baseUrl, token, name, currency = 'KES' }) {
  return apiRequest({
    baseUrl,
    path: '/api/v1/chamas',
    method: 'POST',
    token,
    body: { name, currency },
  });
}

export async function listChannels({ baseUrl, token, chamaId }) {
  return apiRequest({ baseUrl, path: `/api/v1/chamas/${chamaId}/chat/channels`, token });
}

export async function updateChama({ baseUrl, token, chamaId, name, currency }) {
  return apiRequest({
    baseUrl,
    path: `/api/v1/chamas/${chamaId}`,
    method: 'PATCH',
    token,
    body: { name, currency },
  });
}

export async function listMembers({ baseUrl, token, chamaId }) {
  return apiRequest({ baseUrl, path: `/api/v1/chamas/${chamaId}/members`, token });
}

export async function addMember({ baseUrl, token, chamaId, phone_number, role = 'member' }) {
  return apiRequest({
    baseUrl,
    path: `/api/v1/chamas/${chamaId}/members`,
    method: 'POST',
    token,
    body: { phone_number, role },
  });
}

export async function removeMember({ baseUrl, token, chamaId, userId }) {
  return apiRequest({
    baseUrl,
    path: `/api/v1/chamas/${chamaId}/members/${userId}`,
    method: 'DELETE',
    token,
  });
}

export async function setMemberRole({ baseUrl, token, chamaId, userId, role }) {
  return apiRequest({
    baseUrl,
    path: `/api/v1/chamas/${chamaId}/members/${userId}/role?role=${encodeURIComponent(role)}`,
    method: 'POST',
    token,
  });
}
