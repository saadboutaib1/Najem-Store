import { categories as demoCategories } from '../data/categories.js';
import { products as demoProducts } from '../data/products.js';
import { getLocalizedField } from '../utils/formatters.js';

export const LARAVEL_API_ENDPOINTS = {
  categories: '/api/categories',
  products: '/api/products',
  featuredProducts: '/api/products/featured',
  deliveryFee: '/api/delivery-fee',
  checkoutQuote: '/api/checkout/quote',
};

export function getCategories() {
  return demoCategories;
}

export function getCategoryBySlug(slug) {
  return demoCategories.find((category) => category.slug === slug);
}

export function getProducts() {
  return demoProducts;
}

export function getProductById(productId) {
  return demoProducts.find((product) => product.id === productId);
}

export function getFeaturedProducts(limit = 4) {
  return demoProducts.filter((product) => product.isFeatured).slice(0, limit);
}

export function getRelatedProducts(product, limit = 3) {
  if (!product) return [];

  return demoProducts
    .filter((item) => item.category === product.category && item.id !== product.id)
    .slice(0, limit);
}

export function filterProducts({ category = 'all', searchTerm = '', language = 'ar' } = {}) {
  const normalizedSearch = searchTerm.trim().toLowerCase();

  return demoProducts.filter((product) => {
    const matchesCategory = category === 'all' || product.category === category;
    const localizedName = getLocalizedField(product, 'name', language).toLowerCase();
    const localizedDescription = getLocalizedField(product, 'description', language).toLowerCase();
    const matchesSearch =
      !normalizedSearch ||
      localizedName.includes(normalizedSearch) ||
      localizedDescription.includes(normalizedSearch);

    return matchesCategory && matchesSearch;
  });
}
