"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import FileDrop from "@/components/ui/FileDrop";
import Pill from "@/components/ui/Pill";
import ProcessLoader from "@/components/ui/ProcessLoader";
import ScoreRing from "@/components/ui/ScoreRing";
import { useToast } from "@/components/ui/Toast";
import * as api from "@/lib/api";
import { extractTextFromFile } from "@/lib/parsers";
import { getCvId, loadSession, saveContacto, saveCv, saveOferta } from "@/lib/session";
import { BASE_PATH } from "@/lib/basePath";
import type { Contacto, MatchResult, Veredicto } from "@/lib/types";

const STAGES = [
  "Leyendo la oferta con tus ojos",
  "Cruzando requisitos con tu evidencia",
  "Buscando señales de alarma",
  "Emitiendo el veredicto",
];

const SELLO: Record<string, { texto: string; clase: string }> = {
  postula: { texto: "Postula", clase: "text-ok" },
  reservas: { texto: "Con reservas", clase: "text-warn" },
  descarta: { texto: "Descarta", clase: "text-danger" },
};

export default function Analizador() {
  const toast = useToast();
  const [fase, setFase] = useState<"entrada" | "analizando" | "veredicto">("entrada");

  // CV
  const [cvTexto, setCvTexto] = useState("");
  const [cvGuardado, setCvGuardado] = useState(false);
  const [cvAbierto, setCvAbierto] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [ingiriendo, setIngiriendo] = useState(false);

  // Oferta
  const [oferta, setOferta] = useState("");
  const [url, setUrl] = useState("");
  const [urlBusy, setUrlBusy] = useState(false);

  // Resultado
  const [veredicto, setVeredicto] = useState<Veredicto | null>(null);
  const [match, setMatch] = useState<MatchResult | null>(null);

  // Dossier
  const [contacto, setContacto] = useState<Contacto>({ nombre: "" });
  const [creando, setCreando] = useState(false);
  const [dossierId, setDossierId] = useState<string | null>(null);

  useEffect(() => {
    const s = loadSession();
    setCvTexto(s.cvTexto);
    setCvGuardado(s.cvGuardado);
    setOferta(s.ofertaTexto);
    setContacto({ ...s.contacto, nombre: s.contacto.nombre ?? "" });
    if (!s.cvGuardado) setCvAbierto(true);
  }, []);

  async function handleFile(file: File) {
    setParsing(true);
    try {
      const texto = await extractTextFromFile(file);
      setCvTexto(texto);
      toast(`Texto extraído de ${file.name}. Revísalo y guarda tu evidencia.`, "ok");
    } catch (e) {
      toast(e instanceof Error ? e.message : "No pude leer el archivo", "error");
    } finally {
      setParsing(false);
    }
  }

  async function guardarCv() {
    if (cvTexto.trim().length < 50) {
      toast("El CV parece muy corto. Pega el texto completo o sube un archivo.", "error");
      return;
    }
    setIngiriendo(true);
    try {
      const r = await api.ingestCv(getCvId(), cvTexto.trim());
      saveCv(cvTexto.trim(), true);
      setCvGuardado(true);
      setCvAbierto(false);
      toast(`Evidencia registrada: ${r.guardados} hechos con origen`, "ok");
    } catch (e) {
      toast(`No pude procesar el CV: ${e instanceof Error ? e.message : "error"}`, "error");
    } finally {
      setIngiriendo(false);
    }
  }

  async function traerDeUrl() {
    if (!/^https?:\/\//.test(url.trim())) {
      toast("Pega una URL completa (https://…)", "error");
      return;
    }
    setUrlBusy(true);
    try {
      let r = await api.ofertaDesdeUrl(url.trim());
      if (!r.oferta_texto || r.oferta_texto.length <= 100) {
        toast("El lector está ocupado, reintentando…", "info");
        await new Promise((res) => setTimeout(res, 6000));
        r = await api.ofertaDesdeUrl(url.trim());
      }
      if (r.oferta_texto && r.oferta_texto.length > 100) {
        setOferta(r.oferta_texto);
        toast("Oferta extraída del enlace.", "ok");
      } else {
        toast("Ese sitio no se deja leer. Pega el texto a mano.", "error");
      }
    } catch {
      toast("No pude leer la URL. Pega el texto a mano.", "error");
    } finally {
      setUrlBusy(false);
    }
  }

  async function analizar() {
    if (!cvGuardado) {
      setCvAbierto(true);
      toast("Primero registra tu CV: es la evidencia del análisis.", "error");
      return;
    }
    if (oferta.trim().length < 40) {
      toast("Pega el texto de la oferta antes de pedir el veredicto.", "error");
      return;
    }
    setFase("analizando");
    saveOferta(oferta.trim());
    setDossierId(null);
    try {
      const [v, m] = await Promise.all([
        api.pedirVeredicto(getCvId(), oferta.trim()),
        api.matchOferta(getCvId(), oferta.trim()),
      ]);
      setVeredicto(v);
      setMatch(m);
      setFase("veredicto");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      toast(`No pude emitir el veredicto: ${e instanceof Error ? e.message : "error"}`, "error");
      setFase("entrada");
    }
  }

  async function crearDossier() {
    if (!contacto.nombre.trim()) {
      toast("Tu nombre es el mínimo para un dossier presentable.", "error");
      return;
    }
    setCreando(true);
    saveContacto(contacto);
    try {
      const r = await api.crearDossier({
        cvId: getCvId(),
        oferta_texto: oferta.trim(),
        contacto,
        matchScore: match?.matchScore ?? 0,
        titulo: veredicto?.titulo ?? "",
        empresa: veredicto?.empresa ?? "",
      });
      setDossierId(r.id);
      toast("Dossier creado. Este enlace es tu candidatura.", "ok");
    } catch {
      toast("No pude crear el dossier. Reintenta.", "error");
    } finally {
      setCreando(false);
    }
  }

  const dossierUrl = dossierId ? `${window.location.origin}${BASE_PATH}/d/?id=${dossierId}` : null;

  if (fase === "analizando") {
    return (
      <div className="mx-auto max-w-5xl px-5 py-16">
        <h1 className="mb-8 text-center font-display text-3xl font-bold tracking-tight">
          Evaluando la oferta <em className="text-accent">para ti</em>…
        </h1>
        <ProcessLoader stages={STAGES} stepMs={2400} />
      </div>
    );
  }

  if (fase === "veredicto" && veredicto && match) {
    const sello = SELLO[veredicto.decision] ?? SELLO.reservas;
    return (
      <div className="step-in mx-auto max-w-5xl px-5 py-10">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <span className="file-tab">Veredicto · {veredicto.empresa || "Oferta"}</span>
            <h1 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
              {veredicto.titulo || "La oferta"}
              {veredicto.empresa && <span className="text-muted"> · {veredicto.empresa}</span>}
            </h1>
            {veredicto.salario_oferta && (
              <p className="mt-1 text-sm text-muted-2">Salario en la oferta: {veredicto.salario_oferta}</p>
            )}
          </div>
          <Button variant="ghost" onClick={() => setFase("entrada")}>
            ← Analizar otra
          </Button>
        </div>

        {/* Bifaz: las dos caras */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Cara 1: para ti */}
          <div className="rounded-2xl border border-line bg-surface p-7 shadow-card">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">Cara privada · lo que tú decides</p>
            <div className="my-6 flex justify-center">
              <span className={`stamp stamp-in ${sello.clase}`}>{sello.texto}</span>
            </div>
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-bold text-ok">Qué ganas</p>
                <ul className="mt-1.5 space-y-1.5">
                  {veredicto.ganas.map((g, i) => (
                    <li key={i} className="fade-up flex gap-2 leading-snug text-muted-2" style={{ "--i": i } as React.CSSProperties}>
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ok" />
                      {g}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-bold text-danger">Señales de alerta</p>
                <ul className="mt-1.5 space-y-1.5">
                  {veredicto.riesgos.map((r, i) => (
                    <li key={i} className="fade-up flex gap-2 leading-snug text-muted-2" style={{ "--i": i } as React.CSSProperties}>
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-danger" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl bg-surface-2 p-4 text-xs leading-relaxed text-muted-2">
                {veredicto.razones.join(" ")}
              </div>
            </div>
          </div>

          {/* Cara 2: como te ven */}
          <div className="rounded-2xl border border-line bg-surface p-7 shadow-card">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">Cara pública · cómo te ven ellos</p>
            <div className="mt-4 flex justify-center">
              <ScoreRing value={match.matchScore} size={160} label="Cobertura" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div>
                <Pill tone="ok">Cubres · {match.cubre.length}</Pill>
                <ul className="mt-2 space-y-1">
                  {match.cubre.slice(0, 5).map((c) => (
                    <li key={c} className="leading-snug text-muted-2">· {c}</li>
                  ))}
                </ul>
              </div>
              <div>
                <Pill tone="danger">Huecos · {match.noCubre.length}</Pill>
                <ul className="mt-2 space-y-1">
                  {match.noCubre.slice(0, 5).map((c) => (
                    <li key={c} className="leading-snug text-muted-2">· {c}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Crear dossier */}
        <div className="mt-8 rounded-2xl border border-line bg-surface p-7 shadow-card">
          {dossierUrl ? (
            <div className="text-center">
              <span className="pop inline-block"><Pill tone="ok">Dossier creado</Pill></span>
              <h2 className="mt-3 font-display text-2xl font-bold">Tu candidatura ya no es un PDF.</h2>
              <p className="mx-auto mt-1 max-w-md text-sm text-muted-2">
                Envía este enlace: el recruiter verá tu dossier adaptado a su oferta y podrá auditar
                cada línea hasta su evidencia.
              </p>
              <div className="mx-auto mt-4 flex max-w-xl items-center gap-2">
                <code className="flex-1 truncate rounded-xl border border-line bg-paper px-4 py-2.5 text-left text-xs">{dossierUrl}</code>
                <Button
                  variant="mini"
                  onClick={() => {
                    navigator.clipboard.writeText(dossierUrl);
                    toast("Enlace copiado", "ok");
                  }}
                >
                  Copiar
                </Button>
              </div>
              <div className="mt-4">
                <Button href={`/d/?id=${dossierId}`} arrow>
                  Ver mi dossier
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid items-center gap-6 md:grid-cols-[1fr_auto]">
              <div>
                <h2 className="font-display text-2xl font-bold">¿Cruzas el umbral?</h2>
                <p className="mt-1 max-w-lg text-sm text-muted-2">
                  Crea tu dossier: una candidatura formato Harvard, reordenada para esta oferta, con
                  cada línea auditable. Se envía como enlace, no como PDF.
                </p>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <input value={contacto.nombre} onChange={(e) => setContacto({ ...contacto, nombre: e.target.value })} placeholder="Tu nombre completo" aria-label="Nombre" className="rounded-xl border border-line bg-paper px-3.5 py-2 text-sm outline-none focus:border-accent/50" />
                  <input value={contacto.titular ?? ""} onChange={(e) => setContacto({ ...contacto, titular: e.target.value })} placeholder="Titular (ej. Product Manager)" aria-label="Titular" className="rounded-xl border border-line bg-paper px-3.5 py-2 text-sm outline-none focus:border-accent/50" />
                  <input value={contacto.email ?? ""} onChange={(e) => setContacto({ ...contacto, email: e.target.value })} placeholder="Email" aria-label="Email" className="rounded-xl border border-line bg-paper px-3.5 py-2 text-sm outline-none focus:border-accent/50" />
                  <input value={contacto.ciudad ?? ""} onChange={(e) => setContacto({ ...contacto, ciudad: e.target.value })} placeholder="Ciudad" aria-label="Ciudad" className="rounded-xl border border-line bg-paper px-3.5 py-2 text-sm outline-none focus:border-accent/50" />
                </div>
              </div>
              <Button onClick={crearDossier} disabled={creando} arrow>
                {creando ? "Redactando…" : "Crear mi dossier"}
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // fase entrada
  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <span className="file-tab">Expediente · Nueva candidatura</span>
      <h1 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-5xl">
        ¿Vale la pena <em className="text-accent">esta oferta</em>?
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-2">
        Pega la oferta y Umbral la evaluará para ti, contra tu trayectoria real. Veredicto honesto
        antes de gastar una tarde en postular.
      </p>

      {/* Tu evidencia (CV) */}
      <div className="mt-8 rounded-2xl border border-line bg-surface shadow-card">
        <button onClick={() => setCvAbierto(!cvAbierto)} className="flex w-full items-center justify-between px-6 py-4">
          <span className="flex items-center gap-3 text-sm font-bold">
            Tu evidencia
            {cvGuardado ? <Pill tone="ok">CV registrado</Pill> : <Pill tone="danger">Falta tu CV</Pill>}
          </span>
          <span className="text-muted">{cvAbierto ? "−" : "+"}</span>
        </button>
        {cvAbierto && (
          <div className="space-y-3 border-t border-line p-6">
            <FileDrop onFile={handleFile} busy={parsing} />
            <textarea
              value={cvTexto}
              onChange={(e) => setCvTexto(e.target.value)}
              rows={8}
              aria-label="Texto de tu CV"
              placeholder="…o pega aquí el texto completo de tu CV"
              className="w-full rounded-xl border border-line bg-paper p-4 text-sm leading-relaxed outline-none focus:border-accent/50"
            />
            <Button onClick={guardarCv} disabled={ingiriendo || parsing}>
              {ingiriendo ? "Registrando evidencia…" : cvGuardado ? "Actualizar mi evidencia" : "Registrar mi evidencia"}
            </Button>
            <p className="text-xs text-muted">El archivo se lee en tu navegador; al motor solo viaja texto.</p>
          </div>
        )}
      </div>

      {/* La oferta */}
      <div className="mt-6 space-y-3">
        <div className="flex gap-2">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && traerDeUrl()}
            placeholder="https://… (enlace a la oferta)"
            aria-label="URL de la oferta"
            className="flex-1 rounded-xl border border-line bg-surface px-4 py-2.5 text-sm shadow-card outline-none focus:border-accent/50"
          />
          <Button variant="ghost" onClick={traerDeUrl} disabled={urlBusy}>
            {urlBusy ? "Leyendo…" : "Traer oferta"}
          </Button>
        </div>
        <textarea
          value={oferta}
          onChange={(e) => setOferta(e.target.value)}
          rows={10}
          aria-label="Texto de la oferta"
          placeholder="…o pega aquí el texto completo de la oferta"
          className="w-full rounded-2xl border border-line bg-surface p-4 text-sm leading-relaxed shadow-card outline-none focus:border-accent/50"
        />
        <Button onClick={analizar} arrow>
          Emitir veredicto
        </Button>
      </div>
    </div>
  );
}
