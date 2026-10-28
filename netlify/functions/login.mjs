import { signToken, constantTimeEquals, ROLE_NAMES } from './lib/auth.mjs';
import { isRateLimited, recordFailedAttempt, clearAttempts, clientIp } from './lib/rateLimit.mjs';

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

export default async (req, context) => {
  if (req.method !== 'POST') {
    return json(405, { erro: 'Método não permitido' });
  }

  const sessionSecret = process.env.SESSION_SECRET;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const editorPassword = process.env.EDITOR_PASSWORD;

  if (!sessionSecret || !adminPassword) {
    // Configuração ausente no Netlify: nunca autentica silenciosamente.
    return json(500, { erro: 'Login não configurado neste ambiente.' });
  }

  const ip = clientIp(req, context);

  if (await isRateLimited(ip)) {
    return json(429, { erro: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.' });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return json(400, { erro: 'Corpo da requisição inválido.' });
  }

  const senha = typeof body?.senha === 'string' ? body.senha : '';
  if (!senha) {
    await recordFailedAttempt(ip);
    return json(400, { erro: 'Informe a senha.' });
  }

  let role = null;
  if (constantTimeEquals(senha, adminPassword)) {
    role = 'admin';
  } else if (editorPassword && constantTimeEquals(senha, editorPassword)) {
    role = 'editor';
  }

  if (!role) {
    await recordFailedAttempt(ip);
    return json(401, { erro: 'Senha incorreta.' });
  }

  await clearAttempts(ip);

  const token = signToken(role, sessionSecret);
  return json(200, { token, role, nome: ROLE_NAMES[role] });
};
