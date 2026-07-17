const DEFAULT_API_BASE_URL = '/api';

function normalizeApiBaseUrl(value) {
  const candidate = String(value || DEFAULT_API_BASE_URL).trim().replace(/\/+$/, '');

  if (!candidate) {
    return DEFAULT_API_BASE_URL;
  }

  if (candidate === DEFAULT_API_BASE_URL || candidate.endsWith('/api')) {
    return candidate;
  }

  return `${candidate}/api`;
}

export const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_URL);

export function buildApiUrl(endpoint, params = {}) {
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const rawUrl = `${API_BASE_URL}${path}`;
  const isAbsolute = /^https?:\/\//i.test(rawUrl);
  const url = new URL(rawUrl, isAbsolute ? undefined : window.location.origin);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  });

  return isAbsolute ? url.toString() : `${url.pathname}${url.search}`;
}