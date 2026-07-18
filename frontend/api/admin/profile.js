import {
  ApiRouteError,
  fail,
  getSupabaseAdmin,
  ok,
  requireAdmin,
  requireMethod,
  sendJson,
} from '../../server/supabase.js';

function toPublicAdmin(admin = {}) {
  return {
    name: admin.name || 'MAGHRIB OUD Admin',
    email: admin.email || process.env.ADMIN_EMAIL || '',
    role: admin.role || 'admin',
  };
}

async function updateSupabaseAdmin(admin, body = {}) {
  const email = String(body.email || '').trim().toLowerCase();

  if (!email) {
    throw new ApiRouteError('Email is required.', 422);
  }

  if (String(admin.id) === 'env-admin') {
    return toPublicAdmin(admin);
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('admins')
    .update({ email, updated_at: new Date().toISOString() })
    .eq('id', admin.id)
    .select('id,name,email,role,status')
    .single();

  if (error) {
    throw new ApiRouteError('Could not update profile.', 500);
  }

  return toPublicAdmin(data);
}

async function readJsonBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'object') return req.body;

  try {
    return JSON.parse(req.body);
  } catch {
    throw new ApiRouteError('Invalid JSON body.', 400);
  }
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'GET,PUT,OPTIONS');
    return res.status(204).end();
  }

  try {
    requireMethod(req, ['GET', 'PUT']);
    const admin = await requireAdmin(req);

    if (req.method === 'PUT') {
      return ok(
        res,
        {
          admin: await updateSupabaseAdmin(admin, await readJsonBody(req)),
        },
        'Admin profile updated.'
      );
    }

    return ok(
      res,
      {
        admin: toPublicAdmin(admin),
      },
      'Admin profile loaded.'
    );
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
