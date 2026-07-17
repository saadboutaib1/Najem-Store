import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { formidable } from 'formidable';

let supabaseAdminClient = null;

export class ApiRouteError extends Error {
  constructor(message, status = 500, details = null) {
    super(message);
    this.name = 'ApiRouteError';
    this.status = status;
    this.details = details;
  }
}

export const DEFAULT_SETTINGS = {
  store_name: 'MAGHRIB OUD',
  whatsapp_number: '+212601892738',
  currency: 'MAD',
  delivery_fee: 30,
  default_language: 'ar',
  payment_method: 'cash_on_delivery',
  country: 'Morocco',
  buy2_offer_enabled: false,
  buy2_offer_starts_at: '',
  buy2_offer_ends_at: '',
  buy2_discount_type: 'percentage',
  buy2_discount_value: 10,
  loyalty_points_enabled: true,
  loyalty_amount_per_point: 10,
  loyalty_reward_points: 100,
  loyalty_reward_value: 20,
};

const NUMERIC_SETTINGS = new Set([
  'delivery_fee',
  'buy2_discount_value',
  'loyalty_amount_per_point',
  'loyalty_reward_points',
  'loyalty_reward_value',
]);

const BOOLEAN_SETTINGS = new Set([
  'buy2_offer_enabled',
  'loyalty_points_enabled',
]);

export function getSupabaseAdmin() {
  if (supabaseAdminClient) return supabaseAdminClient;

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new ApiRouteError('Supabase server environment variables are not configured.', 500);
  }

  supabaseAdminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return supabaseAdminClient;
}

export function sendJson(res, status, payload) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  return res.status(status).json(payload);
}

export function ok(res, data = null, message = 'OK', status = 200) {
  return sendJson(res, status, { success: true, message, data });
}

export function fail(res, error, fallbackMessage = 'Request failed.') {
  const status = Number(error?.status || 500);
  const isServerError = status >= 500;
  const message = isServerError ? fallbackMessage : error.message || fallbackMessage;

  return sendJson(res, status, {
    success: false,
    message,
    errors: isServerError ? null : error.details || null,
  });
}

export function requireMethod(req, allowedMethods = []) {
  if (!allowedMethods.includes(req.method)) {
    throw new ApiRouteError('Method not allowed.', 405, { allowedMethods });
  }
}

export function toBoolean(value, fallback = false) {
  if (value === true || value === false) return value;
  if (value === 1 || value === '1') return true;
  if (value === 0 || value === '0') return false;

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', 'yes', 'on'].includes(normalized)) return true;
    if (['false', 'no', 'off'].includes(normalized)) return false;
  }

  return fallback;
}

export function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function normalizeSlug(value, fallback = 'item') {
  const slug = String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (slug) return slug;

  return `${fallback}-${Date.now()}`;
}

function parseSettingValue(key, value) {
  if (BOOLEAN_SETTINGS.has(key)) return toBoolean(value);
  if (NUMERIC_SETTINGS.has(key)) return toNumber(value);
  return value ?? '';
}

export async function getSettingsObject() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from('settings').select('key,value');

  if (error) throw new ApiRouteError('Could not load settings.', 500);

  return (data || []).reduce(
    (settings, row) => ({
      ...settings,
      [row.key]: parseSettingValue(row.key, row.value),
    }),
    { ...DEFAULT_SETTINGS }
  );
}

export async function upsertSettingsObject(settings = {}) {
  const supabase = getSupabaseAdmin();
  const allowedKeys = Object.keys(DEFAULT_SETTINGS);
  const rows = allowedKeys
    .filter((key) => Object.prototype.hasOwnProperty.call(settings, key))
    .map((key) => ({
      key,
      value: settings[key] === null || settings[key] === undefined ? '' : String(settings[key]),
      updated_at: new Date().toISOString(),
    }));

  if (!rows.length) return getSettingsObject();

  const { error } = await supabase.from('settings').upsert(rows, { onConflict: 'key' });
  if (error) throw new ApiRouteError('Could not save settings.', 500);

  return getSettingsObject();
}

export async function listSocialLinks(activeOnly = true) {
  const supabase = getSupabaseAdmin();
  let query = supabase.from('social_links').select('*').order('id', { ascending: true });

  if (activeOnly) {
    query = query.eq('status', 'active');
  }

  const { data, error } = await query;
  if (error) throw new ApiRouteError('Could not load social links.', 500);

  return data || [];
}

export async function upsertSocialLinksObject(links = {}) {
  const supabase = getSupabaseAdmin();
  const platforms = ['whatsapp', 'facebook', 'instagram', 'tiktok', 'youtube'];
  const rows = platforms.map((platform) => ({
    platform,
    url: links[platform] || '',
    status: links[platform] ? 'active' : 'inactive',
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase.from('social_links').upsert(rows, { onConflict: 'platform' });
  if (error) throw new ApiRouteError('Could not save social links.', 500);

  return listSocialLinks(false);
}

export function formatCategory(row = {}) {
  return {
    ...row,
    id: row.id,
    slug: row.slug,
    image: row.image || '',
    status: row.status || 'active',
    sort_order: toNumber(row.sort_order),
  };
}

export function formatProduct(row = {}) {
  const category = row.category || row.categories || null;
  const categorySlug = row.category_slug || category?.slug || '';
  const oldPrice = row.old_price === null || row.old_price === undefined ? null : toNumber(row.old_price);

  return {
    ...row,
    id: row.id,
    slug: row.slug,
    category_id: row.category_id,
    category: categorySlug,
    category_slug: categorySlug,
    category_name_ar: row.category_name_ar || category?.name_ar || '',
    category_name_en: row.category_name_en || category?.name_en || '',
    category_name_fr: row.category_name_fr || category?.name_fr || category?.name_en || '',
    price: toNumber(row.price),
    old_price: oldPrice,
    oldPrice,
    stock: toNumber(row.stock),
    rating: toNumber(row.rating, 5),
    image: row.image || row.main_image || '',
    main_image: row.main_image || row.image || '',
    is_featured: toBoolean(row.is_featured),
    isFeatured: toBoolean(row.is_featured),
    status: row.status || 'active',
  };
}

export async function parseBody(req) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return {};

  const contentType = req.headers['content-type'] || '';

  if (contentType.includes('multipart/form-data')) {
    return parseMultipartBody(req);
  }

  if (req.body && typeof req.body === 'object') {
    return req.body;
  }

  if (typeof req.body === 'string') {
    if (!req.body.trim()) return {};

    try {
      return JSON.parse(req.body);
    } catch {
      throw new ApiRouteError('Invalid JSON body.', 400);
    }
  }

  const text = await readRequestText(req);
  if (!text.trim()) return {};

  try {
    return JSON.parse(text);
  } catch {
    throw new ApiRouteError('Invalid JSON body.', 400);
  }
}

function readRequestText(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

async function parseMultipartBody(req) {
  const form = formidable({
    allowEmptyFiles: false,
    maxFileSize: 2 * 1024 * 1024,
    multiples: false,
  });

  const [fields, files] = await form.parse(req);
  const body = {};

  Object.entries(fields).forEach(([key, value]) => {
    body[key] = Array.isArray(value) ? value[0] : value;
  });

  for (const [key, value] of Object.entries(files)) {
    const file = Array.isArray(value) ? value[0] : value;
    if (!file || !file.size) continue;

    if (!String(file.mimetype || '').startsWith('image/')) {
      throw new ApiRouteError('Only image uploads are allowed.', 422, { field: key });
    }

    const buffer = await readFile(file.filepath);
    body[key] = `data:${file.mimetype};base64,${buffer.toString('base64')}`;
    body[`${key}_filename`] = file.originalFilename || file.newFilename || 'image';
  }

  return body;
}

function getTokenSecret() {
  const secret = process.env.ADMIN_TOKEN_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!secret) {
    throw new ApiRouteError('Admin token secret is not configured.', 500);
  }

  return secret;
}

function signPayload(payload) {
  return crypto.createHmac('sha256', getTokenSecret()).update(payload).digest('base64url');
}

export function createAdminToken(admin = {}) {
  const subject = admin.id || admin.sub || 'env-admin';
  const payload = Buffer.from(
    JSON.stringify({
      sub: subject,
      email: admin.email,
      name: admin.name || 'MAGHRIB OUD Admin',
      role: admin.role || 'admin',
      source: admin.source || (String(subject) === 'env-admin' ? 'env' : 'supabase'),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8,
    })
  ).toString('base64url');
  const signature = signPayload(payload);

  return `${payload}.${signature}`;
}

export function verifyAdminToken(token) {
  const [payload, signature] = String(token || '').split('.');

  if (!payload || !signature) {
    throw new ApiRouteError('Invalid admin token.', 401);
  }

  const expectedSignature = signPayload(payload);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (signatureBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
    throw new ApiRouteError('Invalid admin token.', 401);
  }

  let data;
  try {
    data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  } catch {
    throw new ApiRouteError('Invalid admin token.', 401);
  }

  if (!data.exp || data.exp < Math.floor(Date.now() / 1000)) {
    throw new ApiRouteError('Admin session expired.', 401);
  }

  return data;
}

export async function requireAdmin(req) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  const tokenData = verifyAdminToken(token);

  if (String(tokenData.sub) === 'env-admin') {
    const adminEmail = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    const tokenEmail = String(tokenData.email || '').trim().toLowerCase();

    if (!adminEmail || tokenEmail !== adminEmail || tokenData.role !== 'admin') {
      throw new ApiRouteError('Admin account is not authorized.', 401);
    }

    return {
      id: 'env-admin',
      name: tokenData.name || 'MAGHRIB OUD Admin',
      email: adminEmail,
      role: 'admin',
      status: 'active',
    };
  }

  const supabase = getSupabaseAdmin();
  const { data: admin, error } = await supabase
    .from('admins')
    .select('id,name,email,role,status,created_at,updated_at')
    .eq('id', tokenData.sub)
    .eq('status', 'active')
    .single();

  if (error || !admin) {
    throw new ApiRouteError('Admin account is not authorized.', 401);
  }

  return admin;
}

export async function verifyPassword(password, passwordHash) {
  if (!password || !passwordHash) return false;
  return bcrypt.compare(password, passwordHash);
}

export async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

export function sanitizeAdmin(admin = {}) {
  return {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
    status: admin.status,
  };
}
