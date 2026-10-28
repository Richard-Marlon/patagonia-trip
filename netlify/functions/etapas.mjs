import { verifyToken, getBearerToken } from './lib/auth.mjs';
import { readEtapas, writeEtapas, isValidStageId } from './lib/etapasStore.mjs';

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

export default async (req, context) => {
  if (req.method === 'GET') {
    const etapas = await readEtapas();
    return json(200, { etapas });
  }

  if (req.method !== 'POST') {
    return json(405, { erro: 'Método não permitido' });
  }

  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) {
    return json(500, { erro: 'Autenticação não configurada neste ambiente.' });
  }

  const token = getBearerToken(req);
  const session = token ? verifyToken(token, sessionSecret) : null;
  if (!session) {
    return json(401, { erro: 'Sessão inválida ou expirada. Entre novamente.' });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return json(400, { erro: 'Corpo da requisição inválido.' });
  }

  const { id, acao } = body || {};
  if (!isValidStageId(id)) {
    return json(400, { erro: 'Etapa inválida.' });
  }
  if (acao !== 'marcar' && acao !== 'desmarcar') {
    return json(400, { erro: 'Ação inválida.' });
  }

  if (acao === 'desmarcar' && session.role !== 'admin') {
    return json(403, { erro: 'Apenas o Richard pode desmarcar.' });
  }
  // "marcar" já está liberado para admin e editor (únicos papéis válidos).

  const etapas = await readEtapas();
  etapas[id] = {
    feito: acao === 'marcar',
    por: session.role,
    em: new Date().toISOString(),
  };
  await writeEtapas(etapas);

  return json(200, { etapas });
};
