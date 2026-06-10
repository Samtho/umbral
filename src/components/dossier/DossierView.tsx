"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Pill from "@/components/ui/Pill";
import { useToast } from "@/components/ui/Toast";
import { getDossier } from "@/lib/api";
import type { BulletCv, CvHarvard, Contacto, Dossier, SeccionCv } from "@/lib/types";

const ORDEN: Record<string, number> = { experiencia: 1, habilidades: 2, educacion: 3, certificaciones: 4, otros: 5 };

function parseJson<T>(v: unknown): T {
  if (typeof v === "string") {
    try {
      return JSON.parse(v) as T;
    } catch {
      return {} as T;
    }
  }
  return (v ?? {}) as T;
}

export default function DossierView() {
  const toast = useToast();
  const [dossier, setDossier] = useState<Dossier | null>(null);
  const [error, setError] = useState(false);
  const [evidencia, setEvidencia] = useState<string[] | null>(null);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("id");
    if (!id) {
      setError(true);
      return;
    }
    getDossier(id)
      .then((d) => {
        if (!d || !("id" in d) || !d.id) throw new Error("no existe");
        setDossier({
          ...d,
          contacto: parseJson<Contacto>(d.contacto),
          cv: parseJson<CvHarvard>(d.cv),
          oferta: parseJson<{ titulo: string; empresa: string }>(d.oferta),
        });
      })
      .catch(() => setError(true));
  }, []);

  function imprimir() {
    if (!dossier) return;
    const titulo = document.title;
    document.title = `CV - ${dossier.contacto.nombre}${dossier.oferta.empresa ? ` - ${dossier.oferta.empresa}` : ""}`;
    window.print();
    document.title = titulo;
  }

  function auditar(origen: BulletCv["origen"]) {
    const lista = Array.isArray(origen) ? origen : [origen];
    setEvidencia(lista.filter(Boolean));
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-32 text-center">
        <h1 className="font-display text-4xl font-bold">Este dossier no existe.</h1>
        <p className="mt-3 text-sm text-muted-2">El enlace puede estar incompleto. Pide a quien te lo envió que lo copie de nuevo.</p>
      </div>
    );
  }

  if (!dossier) {
    return (
      <div className="mx-auto max-w-3xl space-y-3 px-5 py-20" aria-live="polite" aria-label="Cargando candidatura">
        <div className="skeleton h-10 w-1/2" />
        <div className="skeleton h-4 w-2/3" />
        <div className="skeleton h-64 w-full" />
      </div>
    );
  }

  const { contacto, cv, oferta } = dossier;
  const contactoLinea = [contacto.ciudad, contacto.email, contacto.linkedin].filter(Boolean).join(" · ");
  const secciones = [...(cv.secciones ?? [])].sort((a, b) => (ORDEN[a.tipo] ?? 9) - (ORDEN[b.tipo] ?? 9));

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      {/* Cabecera del expediente (no se imprime) */}
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="file-tab">
            Candidatura{oferta.titulo ? ` · ${oferta.titulo}` : ""}{oferta.empresa ? ` · ${oferta.empresa}` : ""}
          </span>
          <p className="mt-2 text-xs text-muted">
            Cada línea de este dossier es auditable: haz clic y verás la evidencia literal de la que sale.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Pill tone="accent">Evidencia auditable</Pill>
          <Button variant="ghost" onClick={imprimir}>
            Imprimir / PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* La hoja Harvard */}
        <div className="print-area dossier-sheet rounded-xl p-9">
          <header className="text-center">
            <h1 className="cv-nombre font-display text-3xl font-bold tracking-tight">{contacto.nombre}</h1>
            {contacto.titular && <p className="mt-0.5 text-sm font-medium">{contacto.titular}</p>}
            {contactoLinea && <p className="mt-1 text-xs text-[#444]">{contactoLinea}</p>}
          </header>

          {cv.perfil && (
            <section className="mt-5">
              <h2 className="seccion-titulo">Perfil</h2>
              <button
                onClick={() => auditar(cv.perfil_origen ?? [])}
                className="mt-2 w-full rounded px-1 py-0.5 text-left text-sm leading-relaxed"
              >
                {cv.perfil}
              </button>
            </section>
          )}

          {secciones.map((s: SeccionCv) => (
            <section key={s.titulo} className="mt-5">
              <h2 className="seccion-titulo">{s.titulo}</h2>

              {s.bloques?.map((b, bi) => (
                <div key={bi} className="bloque-exp mt-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <p className="text-sm font-bold">
                      {b.puesto}
                      {b.empresa && <span className="font-normal"> — {b.empresa}</span>}
                      {b.ubicacion && <span className="font-normal text-[#555]">, {b.ubicacion}</span>}
                    </p>
                    {b.fechas && <span className="text-xs text-[#555]">{b.fechas}</span>}
                  </div>
                  {b.bullets && b.bullets.length > 0 && (
                    <ul className="mt-1.5 space-y-1">
                      {b.bullets.map((bu, i) => (
                        <li key={i}>
                          <button
                            onClick={() => auditar(bu.origen)}
                            className="w-full rounded px-1 py-0.5 text-left text-sm leading-snug"
                          >
                            {bu.texto}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}

              {s.grupos && (
                <div className="mt-2 space-y-1">
                  {s.grupos.map((g) => (
                    <p key={g.categoria} className="text-sm leading-snug">
                      <span className="font-bold">{g.categoria}:</span> {g.items.join(", ")}
                    </p>
                  ))}
                </div>
              )}

              {s.bullets && (
                <ul className="mt-2 space-y-1">
                  {s.bullets.map((bu, i) => (
                    <li key={i}>
                      <button onClick={() => auditar(bu.origen)} className="w-full rounded px-1 py-0.5 text-left text-sm leading-snug">
                        {bu.texto}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        {/* Panel de evidencia (no se imprime) */}
        <aside className="no-print space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-2xl border border-line bg-surface p-6 shadow-card">
            <h3 className="font-display text-lg font-bold">La evidencia</h3>
            <p className="mt-1 text-xs text-muted">Clic en cualquier línea del dossier.</p>
            {evidencia ? (
              evidencia.length ? (
                <div className="mt-4 space-y-2">
                  {evidencia.map((e, i) => (
                    <div key={i} className="pop rounded-xl border border-accent/25 bg-tint p-3.5" style={{ animationDelay: `${i * 80}ms` }}>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-accent-deep">Hecho verificado {evidencia.length > 1 ? i + 1 : ""}</p>
                      <p className="mt-1 text-sm leading-relaxed">&ldquo;{e}&rdquo;</p>
                    </div>
                  ))}
                  <p className="text-[11px] leading-relaxed text-muted">
                    Esta línea se apoya en {evidencia.length > 1 ? "estos hechos" : "este hecho"} del expediente original del candidato. Si el hecho no existiera, la línea tampoco.
                  </p>
                </div>
              ) : (
                <div className="mt-4 rounded-xl border border-dashed border-line p-4 text-center text-xs italic text-muted">
                  Esta línea no declaró evidencia específica.
                </div>
              )
            ) : (
              <div className="mt-4 rounded-xl border border-dashed border-line p-4 text-center text-xs italic text-muted">
                Aún no has auditado ninguna línea.
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-line bg-paper p-5 text-xs leading-relaxed text-muted">
            <p className="font-bold text-ink">¿Por qué un enlace y no un PDF?</p>
            <p className="mt-1">
              Porque un PDF afirma y un dossier demuestra. Este documento fue generado solo a partir
            de hechos reales del candidato, sin invención, y cada línea conserva su trazabilidad.
            </p>
            <p className="mt-2">
              Para PDF: Imprimir y en &ldquo;Más ajustes&rdquo; desactiva &ldquo;Encabezados y pies de página&rdquo;.
            </p>
          </div>

          <p className="text-center text-[11px] text-muted">
            Creado con <span className="font-display font-bold text-ink">UMBRAL</span> · by Jano
          </p>
        </aside>
      </div>
    </div>
  );
}
