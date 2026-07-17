import {
  ApiRouteError,
  fail,
  getSupabaseAdmin,
  ok,
  requireAdmin,
  requireMethod,
  sendJson,
  toNumber,
} from '../_lib/supabase.js';

async function safeCount(supabase, table, filter = null) {
  let query = supabase.from(table).select('id', { count: 'exact', head: true });

  if (filter) {
    query = filter(query);
  }

  const { count, error } = await query;
  if (error) return 0;

  return count || 0;
}

async function loadDashboardData() {
  const supabase = getSupabaseAdmin();
  const [totalProducts, totalCategories, totalOrders, pendingOrders, deliveredOrders, revenueResult, deliveredRevenueResult, latestOrdersResult] = await Promise.all([
    safeCount(supabase, 'products'),
    safeCount(supabase, 'categories'),
    safeCount(supabase, 'orders'),
    safeCount(supabase, 'orders', (query) => query.eq('status', 'pending')),
    safeCount(supabase, 'orders', (query) => query.eq('status', 'delivered')),
    supabase.from('orders').select('total,status').neq('status', 'cancelled'),
    supabase.from('orders').select('total,status').eq('status', 'delivered'),
    supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5),
  ]);

  const totalRevenue = (revenueResult.data || []).reduce((sum, order) => sum + toNumber(order.total), 0);
  const deliveredRevenue = (deliveredRevenueResult.data || []).reduce((sum, order) => sum + toNumber(order.total), 0);
  const latestOrders = latestOrdersResult.data || [];

  return {
    totalProducts,
    totalCategories,
    totalOrders,
    pendingOrders,
    deliveredOrders,
    latestOrders,
    deliveredRevenue: Math.round(deliveredRevenue * 100) / 100,
    total_products: totalProducts,
    total_categories: totalCategories,
    total_orders: totalOrders,
    pending_orders: pendingOrders,
    delivered_orders: deliveredOrders,
    total_revenue: Math.round(totalRevenue * 100) / 100,
    delivered_revenue: Math.round(deliveredRevenue * 100) / 100,
    latest_orders: latestOrders,
  };
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'GET,OPTIONS');
    return res.status(204).end();
  }

  try {
    requireMethod(req, ['GET']);
    await requireAdmin(req);

    return ok(res, await loadDashboardData(), 'Dashboard loaded.');
  } catch (error) {
    if (Number(error?.status) === 401) {
      return sendJson(res, 401, {
        success: false,
        message: 'Unauthorized.',
        data: null,
      });
    }

    if (error instanceof ApiRouteError) {
      return fail(res, error, 'The admin service is not available right now.');
    }

    return fail(res, error, 'The admin service is not available right now.');
  }
}