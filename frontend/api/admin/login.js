import crypto from 'node:crypto';
import {
  ApiRouteError,
  createAdminToken,
  fail,
  ok,
  parseBody,
  requireMethod,
  sendJson,
} from '../../server/supabase.js';

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(String(left || ''));
  const rightBuffer = Buffer.from(String(right || ''));

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'POST,OPTIONS');
    return res.status(204).end();
  }

  try {
    requireMethod(req, ['POST']);

    const adminEmail = normalizeEmail(process.env.ADMIN_EMAIL);
    const adminPassword = String(process.env.ADMIN_PASSWORD || '');
    const tokenSecret = String(process.env.ADMIN_TOKEN_SECRET || '');

    if (!adminEmail || !adminPassword || !tokenSecret) {
      throw new ApiRouteError('Admin login is not configured.', 500);
    }

    const body = await parseBody(req);
    const email = normalizeEmail(body.email);
    const password = String(body.password || '');

    if (!safeEqual(email, adminEmail) || !safeEqual(password, adminPassword)) {
      return sendJson(res, 401, {
        success: false,
        message: 'Invalid credentials.',
        data: null,
      });
    }

    const admin = {
      id: 'env-admin',
      name: 'MAGHRIB OUD Admin',
      email: adminEmail,
      role: 'admin',
      status: 'active',
      source: 'env',
    };

    return ok(
      res,
      {
        token: createAdminToken(admin),
        admin: {
          email: admin.email,
          name: admin.name,
          role: admin.role,
        },
      },
      'Login successful.'
    );
  } catch (error) {
    return fail(res, error, 'The admin service is not available right now.');
  }
}
