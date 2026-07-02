const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api').replace(/\/+$/, '');
export const ADMIN_TOKEN_KEY = 'admin_token';
export const ADMIN_SESSION_EXPIRED_EVENT = 'najem-admin-session-expired';

let adminToken = null;

export class AdminApiError extends Error {
  constructor(message, status = 0, details = null) {
    super(message);
    this.name = 'AdminApiError';
    this.status = status;
    this.details = details;
  }
}

export function getAdminToken() {
  return adminToken;
}

export function setAdminToken(token) {
  adminToken = token || null;

  try {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
  } catch {
    // Storage can be unavailable in private or restricted browser contexts.
  }
}

export function clearAdminToken() {
  adminToken = null;

  try {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
  } catch {
    // Storage can be unavailable in private or restricted browser contexts.
  }
}

function buildUrl(endpoint, params = {}) {
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = new URL(`${API_BASE_URL}${path}`);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  });

  return url.toString();
}

function isFormData(body) {
  return typeof FormData !== 'undefined' && body instanceof FormData;
}

function prepareMutationPayload(data, method = 'PUT') {
  if (!isFormData(data)) {
    return { method, body: data };
  }

  if (method === 'PUT') {
    data.set('_method', 'PUT');
    return { method: 'POST', body: data };
  }

  return { method, body: data };
}

async function adminRequest(endpoint, options = {}) {
  const {
    method = 'GET',
    params,
    body,
    auth = true,
    raw = false,
    token = getAdminToken(),
    headers = {},
  } = options;
  const formDataBody = isFormData(body);

  try {
    const response = await fetch(buildUrl(endpoint, params), {
      method,
      headers: {
        Accept: 'application/json',
        ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
        ...(body && !formDataBody ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
      },
      body: body ? (formDataBody ? body : JSON.stringify(body)) : undefined,
    });

    const payload = await response.json().catch(() => null);
    const message = payload?.message || `Admin API request failed with status ${response.status}`;

    if (!response.ok || payload?.success === false) {
      if (auth && (response.status === 401 || response.status === 403)) {
        clearAdminToken();
        window.dispatchEvent(new Event(ADMIN_SESSION_EXPIRED_EVENT));
      }

      throw new AdminApiError(message, response.status, payload?.errors || payload);
    }

    return raw ? payload : payload?.data ?? payload;
  } catch (error) {
    if (error instanceof AdminApiError) {
      throw error;
    }

    throw new AdminApiError('Backend admin API is not available right now.', 0, error);
  }
}

export function login(credentials) {
  return adminRequest('/admin/login', {
    method: 'POST',
    body: credentials,
    auth: false,
  });
}

export function logout() {
  return adminRequest('/admin/logout', { method: 'POST' });
}

export function getProfile() {
  return adminRequest('/admin/profile');
}

export function updateProfile(data) {
  return adminRequest('/admin/profile', {
    method: 'PUT',
    body: data,
  });
}

export function changePassword(data) {
  return adminRequest('/admin/change-password', {
    method: 'PUT',
    body: data,
  });
}

export function getDashboardStats() {
  return adminRequest('/admin/dashboard');
}

export function getCategories() {
  return adminRequest('/admin/categories');
}

export function createCategory(data) {
  return adminRequest('/admin/categories', {
    method: 'POST',
    body: data,
  });
}

export function updateCategory(id, data) {
  const payload = prepareMutationPayload(data, 'PUT');

  return adminRequest(`/admin/categories/${encodeURIComponent(id)}`, {
    method: payload.method,
    body: payload.body,
  });
}

export function deleteCategory(id) {
  return adminRequest(`/admin/categories/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export function getProducts() {
  return adminRequest('/admin/products');
}

export function createProduct(data) {
  return adminRequest('/admin/products', {
    method: 'POST',
    body: data,
  });
}

export function getProduct(id) {
  return adminRequest(`/admin/products/${encodeURIComponent(id)}`);
}

export function updateProduct(id, data) {
  const payload = prepareMutationPayload(data, 'PUT');

  return adminRequest(`/admin/products/${encodeURIComponent(id)}`, {
    method: payload.method,
    body: payload.body,
  });
}

export function deleteProduct(id) {
  return adminRequest(`/admin/products/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export function getOrders() {
  return adminRequest('/admin/orders');
}

export function getOrder(id) {
  return adminRequest(`/admin/orders/${encodeURIComponent(id)}`);
}

export function updateOrderStatus(id, status) {
  return adminRequest(`/admin/orders/${encodeURIComponent(id)}/status`, {
    method: 'PUT',
    body: { status },
  });
}

export function deleteOrder(id) {
  return adminRequest(`/admin/orders/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export function getSettings() {
  return adminRequest('/admin/settings');
}

export function updateSettings(data) {
  return adminRequest('/admin/settings', {
    method: 'PUT',
    body: data,
  });
}

export function getSocialLinks() {
  return adminRequest('/admin/social-links');
}

export function updateSocialLinks(data) {
  return adminRequest('/admin/social-links', {
    method: 'PUT',
    body: data,
  });
}
