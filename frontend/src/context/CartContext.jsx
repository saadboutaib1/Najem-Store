import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CART_STORAGE_KEY = 'najem-cart';
const CartContext = createContext(null);

function getInitialCart() {
  try {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    return savedCart ? JSON.parse(savedCart) : [];
  } catch {
    return [];
  }
}

function clampQuantity(quantity, stock) {
  return Math.max(1, Math.min(quantity, stock || 1));
}

function getBackendId(product) {
  const id = product?.backendId || product?.id;
  return /^\d+$/.test(String(id)) ? Number(id) : null;
}

function getProductSlug(product) {
  if (product?.slug) return String(product.slug);
  return /^\d+$/.test(String(product?.id)) ? '' : String(product?.id || '');
}

function normalizeText(value = '') {
  return String(value).trim().toLowerCase();
}

function isSameProduct(firstProduct, secondProduct) {
  const firstBackendId = getBackendId(firstProduct);
  const secondBackendId = getBackendId(secondProduct);

  if (firstBackendId && secondBackendId) {
    return firstBackendId === secondBackendId;
  }

  const firstSlug = getProductSlug(firstProduct);
  const secondSlug = getProductSlug(secondProduct);

  if (firstSlug && secondSlug) {
    return firstSlug === secondSlug;
  }

  const firstArabicName = normalizeText(firstProduct?.name_ar);
  const secondArabicName = normalizeText(secondProduct?.name_ar);
  const firstEnglishName = normalizeText(firstProduct?.name_en);
  const secondEnglishName = normalizeText(secondProduct?.name_en);

  return Boolean(
    (firstArabicName && firstArabicName === secondArabicName) ||
      (firstEnglishName && firstEnglishName === secondEnglishName)
  );
}

function isSameProductReference(item, productReference) {
  if (productReference && typeof productReference === 'object') {
    return isSameProduct(item, productReference);
  }

  const reference = String(productReference || '');

  return Boolean(
    reference &&
      (String(item?.id || '') === reference ||
        String(item?.backendId || '') === reference ||
        getProductSlug(item) === reference)
  );
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(getInitialCart);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = (product, quantity = 1) => {
    if (!product || product.stock <= 0) return;

    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => isSameProduct(item, product));

      if (existingItem) {
        return currentItems.map((item) =>
          isSameProduct(item, product)
            ? {
                ...product,
                quantity: clampQuantity(item.quantity + quantity, product.stock),
              }
            : item
        );
      }

      return [
        ...currentItems,
        {
          ...product,
          quantity: clampQuantity(quantity, product.stock),
        },
      ];
    });
  };

  const removeFromCart = (productReference) => {
    setItems((currentItems) =>
      currentItems.filter((item) => !isSameProductReference(item, productReference))
    );
  };

  const increaseQuantity = (productReference) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        isSameProductReference(item, productReference)
          ? { ...item, quantity: clampQuantity(item.quantity + 1, item.stock) }
          : item
      )
    );
  };

  const decreaseQuantity = (productReference) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        isSameProductReference(item, productReference)
          ? { ...item, quantity: Math.max(1, item.quantity - 1) }
          : item
      )
    );
  };

  const clearCart = () => setItems([]);

  const replaceCartItems = (nextItems) => {
    setItems(Array.isArray(nextItems) ? nextItems : []);
  };

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      addToCart,
      removeFromCart,
      increaseQuantity,
      decreaseQuantity,
      clearCart,
      replaceCartItems,
      subtotal,
      total: subtotal,
      itemCount,
    }),
    [items, subtotal, itemCount]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used inside CartProvider');
  }

  return context;
}
