import type { Dossier, MatchResult, Veredicto } from "@/lib/types";

// Umbral habla con el mismo motor n8n: REUTILIZA los webhooks v2 (ingesta,
// match, oferta por URL) y suma los v3 propios (veredicto, dossier).
const BASE = "https://samtho.app.n8n.cloud/webhook";

const PATHS = {
  // v2 reutilizados (no se tocan)
  ingestCv: "/v2-ingest-cv",
  matchOferta: "/v2-match-oferta",
  ofertaDesdeUrl: "/v2-oferta-url",
  // v3 de Umbral
  veredicto: "/v3-veredicto",
  dossierCrear: "/v3-dossier-crear",
  dossierGet: "/v3-dossier-get",
} as const;

// POST con un reintento automatico ante fallo de red o 5xx.
async function post<T>(path: string, body: unknown, intento = 1): Promise<T> {
  try {
    const res = await fetch(`${BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.status >= 500 && intento === 1) {
      await new Promise((r) => setTimeout(r, 700));
      return post<T>(path, body, 2);
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.detalle || data.error || data.message || `Error ${res.status}`);
    }
    return data as T;
  } catch (e) {
    if (intento === 1 && e instanceof TypeError) {
      await new Promise((r) => setTimeout(r, 700));
      return post<T>(path, body, 2);
    }
    throw e;
  }
}

export function ingestCv(cvId: string, textoCV: string) {
  return post<{ ok: boolean; guardados: number }>(PATHS.ingestCv, { cvId, textoCV });
}

export function matchOferta(cvId: string, ofertaTexto: string) {
  return post<MatchResult>(PATHS.matchOferta, { cvId, oferta_texto: ofertaTexto });
}

export function ofertaDesdeUrl(url: string) {
  return post<{ oferta_texto: string; titulo?: string; empresa?: string }>(PATHS.ofertaDesdeUrl, { url });
}

export function pedirVeredicto(cvId: string, ofertaTexto: string) {
  return post<Veredicto>(PATHS.veredicto, { cvId, oferta_texto: ofertaTexto });
}

export function crearDossier(p: {
  cvId: string;
  oferta_texto: string;
  contacto: { nombre: string; titular?: string; email?: string; ciudad?: string; linkedin?: string };
  matchScore?: number;
  titulo?: string;
  empresa?: string;
}) {
  return post<{ id: string }>(PATHS.dossierCrear, p);
}

export async function getDossier(id: string): Promise<Dossier> {
  const res = await fetch(`${BASE}${PATHS.dossierGet}?id=${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json();
}
