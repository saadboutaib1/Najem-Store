import {
  ApiRouteError,
  fail,
  formatProduct,
  getSupabaseAdmin,
  ok,
  requireMethod,
  sendJson,
} from '../_lib/supabase.js';

const PRODUCT_SELECT = `
  *,
  category:categories(id,slug,name_ar,name_en,name_fr,description_ar,description_en,description_fr,status)
`;

function isNumericId(value) {
  return /^\d+$/.test(String(value || ''));
}

function getIdentifier(req) {
  const value = req.query?.id;
  const identifier = Array.isArray(value) ? value[0] : value;
  return decodeURIComponent(String(identifier || '').trim());
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'GET,OPTIONS');
    return res.status(204).end();
  }

  try {
    requireMethod(req, ['GET']);

    const identifier = getIdentifier(req);
    if (!identifier) {
      throw new ApiRouteError('Product not found.', 404);
    }

    const supabase = getSupabaseAdmin();
    let query = supabase
      .from('products')
      .select(PRODUCT_SELECT)
      .eq('status', 'active')
      .limit(1);

    query = isNumericId(identifier) ? query.eq('id', Number(identifier)) : query.eq('slug', identifier);

    const { data, error } = await query.maybeSingle();

    if (error) {
      throw new ApiRouteError('Could not load product.', 500);
    }

    if (!data) {
      return sendJson(res, 404, {
        success: false,
        message: 'Product not found.',
        data: null,
      });
    }

    return ok(res, formatProduct(data), 'Product loaded.');
  } catch (error) {
    return fail(res, error, 'The API service is not available right now.');
  }
}