import crypto from 'node:crypto';

const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 dias

export const ROLE_NAMES = {
  admin: 'Richard',
  editor: 'Jessika',
};

function base64url(buf) {
  return Buffer.from(buf).toString('base64url');
}

export function signToken(role, secret) {
  const payload = { role, exp: Date.now() + SESSION_DURATION_MS };
  const body = base64url(JSON.stringify(payload));
  const sig = crypto.createHmac('sha256', secret).update(body).digest('base64url');
  return `${body}.${sig}`;
}

export function verifyToken(token, secret) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  if (!body || !sig) return null;

  const expectedSig = crypto.createHmac('sha256', secret).update(body).digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  let payload;
  try {
    payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
  if (!payload || (payload.role !== 'admin' && payload.role !== 'editor')) return null;
  if (typeof payload.exp !== 'number' || Date.now() > payload.exp) return null;
  return payload;
}

export function getBearerToken(req) {
  const header = req.headers.get('authorization') || req.headers.get('Authorization');
  if (!header) return null;
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  return match ? match[1] : null;
}

/** Comparação em tempo constante, segura mesmo para strings de tamanhos diferentes. */
export function constantTimeEquals(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length === 0 || b.length === 0) return false;
  const ha = crypto.createHash('sha256').update(a).digest();
  const hb = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
}
