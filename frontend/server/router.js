import crypto from 'node:crypto';
import {
  ApiRouteError,
  DEFAULT_SETTINGS,
  createAdminToken,
  fail,
  formatCategory,
  formatProduct,
  getSettingsObject,
  getSupabaseAdmin,
  hashPassword,
  listSocialLinks,
  normalizeSlug,
  ok,
  parseBody,
  requireAdmin,
  requireMethod,
  sanitizeAdmin,
  toBoolean,
  toNumber,
  upsertSettingsObject,
  upsertSocialLinksObject,
  verifyPassword,
} from './supabase.js';

export const config = {
  api: {
    bodyParser: false,
  },
};

const PRODUCT_SELECT = `
  *,
  category:categories(id,slug,name_ar,name_en,name_fr,description_ar,description_en,description_fr,status)
`;
const ORDER_STATUSES = new Set(['pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled']);

function getPathSegments(req) {
  const rawPath = req.query?.path;
  const path = Array.isArray(rawPath)
    ? rawPath.join('/')
    : typeof rawPath === 'string'
      ? rawPath
      : new URL(req.url || '/', 'http://localhost').pathname.replace(/^\/api\/?/, '');

  return path.split('/').filter(Boolean).map((segment) => decodeURIComponent(segment));
}

function isNumericId(value) {
  return /^\d+$/.test(String(value || ''));
}

function normalizeString(value = '') {
  return String(value || '').trim();
}

function normalizeMessageLanguage(value) {
  return ['ar', 'fr', 'en'].includes(value) ? value : 'ar';
}

function getLocalizedProductName(product, language = 'ar') {
  if (language === 'fr') return product.name_fr || product.name_en || product.name_ar || product.slug || `Product ${product.id}`;
  if (language === 'en') return product.name_en || product.name_fr || product.name_ar || product.slug || `Product ${product.id}`;
  return product.name_ar || product.name_fr || product.name_en || product.slug || `Product ${product.id}`;
}

function parseDateValue(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function normalizeBuy2Offer(settings = {}) {
  return {
    enabled: toBoolean(settings.buy2_offer_enabled, false),
    startsAt: settings.buy2_offer_starts_at || '',
    endsAt: settings.buy2_offer_ends_at || '',
    discountType: settings.buy2_discount_type || 'percentage',
    discountValue: toNumber(settings.buy2_discount_value, 10),
  };
}

function normalizeLoyalty(settings = {}) {
  return {
    enabled: toBoolean(settings.loyalty_points_enabled, true),
    amountPerPoint: Math.max(1, toNumber(settings.loyalty_amount_per_point, 10)),
    rewardPoints: Math.max(1, toNumber(settings.loyalty_reward_points, 100)),
    rewardValue: Math.max(0, toNumber(settings.loyalty_reward_value, 20)),
  };
}

function getOfferDateWindow(offer = {}) {
  const startsAt = parseDateValue(offer.startsAt);
  const endsAt = parseDateValue(offer.endsAt);

  if (startsAt && endsAt && endsAt < startsAt) {
    return { startsAt: endsAt, endsAt: startsAt };
  }

  return { startsAt, endsAt };
}

function isBuy2OfferActive(offer = {}) {
  if (!offer.enabled || offer.discountValue <= 0) return false;
  const now = new Date();
  const { startsAt, endsAt } = getOfferDateWindow(offer);

  if (startsAt && startsAt > now) return false;
  if (endsAt && endsAt < now) return false;

  return true;
}

function calculateBuy2Discount(items = [], offer = {}) {
  if (!isBuy2OfferActive(offer)) return 0;

  const discount = items.reduce((totalDiscount, item) => {
    const quantity = toNumber(item.quantity);
    if (quantity < 2) return totalDiscount;

    const lineTotal = toNumber(item.price) * quantity;
    if (offer.discountType === 'fixed') {
      return totalDiscount + Math.min(lineTotal, offer.discountValue);
    }

    return totalDiscount + (lineTotal * Math.min(offer.discountValue, 100)) / 100;
  }, 0);
  const subtotal = items.reduce((total, item) => total + toNumber(item.price) * toNumber(item.quantity), 0);

  return Math.round(Math.min(discount, subtotal) * 100) / 100;
}

function calculateLoyaltyPoints(amount, loyalty = {}) {
  if (!loyalty.enabled) return 0;
  return Math.max(0, Math.floor(toNumber(amount) / loyalty.amountPerPoint));
}

async function listCategories({ activeOnly = true } = {}) {
  const supabase = getSupabaseAdmin();
  let query = supabase.from('categories').select('*').order('sort_order', { ascending: true }).order('id', { ascending: true });

  if (activeOnly) query = query.eq('status', 'active');

  const { data, error } = await query;
  if (error) throw new ApiRouteError('Could not load categories.', 500);

  return (data || []).map(formatCategory);
}

async function listProducts({ activeOnly = true, featuredOnly = false } = {}) {
  const supabase = getSupabaseAdmin();
  let query = supabase.from('products').select(PRODUCT_SELECT).order('id', { ascending: true });

  if (activeOnly) query = query.eq('status', 'active');
  if (featuredOnly) query = query.eq('is_featured', true);

  const { data, error } = await query;
  if (error) throw new ApiRouteError('Could not load products.', 500);

  return (data || []).map(formatProduct);
}

async function getProduct(identifier, { activeOnly = true } = {}) {
  const supabase = getSupabaseAdmin();
  let query = supabase.from('products').select(PRODUCT_SELECT).limit(1);

  query = isNumericId(identifier) ? query.eq('id', Number(identifier)) : query.eq('slug', identifier);
  if (activeOnly) query = query.eq('status', 'active');

  const { data, error } = await query.maybeSingle();
  if (error) throw new ApiRouteError('Could not load product.', 500);
  if (!data) throw new ApiRouteError('Product not found.', 404);

  return formatProduct(data);
}

async function createOrUpdateCategory(id, body = {}) {
  const supabase = getSupabaseAdmin();
  const nameAr = normalizeString(body.name_ar);
  const nameEn = normalizeString(body.name_en);
  const nameFr = normalizeString(body.name_fr || body.name_en);

  if (!nameAr || !nameEn || !nameFr) {
    throw new ApiRouteError('Category names are required.', 422);
  }

  const payload = {
    name_ar: nameAr,
    name_en: nameEn,
    name_fr: nameFr,
    slug: normalizeSlug(body.slug || nameEn || nameFr || nameAr, 'category'),
    description_ar: body.description_ar || '',
    description_en: body.description_en || '',
    description_fr: body.description_fr || body.description_en || '',
    status: body.status || 'active',
    sort_order: Math.max(0, Math.floor(toNumber(body.sort_order))),
    updated_at: new Date().toISOString(),
  };

  if (toBoolean(body.remove_image)) {
    payload.image = null;
  } else if (body.image) {
    payload.image = body.image;
  }

  const query = id
    ? supabase.from('categories').update(payload).eq('id', Number(id)).select('*').single()
    : supabase.from('categories').insert(payload).select('*').single();
  const { data, error } = await query;

  if (error) throw new ApiRouteError('Could not save category.', 500, error.message);
  return formatCategory(data);
}

async function deleteCategory(id) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('categories').delete().eq('id', Number(id));

  if (error) throw new ApiRouteError('Could not delete category.', 500);
  return true;
}

async function createOrUpdateProduct(id, body = {}) {
  const supabase = getSupabaseAdmin();
  const nameAr = normalizeString(body.name_ar);
  const nameEn = normalizeString(body.name_en);
  const nameFr = normalizeString(body.name_fr || body.name_en);
  const categoryId = Number(body.category_id);
  const price = toNumber(body.price);
  const stock = Math.max(0, Math.floor(toNumber(body.stock)));

  if (!categoryId || !nameAr || !nameEn || !nameFr || price <= 0) {
    throw new ApiRouteError('Product category, names, and price are required.', 422);
  }

  const payload = {
    category_id: categoryId,
    name_ar: nameAr,
    name_en: nameEn,
    name_fr: nameFr,
    slug: normalizeSlug(body.slug || nameEn || nameFr || nameAr, 'product'),
    description_ar: body.description_ar || '',
    description_en: body.description_en || '',
    description_fr: body.description_fr || body.description_en || '',
    price,
    old_price: body.old_price === '' || body.old_price === undefined || body.old_price === null ? null : toNumber(body.old_price),
    stock,
    rating: body.rating === undefined ? 5 : toNumber(body.rating, 5),
    status: body.status || 'active',
    is_featured: toBoolean(body.is_featured),
    updated_at: new Date().toISOString(),
  };

  if (toBoolean(body.remove_image)) {
    payload.main_image = null;
  } else if (body.main_image || body.image) {
    payload.main_image = body.main_image || body.image;
  }

  const query = id
    ? supabase.from('products').update(payload).eq('id', Number(id)).select(PRODUCT_SELECT).single()
    : supabase.from('products').insert(payload).select(PRODUCT_SELECT).single();
  const { data, error } = await query;

  if (error) throw new ApiRouteError('Could not save product.', 500, error.message);
  return formatProduct(data);
}

async function deleteProduct(id) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('products').delete().eq('id', Number(id));

  if (error) throw new ApiRouteError('Could not delete product.', 500);
  return true;
}

async function generateOrderNumber() {
  const supabase = getSupabaseAdmin();
  const year = new Date().getFullYear();
  const start = `${year}-01-01T00:00:00.000Z`;
  const end = `${year + 1}-01-01T00:00:00.000Z`;
  const { count, error } = await supabase
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', start)
    .lt('created_at', end);

  if (error) throw new ApiRouteError('Could not generate order number.', 500);
  return `MO-${year}-${String((count || 0) + 1).padStart(4, '0')}`;
}

function getMessageCurrencyLabel(language, currency = 'MAD') {
  const value = String(currency || 'MAD').trim();
  const isMoroccanDirham = ['MAD', 'mad', 'د.م.', 'د.م', 'درهم'].includes(value) || /د\.?م/.test(value);

  if (isMoroccanDirham) {
    return language === 'ar' ? 'د.م.' : 'MAD';
  }

  return value || 'MAD';
}

function formatMessageAmount(value, language, currency) {
  const amount = Number(value || 0);
  const locale = language === 'ar' ? 'ar-MA' : language === 'fr' ? 'fr-MA' : 'en-MA';

  try {
    return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(amount)} ${getMessageCurrencyLabel(language, currency)}`;
  } catch {
    return `${amount} ${getMessageCurrencyLabel(language, currency)}`;
  }
}

function buildOrderMessage({ orderNumber, body, items, subtotal, deliveryFee, discountTotal, total, language = 'ar', currency = 'MAD' }) {
  const currentLanguage = normalizeMessageLanguage(language);
  const notes = normalizeString(body.notes);
  const productLines = items.map((item, index) => {
    const name = getLocalizedProductName(item.product, currentLanguage);
    return `${index + 1}. ${name} × ${item.quantity} = ${formatMessageAmount(item.total_price, currentLanguage, currency)}`;
  }).join('\n');

  if (currentLanguage === 'fr') {
    return [
      'Nouvelle commande MAGHRIB OUD',
      `Numéro de commande : ${orderNumber || 'N/A'}`,
      '',
      'Informations client :',
      `Nom : ${body.customer_name}`,
      `Téléphone : ${body.customer_phone}`,
      `Ville : ${body.city}`,
      `Adresse : ${body.address}`,
      `Notes : ${notes || 'Aucune'}`,
      '',
      'Produits :',
      productLines,
      '',
      `Sous-total : ${formatMessageAmount(subtotal, currentLanguage, currency)}`,
      discountTotal > 0 ? `Remise offre « Achetez-en 2 » : -${formatMessageAmount(discountTotal, currentLanguage, currency)}` : '',
      `Frais de livraison : ${formatMessageAmount(deliveryFee, currentLanguage, currency)}`,
      `Total : ${formatMessageAmount(total, currentLanguage, currency)}`,
      '',
      'Mode de paiement : Paiement à la livraison',
    ].filter(Boolean).join('\n');
  }

  if (currentLanguage === 'en') {
    return [
      'New order from MAGHRIB OUD',
      `Order number: ${orderNumber || 'N/A'}`,
      '',
      'Customer information:',
      `Name: ${body.customer_name}`,
      `Phone: ${body.customer_phone}`,
      `City: ${body.city}`,
      `Address: ${body.address}`,
      `Notes: ${notes || 'None'}`,
      '',
      'Products:',
      productLines,
      '',
      `Subtotal: ${formatMessageAmount(subtotal, currentLanguage, currency)}`,
      discountTotal > 0 ? `Buy 2 offer discount: -${formatMessageAmount(discountTotal, currentLanguage, currency)}` : '',
      `Delivery fee: ${formatMessageAmount(deliveryFee, currentLanguage, currency)}`,
      `Total: ${formatMessageAmount(total, currentLanguage, currency)}`,
      '',
      'Payment method: Cash on delivery',
    ].filter(Boolean).join('\n');
  }

  return [
    'طلب جديد من MAGHRIB OUD',
    `رقم الطلب: ${orderNumber || 'غير متوفر'}`,
    '',
    'معلومات العميل:',
    `الاسم: ${body.customer_name}`,
    `الهاتف: ${body.customer_phone}`,
    `المدينة: ${body.city}`,
    `العنوان: ${body.address}`,
    `ملاحظات: ${notes || 'لا توجد ملاحظات'}`,
    '',
    'المنتجات:',
    productLines,
    '',
    `المجموع الفرعي: ${formatMessageAmount(subtotal, currentLanguage, currency)}`,
    discountTotal > 0 ? `خصم عرض اشتر قطعتين: -${formatMessageAmount(discountTotal, currentLanguage, currency)}` : '',
    `رسوم التوصيل: ${formatMessageAmount(deliveryFee, currentLanguage, currency)}`,
    `المجموع الكلي: ${formatMessageAmount(total, currentLanguage, currency)}`,
    '',
    'طريقة الدفع: الدفع عند الاستلام',
  ].filter(Boolean).join('\n');
}

function repairMojibakeText(value) {
  if (typeof value !== 'string' || !/[ØÙÃÂ]/.test(value)) return value;

  try {
    const repaired = Buffer.from(value, 'latin1').toString('utf8');
    return repaired && repaired !== value ? repaired : value;
  } catch {
    return value;
  }
}

function hasBrokenWhatsAppMessage(value) {
  if (typeof value !== 'string') return false;
  return value.includes('�') || /[ØÙÃÂ]{2,}/.test(value);
}

function rebuildOrderMessageFromRows(order = {}, items = []) {
  if (!items.length) return repairMojibakeText(order.whatsapp_message || '');

  const rebuiltItems = items.map((item) => ({
    ...item,
    product: {
      id: item.product_id,
      name_ar: item.product_name_ar,
      name_en: item.product_name_en,
      name_fr: item.product_name_fr,
      slug: item.product_slug || '',
    },
    total_price: item.total_price,
  }));

  return buildOrderMessage({
    orderNumber: order.order_number,
    body: {
      customer_name: order.customer_name,
      customer_phone: order.customer_phone,
      city: order.city,
      address: order.address,
      notes: order.notes,
    },
    items: rebuiltItems,
    subtotal: order.subtotal,
    deliveryFee: order.delivery_fee,
    discountTotal: order.discount_total,
    total: order.total,
    language: order.language || 'ar',
    currency: order.currency || DEFAULT_SETTINGS.currency,
  });
}

function normalizeOrderWhatsAppMessage(order = {}, items = null) {
  const repaired = repairMojibakeText(order.whatsapp_message || '');

  if (!hasBrokenWhatsAppMessage(repaired)) {
    return repaired;
  }

  return Array.isArray(items) ? rebuildOrderMessageFromRows(order, items) : repaired;
}

function formatOrder(order = {}, items = null) {
  return {
    ...order,
    whatsapp_message: normalizeOrderWhatsAppMessage(order, items),
  };
}

async function createOrder(body = {}) {
  const supabase = getSupabaseAdmin();
  const requiredFields = ['customer_name', 'customer_phone', 'city', 'address'];
  const missingField = requiredFields.find((field) => !normalizeString(body[field]));

  if (missingField) {
    throw new ApiRouteError('Customer name, phone, city, and address are required.', 422, { field: missingField });
  }

  const requestedItems = Array.isArray(body.items) ? body.items : [];
  if (!requestedItems.length) {
    throw new ApiRouteError('Order items are required.', 422);
  }

  const normalizedItems = requestedItems.map((item) => ({
    product_id: Number(item.product_id),
    quantity: Math.max(1, Math.floor(toNumber(item.quantity, 1))),
  })).filter((item) => item.product_id && item.quantity > 0);

  if (!normalizedItems.length) {
    throw new ApiRouteError('Order items are invalid.', 422);
  }

  const productIds = [...new Set(normalizedItems.map((item) => item.product_id))];
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id,name_ar,name_en,name_fr,slug,price,stock,status')
    .in('id', productIds);

  if (productsError) throw new ApiRouteError('Could not load order products.', 500);

  const productsById = new Map((products || []).map((product) => [Number(product.id), product]));
  const pricedItems = normalizedItems.map((item) => {
    const product = productsById.get(item.product_id);

    if (!product || product.status !== 'active') {
      throw new ApiRouteError('One or more products are unavailable.', 422, { product_id: item.product_id });
    }

    if (toNumber(product.stock) < item.quantity) {
      throw new ApiRouteError('Requested quantity is not available in stock.', 422, { product_id: item.product_id });
    }

    const unitPrice = toNumber(product.price);
    return {
      ...item,
      product,
      price: unitPrice,
      unit_price: unitPrice,
      total_price: Math.round(unitPrice * item.quantity * 100) / 100,
    };
  });

  const settings = await getSettingsObject();
  const offer = normalizeBuy2Offer(settings);
  const loyalty = normalizeLoyalty(settings);
  const subtotal = Math.round(pricedItems.reduce((total, item) => total + item.total_price, 0) * 100) / 100;
  const discountTotal = calculateBuy2Discount(pricedItems, offer);
  const discountedSubtotal = Math.max(0, subtotal - discountTotal);
  const deliveryFee = toNumber(settings.delivery_fee, DEFAULT_SETTINGS.delivery_fee);
  const total = Math.round((discountedSubtotal + deliveryFee) * 100) / 100;
  const loyaltyPointsEarned = calculateLoyaltyPoints(discountedSubtotal, loyalty);
  const orderNumber = await generateOrderNumber();
  const orderLanguage = normalizeMessageLanguage(body.language || settings.default_language || DEFAULT_SETTINGS.default_language);
  const whatsappMessage = buildOrderMessage({
    orderNumber,
    body,
    items: pricedItems,
    subtotal,
    deliveryFee,
    discountTotal,
    total,
    language: orderLanguage,
    currency: settings.currency || DEFAULT_SETTINGS.currency,
  });

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      order_number: orderNumber,
      customer_name: normalizeString(body.customer_name),
      customer_phone: normalizeString(body.customer_phone),
      city: normalizeString(body.city),
      address: normalizeString(body.address),
      notes: normalizeString(body.notes),
      subtotal,
      delivery_fee: deliveryFee,
      discount_total: discountTotal,
      total,
      payment_method: settings.payment_method || 'cash_on_delivery',
      status: 'pending',
      whatsapp_message: whatsappMessage,
      loyalty_points_earned: loyaltyPointsEarned,
    })
    .select('*')
    .single();

  if (orderError) throw new ApiRouteError('Could not create order.', 500);

  const orderItems = pricedItems.map((item) => ({
    order_id: order.id,
    product_id: item.product_id,
    product_name_ar: item.product.name_ar,
    product_name_en: item.product.name_en,
    product_name_fr: item.product.name_fr || item.product.name_en,
    quantity: item.quantity,
    unit_price: item.unit_price,
    total_price: item.total_price,
  }));

  const { data: insertedItems, error: itemsError } = await supabase.from('order_items').insert(orderItems).select('*');
  if (itemsError) throw new ApiRouteError('Could not create order items.', 500);

  for (const item of pricedItems) {
    await supabase
      .from('products')
      .update({ stock: Math.max(0, toNumber(item.product.stock) - item.quantity), updated_at: new Date().toISOString() })
      .eq('id', item.product_id);
  }

  return {
    ...formatOrder(order, insertedItems || []),
    items: insertedItems || [],
  };
}

async function listOrders() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });

  if (error) throw new ApiRouteError('Could not load orders.', 500);
  return (data || []).map(formatOrder);
}

async function getOrder(id) {
  const supabase = getSupabaseAdmin();
  const { data: order, error } = await supabase.from('orders').select('*').eq('id', Number(id)).single();

  if (error || !order) throw new ApiRouteError('Order not found.', 404);

  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', order.id)
    .order('id', { ascending: true });

  if (itemsError) throw new ApiRouteError('Could not load order items.', 500);

  return { ...formatOrder(order, items || []), items: items || [] };
}

async function awardLoyaltyPoints(order) {
  if (!order || order.loyalty_points_awarded_at || toNumber(order.loyalty_points_earned) <= 0) return;

  const supabase = getSupabaseAdmin();
  const phone = normalizeString(order.customer_phone);
  const { data: current } = await supabase.from('customer_loyalty_points').select('*').eq('phone', phone).maybeSingle();
  const now = new Date().toISOString();

  if (current) {
    await supabase
      .from('customer_loyalty_points')
      .update({
        customer_name: order.customer_name,
        total_points: toNumber(current.total_points) + toNumber(order.loyalty_points_earned),
        total_orders: toNumber(current.total_orders) + 1,
        last_order_at: now,
        updated_at: now,
      })
      .eq('phone', phone);
  } else {
    await supabase.from('customer_loyalty_points').insert({
      phone,
      customer_name: order.customer_name,
      total_points: toNumber(order.loyalty_points_earned),
      total_orders: 1,
      last_order_at: now,
    });
  }

  await supabase.from('orders').update({ loyalty_points_awarded_at: now, updated_at: now }).eq('id', order.id);
}

async function updateOrderStatus(id, status) {
  if (!ORDER_STATUSES.has(status)) {
    throw new ApiRouteError('Invalid order status.', 422);
  }

  const supabase = getSupabaseAdmin();
  const currentOrder = await getOrder(id);
  const { data, error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', Number(id))
    .select('*')
    .single();

  if (error) throw new ApiRouteError('Could not update order.', 500);

  if (status === 'delivered') {
    await awardLoyaltyPoints({ ...currentOrder, ...data });
  }

  return getOrder(id);
}

async function deleteOrder(id) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('orders').delete().eq('id', Number(id));

  if (error) throw new ApiRouteError('Could not delete order.', 500);
  return true;
}

async function getLoyaltyPoints(phone) {
  const normalizedPhone = normalizeString(phone);
  if (!normalizedPhone) throw new ApiRouteError('Phone number is required.', 422);

  const supabase = getSupabaseAdmin();
  const settings = await getSettingsObject();
  const loyalty = normalizeLoyalty(settings);
  const { data } = await supabase.from('customer_loyalty_points').select('*').eq('phone', normalizedPhone).maybeSingle();
  const totalPoints = toNumber(data?.total_points);
  const availableRewards = Math.floor(totalPoints / loyalty.rewardPoints);
  const availableDiscount = availableRewards * loyalty.rewardValue;
  const pointsToNextReward = loyalty.rewardPoints - (totalPoints % loyalty.rewardPoints || loyalty.rewardPoints);

  return {
    phone: normalizedPhone,
    customer_name: data?.customer_name || '',
    total_points: totalPoints,
    total_orders: toNumber(data?.total_orders),
    available_rewards: availableRewards,
    available_discount: availableDiscount,
    points_to_next_reward: totalPoints > 0 ? pointsToNextReward : loyalty.rewardPoints,
    last_order_at: data?.last_order_at || null,
  };
}

async function ensureBootstrapAdmin(email, password) {
  const adminEmail = normalizeEmail(process.env.ADMIN_EMAIL);
  const adminPassword = String(process.env.ADMIN_PASSWORD || '');

  if (!adminEmail || !adminPassword || email !== adminEmail || password !== adminPassword) {
    return null;
  }

  const supabase = getSupabaseAdmin();
  const { count, error: countError } = await supabase
    .from('admins')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'active');

  if (countError) {
    throw new ApiRouteError('Could not verify admin setup.', 500);
  }

  if ((count || 0) !== 0) return null;

  const { data, error } = await supabase
    .from('admins')
    .insert({
      name: 'MAGHRIB OUD Admin',
      email: adminEmail,
      password_hash: await hashPassword(adminPassword),
      remember_token: crypto.randomBytes(24).toString('hex'),
      role: 'admin',
      status: 'active',
    })
    .select('*')
    .single();

  if (error) throw new ApiRouteError('Could not create initial admin.', 500);
  return data;
}

function normalizeEmail(value) {
  return normalizeString(value).toLowerCase();
}


async function loginAdmin(body = {}) {
  const email = normalizeEmail(body.email);
  const password = String(body.password || '');

  if (!email || !password) {
    throw new ApiRouteError('Email and password are required.', 422);
  }

  const supabase = getSupabaseAdmin();
  let { data: admin, error } = await supabase
    .from('admins')
    .select('*')
    .eq('email', email)
    .eq('status', 'active')
    .maybeSingle();

  if (error) throw new ApiRouteError('Could not verify admin account.', 500);

  if (!admin) {
    admin = await ensureBootstrapAdmin(email, password);
  }

  if (!admin || !(await verifyPassword(password, admin.password_hash))) {
    throw new ApiRouteError('Invalid admin credentials.', 401);
  }

  return {
    token: createAdminToken(admin),
    admin: sanitizeAdmin(admin),
  };
}

async function updateProfile(admin, body = {}) {
  const email = normalizeString(body.email).toLowerCase();

  if (!email) throw new ApiRouteError('Email is required.', 422);

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('admins')
    .update({ email, updated_at: new Date().toISOString() })
    .eq('id', admin.id)
    .select('id,name,email,role,status')
    .single();

  if (error) throw new ApiRouteError('Could not update profile.', 500);
  return data;
}

async function changePassword(admin, body = {}) {
  const currentPassword = String(body.current_password || '');
  const password = String(body.password || '');
  const passwordConfirmation = String(body.password_confirmation || '');

  if (!currentPassword || !password || password !== passwordConfirmation || password.length < 8) {
    throw new ApiRouteError('Password fields are invalid.', 422);
  }

  const supabase = getSupabaseAdmin();
  const { data: fullAdmin, error: loadError } = await supabase.from('admins').select('*').eq('id', admin.id).single();
  if (loadError || !fullAdmin) throw new ApiRouteError('Admin account not found.', 404);

  if (!(await verifyPassword(currentPassword, fullAdmin.password_hash))) {
    throw new ApiRouteError('Current password is incorrect.', 422);
  }

  const { error } = await supabase
    .from('admins')
    .update({
      password_hash: await hashPassword(password),
      remember_token: crypto.randomBytes(24).toString('hex'),
      updated_at: new Date().toISOString(),
    })
    .eq('id', admin.id);

  if (error) throw new ApiRouteError('Could not change password.', 500);
  return true;
}

async function getDashboardStats() {
  const supabase = getSupabaseAdmin();
  const [products, categories, orders, pendingOrders, deliveredOrders, revenueRows] = await Promise.all([
    supabase.from('products').select('id', { count: 'exact', head: true }),
    supabase.from('categories').select('id', { count: 'exact', head: true }),
    supabase.from('orders').select('id', { count: 'exact', head: true }),
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'delivered'),
    supabase.from('orders').select('total,status').neq('status', 'cancelled'),
  ]);

  const errors = [products, categories, orders, pendingOrders, deliveredOrders, revenueRows].filter((result) => result.error);
  if (errors.length) throw new ApiRouteError('Could not load dashboard.', 500);

  const totalRevenue = (revenueRows.data || []).reduce((total, order) => total + toNumber(order.total), 0);

  return {
    total_products: products.count || 0,
    total_categories: categories.count || 0,
    total_orders: orders.count || 0,
    pending_orders: pendingOrders.count || 0,
    delivered_orders: deliveredOrders.count || 0,
    total_revenue: Math.round(totalRevenue * 100) / 100,
  };
}

async function handlePublic(req, res, segments) {
  if (segments[0] === 'categories' && segments.length === 1) {
    requireMethod(req, ['GET']);
    return ok(res, await listCategories({ activeOnly: true }), 'Categories loaded.');
  }

  if (segments[0] === 'products') {
    if (segments.length === 1) {
      requireMethod(req, ['GET']);
      return ok(res, await listProducts({ activeOnly: true }), 'Products loaded.');
    }

    if (segments[1] === 'featured' && segments.length === 2) {
      requireMethod(req, ['GET']);
      return ok(res, await listProducts({ activeOnly: true, featuredOnly: true }), 'Featured products loaded.');
    }

    if (segments[1] === 'slug' && segments[2]) {
      requireMethod(req, ['GET']);
      return ok(res, await getProduct(segments[2], { activeOnly: true }), 'Product loaded.');
    }

    if (segments[1]) {
      requireMethod(req, ['GET']);
      return ok(res, await getProduct(segments[1], { activeOnly: true }), 'Product loaded.');
    }
  }

  if (segments[0] === 'settings' && segments.length === 1) {
    requireMethod(req, ['GET']);
    return ok(res, await getSettingsObject(), 'Settings loaded.');
  }

  if (segments[0] === 'social-links' && segments.length === 1) {
    requireMethod(req, ['GET']);
    return ok(res, await listSocialLinks(true), 'Social links loaded.');
  }

  if (segments[0] === 'loyalty-points' && segments.length === 1) {
    requireMethod(req, ['GET']);
    const phone = new URL(req.url || '/', 'http://localhost').searchParams.get('phone');
    return ok(res, await getLoyaltyPoints(phone), 'Loyalty points loaded.');
  }

  if (segments[0] === 'orders' && segments.length === 1) {
    requireMethod(req, ['POST']);
    const order = await createOrder(await parseBody(req));
    return ok(res, order, 'Order created.', 201);
  }

  throw new ApiRouteError('API route not found.', 404);
}

async function handleAdmin(req, res, segments) {
  const resource = segments[1];
  const id = segments[2];

  if (resource === 'login') {
    requireMethod(req, ['POST']);
    return ok(res, await loginAdmin(await parseBody(req)), 'Admin logged in.');
  }

  if (resource === 'logout') {
    requireMethod(req, ['POST']);
    return ok(res, null, 'Admin logged out.');
  }

  const admin = await requireAdmin(req);

  if (resource === 'profile') {
    if (req.method === 'GET') return ok(res, admin, 'Admin profile loaded.');
    if (req.method === 'PUT') return ok(res, await updateProfile(admin, await parseBody(req)), 'Admin profile updated.');
    requireMethod(req, ['GET', 'PUT']);
  }

  if (resource === 'change-password') {
    requireMethod(req, ['PUT']);
    await changePassword(admin, await parseBody(req));
    return ok(res, null, 'Password changed.');
  }

  if (resource === 'dashboard') {
    requireMethod(req, ['GET']);
    return ok(res, await getDashboardStats(), 'Dashboard loaded.');
  }

  if (resource === 'categories') {
    if (!id && req.method === 'GET') return ok(res, await listCategories({ activeOnly: false }), 'Categories loaded.');
    if (!id && req.method === 'POST') return ok(res, await createOrUpdateCategory(null, await parseBody(req)), 'Category created.', 201);
    if (id && req.method === 'PUT') return ok(res, await createOrUpdateCategory(id, await parseBody(req)), 'Category updated.');
    if (id && req.method === 'POST') return ok(res, await createOrUpdateCategory(id, await parseBody(req)), 'Category updated.');
    if (id && req.method === 'DELETE') {
      await deleteCategory(id);
      return ok(res, null, 'Category deleted.');
    }
  }

  if (resource === 'products') {
    if (!id && req.method === 'GET') return ok(res, await listProducts({ activeOnly: false }), 'Products loaded.');
    if (!id && req.method === 'POST') return ok(res, await createOrUpdateProduct(null, await parseBody(req)), 'Product created.', 201);
    if (id && req.method === 'GET') return ok(res, await getProduct(id, { activeOnly: false }), 'Product loaded.');
    if (id && req.method === 'PUT') return ok(res, await createOrUpdateProduct(id, await parseBody(req)), 'Product updated.');
    if (id && req.method === 'POST') return ok(res, await createOrUpdateProduct(id, await parseBody(req)), 'Product updated.');
    if (id && req.method === 'DELETE') {
      await deleteProduct(id);
      return ok(res, null, 'Product deleted.');
    }
  }

  if (resource === 'orders') {
    if (!id && req.method === 'GET') return ok(res, await listOrders(), 'Orders loaded.');
    if (id && segments[3] === 'status' && req.method === 'PUT') {
      const body = await parseBody(req);
      return ok(res, await updateOrderStatus(id, body.status), 'Order status updated.');
    }
    if (id && req.method === 'GET') return ok(res, await getOrder(id), 'Order loaded.');
    if (id && req.method === 'DELETE') {
      await deleteOrder(id);
      return ok(res, null, 'Order deleted.');
    }
  }

  if (resource === 'settings') {
    if (req.method === 'GET') {
      const settings = await getSettingsObject();
      const socialLinks = await listSocialLinks(false);
      return ok(res, { settings, social_links: socialLinks }, 'Settings loaded.');
    }
    if (req.method === 'PUT') {
      const settings = await upsertSettingsObject(await parseBody(req));
      return ok(res, settings, 'Settings updated.');
    }
  }

  if (resource === 'social-links') {
    if (req.method === 'GET') return ok(res, await listSocialLinks(false), 'Social links loaded.');
    if (req.method === 'PUT') return ok(res, await upsertSocialLinksObject(await parseBody(req)), 'Social links updated.');
  }

  throw new ApiRouteError('Admin API route not found.', 404);
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    return res.status(204).end();
  }

  try {
    const segments = getPathSegments(req);

    if (segments[0] === 'admin') {
      return await handleAdmin(req, res, segments);
    }

    return await handlePublic(req, res, segments);
  } catch (error) {
    return fail(res, error, 'The API service is not available right now.');
  }
}
