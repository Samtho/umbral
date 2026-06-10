"use client";

import Button from "@/components/ui/Button";
import { useReveal } from "@/lib/useReveal";

export default function Landing() {
  useReveal();

  return (
    <>
      {/* Hero editorial */}
      <section className="mx-auto max-w-5xl px-5 pb-16 pt-20 text-center md:pt-28">
        <div className="fade-up" style={{ "--i": 0 } as React.CSSProperties}>
          <span className="file-tab">Expediente · Candidatura · 2026</span>
        </div>
        <h1
          className="fade-up mx-auto mt-6 max-w-3xl font-display text-5xl font-bold leading-[1.04] tracking-tight md:text-7xl"
          style={{ "--i": 1 } as React.CSSProperties}
        >
          No postules
          <br />a ciegas.
        </h1>
        <p
          className="fade-up mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-2"
          style={{ "--i": 2 } as React.CSSProperties}
        >
          Todos los productos del mercado te optimizan a ti para la oferta. Umbral invierte el
          espejo dos veces: <strong className="text-ink">la oferta se evalúa para ti</strong>, y tu
          CV deja de ser un PDF para ser <strong className="text-ink">un enlace verificable</strong>.
        </p>
        <div className="fade-up mt-9 flex justify-center gap-3" style={{ "--i": 3 } as React.CSSProperties}>
          <Button href="/analizar/" arrow>
            Analizar una oferta
          </Button>
        </div>
        <p className="fade-up mt-4 text-xs text-muted" style={{ "--i": 4 } as React.CSSProperties}>
          Sin registro · tu CV se lee en tu navegador · cada línea con evidencia
        </p>
      </section>

      {/* Las dos caras */}
      <section className="border-y border-line bg-surface/70">
        <div className="mx-auto grid max-w-5xl gap-6 px-5 py-20 md:grid-cols-2">
          {/* Cara privada: el veredicto */}
          <div className="reveal rounded-2xl border border-line bg-paper p-8 shadow-card" style={{ "--i": 0 } as React.CSSProperties}>
            <span className="file-tab">Cara privada</span>
            <h2 className="mt-4 font-display text-3xl font-bold">El veredicto</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-2">
              Antes de gastar una tarde en una candidatura, Umbral lee la oferta con tus ojos: qué
              ganas si entras, qué señales de alarma tiene, y un dictamen claro.
            </p>
            <div className="mt-6 flex items-center justify-center rounded-xl border border-dashed border-line bg-surface py-8">
              <span className="stamp text-ok">Postula</span>
            </div>
            <p className="mt-4 text-xs text-muted">
              POSTULA · POSTULA CON RESERVAS · DESCARTA, siempre con razones.
            </p>
          </div>

          {/* Cara pública: el dossier */}
          <div className="reveal rounded-2xl border border-line bg-paper p-8 shadow-card" style={{ "--i": 1 } as React.CSSProperties}>
            <span className="file-tab">Cara pública</span>
            <h2 className="mt-4 font-display text-3xl font-bold">El dossier vivo</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-2">
              Si decides cruzar, no envías un PDF muerto: envías un enlace. Una candidatura formato
              Harvard, reordenada para esa oferta, donde el recruiter puede auditar cada línea.
            </p>
            <div className="mt-6 rounded-xl border border-line bg-surface p-4 text-left">
              <p className="text-sm font-medium text-ink">
                &ldquo;Lideré la migración de 22 sitios Magento en 4 regiones&rdquo;
              </p>
              <div className="mt-2 rounded-lg bg-tint px-3 py-2 text-[11px] leading-relaxed text-accent-deep">
                <span className="font-bold uppercase tracking-wider">Evidencia verificada</span> ·
                Product Owner del canal ecommerce global en Giunti Psychometrics
              </div>
            </div>
            <p className="mt-4 text-xs text-muted">El primer CV donde cada afirmación se puede comprobar.</p>
          </div>
        </div>
      </section>

      {/* Como funciona, en 3 lineas */}
      <section className="mx-auto max-w-5xl px-5 py-20">
        <div className="grid gap-8 md:grid-cols-3">
          {[
            ["01", "Tu CV, una vez", "PDF, Word o texto. Se convierte en hechos con origen; el archivo no sale de tu navegador."],
            ["02", "Pega la oferta", "Texto o enlace. Umbral emite el veredicto: qué ganas, qué arriesgas, si cruzar o no."],
            ["03", "Cruza con tu dossier", "Un enlace verificable en vez de un PDF. Imprimible en una página Harvard si lo piden."],
          ].map(([n, t, d], i) => (
            <div key={n} className="reveal" style={{ "--i": i } as React.CSSProperties}>
              <span className="font-display text-4xl font-bold text-danger/30">{n}</span>
              <h3 className="mt-2 font-display text-xl font-bold">{t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-2">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Cierre */}
      <section className="border-t border-line bg-ink text-paper">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-5 py-24 text-center">
          <h2 className="reveal font-display text-4xl font-bold tracking-tight md:text-5xl">
            Jano mira a los dos lados.
            <br />
            Ahora tú también.
          </h2>
          <p className="reveal max-w-md text-sm leading-relaxed text-paper/70" style={{ "--i": 1 } as React.CSSProperties}>
            El dios de los umbrales tiene dos caras: una mira lo que ganas, la otra cómo te ven. En
            el medio, tu decisión.
          </p>
          <span className="reveal" style={{ "--i": 2 } as React.CSSProperties}>
            <Button href="/analizar/" arrow>
              Cruzar el umbral
            </Button>
          </span>
        </div>
      </section>
    </>
  );
}
