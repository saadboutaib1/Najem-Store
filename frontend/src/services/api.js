import { buildApiUrl } from '../config/api.js';

export class ApiError extends Error {
  constructor(message, status = 0, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

async function request(endpoint, options = {}) {
  const { params, body, method = 'GET', raw = false } = options;

  try {
    const response = await fetch(buildApiUrl(endpoint, params), {
      method,
      headers: {
        Accept: 'application/json',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const payload = await response.json().catch(() => null);
    const message = payload?.message || `API request failed with status ${response.status}`;

    if (!response.ok || payload?.success === false) {
      throw new ApiError(message, response.status, payload?.errors || payload);
    }

    if (raw) {
      return payload;
    }

    return payload?.data ?? payload;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError('The store service is not available right now.', 0, error);
  }
}

export function getCategories() {
  return request('/categories');
}

export function getProducts(params = {}) {
  return request('/products', { params });
}

export function getFeaturedProducts() {
  return request('/products/featured');
}

export function getProduct(id) {
  return request(`/products/${encodeURIComponent(id)}`);
}

export function getProductBySlug(slug) {
  return request(`/products/slug/${encodeURIComponent(slug)}`);
}

export function getSettings() {
  return request('/settings');
}

export function getSocialLinks() {
  return request('/social-links');
}

export function getLoyaltyPoints(phone) {
  return request('/loyalty-points', {
    params: { phone },
  });
}

export function createOrder(orderData) {
  return request('/orders', {
    method: 'POST',
    body: orderData,
    raw: true,
  });
}
