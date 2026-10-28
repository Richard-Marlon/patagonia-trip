import { getStore } from '@netlify/blobs';

const WINDOW_MS = 10 * 60 * 1000; // 10 minutos
const MAX_ATTEMPTS = 5;

function rateLimitStore() {
  return getStore('patagonia2027-ratelimit');
}

function safeKey(ip) {
  // nomes de blob não podem ter alguns caracteres especiais; IPv6 usa ":"
  return `login_${String(ip || 'unknown').replace(/[^a-zA-Z0-9.]/g, '_')}`;
}

export async function isRateLimited(ip) {
  const store = rateLimitStore();
  const record = await store.get(safeKey(ip), { type: 'json' });
  if (!record) return false;
  if (Date.now() - record.windowStart > WINDOW_MS) return false;
  return record.count >= MAX_ATTEMPTS;
}

export async function recordFailedAttempt(ip) {
  const store = rateLimitStore();
  const key = safeKey(ip);
  const now = Date.now();
  let record = await store.get(key, { type: 'json' });
  if (!record || now - record.windowStart > WINDOW_MS) {
    record = { windowStart: now, count: 0 };
  }
  record.count += 1;
  await store.setJSON(key, record);
}

export async function clearAttempts(ip) {
  const store = rateLimitStore();
  await store.delete(safeKey(ip));
}

export function clientIp(req, context) {
  return (context && context.ip) || req.headers.get('x-nf-client-connection-ip') || 'unknown';
}
