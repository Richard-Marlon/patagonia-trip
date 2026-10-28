import { getStore } from '@netlify/blobs';

export const STAGE_IDS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));

function store() {
  return getStore('patagonia2027');
}

function defaultEtapas() {
  const etapas = {};
  for (const id of STAGE_IDS) {
    etapas[id] = { feito: false, por: null, em: null };
  }
  return etapas;
}

/** Lê o estado salvo e garante que as 12 etapas sempre existam no retorno. */
export async function readEtapas() {
  const saved = await store().get('etapas', { type: 'json' });
  const etapas = defaultEtapas();
  if (saved && typeof saved === 'object') {
    for (const id of STAGE_IDS) {
      if (saved[id] && typeof saved[id] === 'object') {
        etapas[id] = {
          feito: !!saved[id].feito,
          por: saved[id].por ?? null,
          em: saved[id].em ?? null,
        };
      }
    }
  }
  return etapas;
}

export async function writeEtapas(etapas) {
  await store().setJSON('etapas', etapas);
}

export function isValidStageId(id) {
  return typeof id === 'string' && STAGE_IDS.includes(id);
}
