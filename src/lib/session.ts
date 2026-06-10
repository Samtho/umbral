// Identidad y estado por navegador (localStorage). Cada visitante tiene su
// propio cvId. Leer SOLO en handlers o useEffect (el prerender es estatico).

import type { Contacto } from "@/lib/types";

const KEYS = {
  cvId: "umbral.cvId",
  cvTexto: "umbral.cvTexto",
  cvGuardado: "umbral.cvGuardado",
  ofertaTexto: "umbral.ofertaTexto",
  contacto: "umbral.contacto",
} as const;

export function getCvId(): string {
  let id = localStorage.getItem(KEYS.cvId);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEYS.cvId, id);
  }
  return id;
}

export function loadSession() {
  let contacto: Contacto = { nombre: "" };
  try {
    contacto = JSON.parse(localStorage.getItem(KEYS.contacto) ?? "{}");
  } catch {
    // contacto corrupto: se ignora
  }
  return {
    cvTexto: localStorage.getItem(KEYS.cvTexto) ?? "",
    cvGuardado: localStorage.getItem(KEYS.cvGuardado) === "1",
    ofertaTexto: localStorage.getItem(KEYS.ofertaTexto) ?? "",
    contacto,
  };
}

export function saveCv(texto: string, guardado: boolean) {
  localStorage.setItem(KEYS.cvTexto, texto);
  localStorage.setItem(KEYS.cvGuardado, guardado ? "1" : "0");
}

export function saveOferta(texto: string) {
  localStorage.setItem(KEYS.ofertaTexto, texto);
}

export function saveContacto(c: Contacto) {
  localStorage.setItem(KEYS.contacto, JSON.stringify(c));
}
