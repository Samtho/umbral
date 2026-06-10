// Tipos de Umbral: contratos con los webhooks n8n (v2 reutilizados + v3 nuevos).

export interface CategoriaDetalle {
  total: number;
  cubiertos: number;
  coberturaPct: number;
  peso: number;
}

export interface MatchResult {
  matchScore: number;
  porCategoria: Record<string, CategoriaDetalle>;
  cubre: string[];
  noCubre: string[];
}

// ===== Veredicto (v3): la oferta evaluada PARA el candidato =====
export type Decision = "postula" | "reservas" | "descarta";

export interface Veredicto {
  decision: Decision;
  titulo: string;
  empresa: string;
  sector: string;
  salario_oferta: string;
  ganas: string[];    // que te aporta este puesto (anclado a oferta + tus hechos)
  riesgos: string[];  // red flags y costes de la oferta
  razones: string[];  // por que el veredicto
}

// ===== Dossier (v3): CV Harvard con evidencia, persistido y publico =====
export interface BulletCv {
  texto: string;
  origen: string | string[]; // un bullet denso puede fusionar varios hechos
}

export interface BloqueExperiencia {
  puesto: string;
  empresa?: string;
  fechas?: string;
  ubicacion?: string;
  bullets: BulletCv[];
}

export interface GrupoHabilidades {
  categoria: string;
  items: string[];
}

export interface SeccionCv {
  tipo: "experiencia" | "habilidades" | "educacion" | "certificaciones" | "otros";
  titulo: string;
  bloques?: BloqueExperiencia[];
  grupos?: GrupoHabilidades[];
  bullets?: BulletCv[];
}

export interface Contacto {
  nombre: string;
  titular?: string;
  email?: string;
  ciudad?: string;
  linkedin?: string;
}

export interface CvHarvard {
  perfil: string; // parrafo <= 60 palabras
  perfil_origen: string[];
  secciones: SeccionCv[];
}

export interface Dossier {
  id: string;
  contacto: Contacto;
  cv: CvHarvard;
  oferta: { titulo: string; empresa: string };
  matchScore?: number;
  created_at?: string;
}
