import { getProducts } from '../services/api.js';
import { adaptProducts, getBackendProductId } from './adapters.js';

function normalizeText(value = '') {
  return String(value).trim().toLowerCase();
}

function getPossibleSlug(item = {}) {
  if (item.slug) return String(item.slug);
  return /^\d+$/.test(String(item.id)) ? '' : String(item.id || '');
}

function findBackendMatch(cartItem, backendProducts) {
  const cartBackendId = getBackendProductId(cartItem);

  if (cartBackendId) {
    const byId = backendProducts.find((product) => getBackendProductId(product) === cartBackendId);
    if (byId) return byId;
  }

  const cartSlug = getPossibleSlug(cartItem);

  if (cartSlug) {
    const bySlug = backendProducts.find((product) => product.slug === cartSlug);
    if (bySlug) return bySlug;
  }

  const cartNameAr = normalizeText(cartItem.name_ar);
  const cartNameEn = normalizeText(cartItem.name_en);
  const cartNameFr = normalizeText(cartItem.name_fr);

  return backendProducts.find((product) => {
    const productNameAr = normalizeText(product.name_ar);
    const productNameEn = normalizeText(product.name_en);
    const productNameFr = normalizeText(product.name_fr);

    return Boolean(
      (cartNameAr && cartNameAr === productNameAr) ||
        (cartNameEn && cartNameEn === productNameEn) ||
        (cartNameFr && cartNameFr === productNameFr)
    );
  });
}

function clampQuantity(quantity, stock) {
  const currentQuantity = Math.max(1, Number(quantity) || 1);
  return Math.max(1, Math.min(currentQuantity, stock || currentQuantity));
}

function getMergeKey(item) {
  const backendId = getBackendProductId(item);
  if (backendId) return `backend:${backendId}`;

  const slug = getPossibleSlug(item);
  if (slug) return `slug:${slug}`;

  return `name:${normalizeText(item.name_ar)}:${normalizeText(item.name_en)}:${normalizeText(item.name_fr)}`;
}

function mergeDuplicateItems(items) {
  const mergedItems = [];
  const itemIndexes = new Map();
  let changed = false;

  items.forEach((item) => {
    const key = getMergeKey(item);

    if (!itemIndexes.has(key)) {
      itemIndexes.set(key, mergedItems.length);
      mergedItems.push(item);
      return;
    }

    const index = itemIndexes.get(key);
    const currentItem = mergedItems[index];
    mergedItems[index] = {
      ...item,
      quantity: clampQuantity(currentItem.quantity + item.quantity, item.stock),
    };
    changed = true;
  });

  return { items: mergedItems, changed };
}

export function reconcileCartItems(cartItems, backendProducts) {
  const unresolvedItems = [];
  let changed = false;

  const items = cartItems.map((cartItem) => {
    if (getBackendProductId(cartItem)) {
      return cartItem;
    }

    const backendProduct = findBackendMatch(cartItem, backendProducts);

    if (!backendProduct) {
      unresolvedItems.push(cartItem);
      return cartItem;
    }

    changed = true;

    return {
      ...backendProduct,
      quantity: clampQuantity(cartItem.quantity, backendProduct.stock),
    };
  });

  const merged = mergeDuplicateItems(items);

  return {
    items: merged.items,
    unresolvedItems,
    changed: changed || merged.changed,
  };
}

export async function reconcileCartItemsFromBackend(cartItems) {
  const apiProducts = await getProducts();
  const backendProducts = adaptProducts(apiProducts);

  return reconcileCartItems(cartItems, backendProducts);
}
