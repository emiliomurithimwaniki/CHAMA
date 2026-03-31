import { apiRequest } from './client';

export async function register({ baseUrl, full_name, phone_number, password }) {
  return apiRequest({
    baseUrl,
    path: '/api/v1/auth/register',
    method: 'POST',
    body: { full_name, phone_number, password },
  });
}

export async function login({ baseUrl, phone_number, password }) {
  const form = new URLSearchParams();
  form.append('username', phone_number);
  form.append('password', password);

  const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form.toString(),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error(data?.detail || 'Login failed');
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}
