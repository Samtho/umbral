"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Marca Umbral: dos jambas y el vano entre ellas (el umbral).
export function UmbralMark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden>
      <rect x="1" y="1" width="38" height="38" rx="8" fill="#1c1812" />
      <path d="M12 30 V12 a2 2 0 0 1 2-2 h3" stroke="#f6f2ea" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M28 30 V12 a2 2 0 0 0 -2-2 h-3" stroke="#f6f2ea" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="20" cy="21" r="2.4" fill="#b3322b" />
    </svg>
  );
}

export default function Nav() {
  const pathname = usePathname();
  const enDossier = pathname?.includes("/d/");
  if (enDossier) return null; // la pagina publica del dossier no lleva la nav de la app
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
        <Link href="/" className="flex items-baseline gap-3">
          <UmbralMark />
          <span className="font-display text-2xl font-bold tracking-tight">UMBRAL</span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">by Jano</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link
            href="/analizar/"
            aria-current={pathname?.startsWith("/analizar") ? "page" : undefined}
            className={`rounded-lg px-3.5 py-2 font-semibold transition-colors ${
              pathname?.startsWith("/analizar") ? "bg-tint text-accent-deep" : "text-muted-2 hover:bg-surface hover:text-ink"
            }`}
          >
            Analizar una oferta
          </Link>
        </nav>
      </div>
    </header>
  );
}
