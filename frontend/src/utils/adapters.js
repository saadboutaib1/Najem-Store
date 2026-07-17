const categoryImages = {
  oud: '/categories/oud.svg',
  bakhoor: '/categories/bakhoor.svg',
  perfumes: '/categories/perfumes.svg',
  miswak: '/categories/miswak.svg',
};

const productImagesBySlug = {
  'oud-royal': '/products/oud-royal.svg',
  'oud-cambodian': '/products/oud-cambodian.svg',
  'oud-indian': '/products/oud-indian.svg',
  'bakhoor-sultani': '/products/bakhoor-sultani.svg',
  'bakhoor-amber': '/products/bakhoor-amber.svg',
  'bakhoor-musk': '/products/bakhoor-musk.svg',
  'perfume-gold-star': '/products/perfume-gold-star.svg',
  'perfume-oriental-rose': '/products/perfume-oriental-rose.svg',
  'perfume-white-musk': '/products/perfume-white-musk.svg',
};

const productImages = {
  oud: '/products/oud.svg',
  bakhoor: '/products/bakhoor.svg',
  perfumes: '/products/perfume.svg',
  miswak: '/products/miswak.svg',
};

export function getCategoryImageFallback(slug = 'oud') {
  return categoryImages[slug] || categoryImages.oud;
}

export function getProductImageFallback(categorySlug = 'oud', productSlug = '') {
  return productImagesBySlug[productSlug] || productImages[categorySlug] || productImages.oud;
}

function getProductImage(product, categorySlug, productSlug) {
  const image = product.image || product.main_image || '';
  const genericImage = Object.values(productImages).some((path) => image.endsWith(path));

  if (!image || genericImage) {
    return getProductImageFallback(categorySlug, productSlug);
  }

  return image;
}

function normalizeNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function getCategorySlug(product) {
  if (typeof product.category === 'string') return product.category;
  if (product.category?.slug) return product.category.slug;
  return product.category_slug || '';
}

export function adaptCategory(category = {}) {
  const slug = category.slug || category.id || '';

  return {
    ...category,
    id: category.id ?? slug,
    slug,
    name_ar: category.name_ar || category.name || '',
    name_en: category.name_en || category.name || category.name_ar || '',
    name_fr: category.name_fr || category.name_en || category.name || category.name_ar || '',
    description_ar: category.description_ar || '',
    description_en: category.description_en || category.description_ar || '',
    description_fr: category.description_fr || category.description_en || category.description_ar || '',
    image: category.image || getCategoryImageFallback(slug),
    status: category.status ?? 'active',
  };
}

export function adaptProduct(product = {}) {
  const categorySlug = product.category_slug || getCategorySlug(product);
  const productId = product.id ?? product.slug;
  const slug = product.slug || String(productId);
  const oldPrice = product.oldPrice ?? product.old_price ?? null;

  return {
    ...product,
    id: productId,
    backendId: /^\d+$/.test(String(productId)) ? Number(productId) : null,
    slug,
    category: categorySlug,
    category_slug: categorySlug,
    category_name_ar: product.category_name_ar || product.category?.name_ar || '',
    category_name_en: product.category_name_en || product.category?.name_en || product.category_name_ar || '',
    category_name_fr: product.category_name_fr || product.category?.name_fr || product.category_name_en || product.category_name_ar || '',
    name_ar: product.name_ar || product.name || '',
    name_en: product.name_en || product.name || product.name_ar || '',
    name_fr: product.name_fr || product.name_en || product.name || product.name_ar || '',
    description_ar: product.description_ar || '',
    description_en: product.description_en || product.description_ar || '',
    description_fr: product.description_fr || product.description_en || product.description_ar || '',
    price: normalizeNumber(product.price),
    oldPrice: oldPrice ? normalizeNumber(oldPrice) : null,
    stock: normalizeNumber(product.stock),
    image: getProductImage(product, categorySlug, slug),
    rating: normalizeNumber(product.rating, 5),
    isFeatured: Boolean(product.isFeatured ?? product.is_featured),
    status: product.status ?? 'active',
  };
}

export function adaptCategories(categories = []) {
  return categories.map(adaptCategory);
}

export function adaptProducts(products = []) {
  return products.map(adaptProduct);
}

export function hasBackendProductId(product) {
  return Boolean(product?.backendId || /^\d+$/.test(String(product?.id)));
}

export function getBackendProductId(product) {
  if (product?.backendId) return product.backendId;
  return /^\d+$/.test(String(product?.id)) ? Number(product.id) : null;
}
