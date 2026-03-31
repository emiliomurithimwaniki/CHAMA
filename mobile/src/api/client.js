import { Platform } from 'react-native';
import Constants from 'expo-constants';

export function getDefaultBaseUrl() {
  const configured = Constants?.expoConfig?.extra?.apiBaseUrl;
  if (configured) return configured;
  // Android emulator uses 10.0.2.2 to reach host machine localhost.
  if (Platform.OS === 'android') return 'http://10.0.2.2:8000';
  return 'http://localhost:8000';
}

export function getApiBaseUrl() {
  const base = getDefaultBaseUrl().replace(/\/+$/, '');
  return `${base}/api/v1`;
}

export async function apiRequest({ baseUrl, path, method = 'GET', token, body, headers = {} }) {
  const url = `${baseUrl}${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (e) {
    data = { raw: text };
  }

  if (!res.ok) {
    const message = data?.detail || data?.message || 'Request failed';
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}
