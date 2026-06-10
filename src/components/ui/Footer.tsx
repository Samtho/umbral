import { UmbralMark } from "@/components/ui/Nav";

export default function Footer() {
  return (
    <footer className="no-print border-t border-line">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-5 py-8 text-sm text-muted sm:flex-row">
        <div className="flex items-center gap-2">
          <UmbralMark size={18} />
          <span className="font-display font-semibold text-ink">UMBRAL</span>
          <span>· el umbral entre tú y el puesto</span>
        </div>
        <p>by Jano · cada línea es evidencia, nada se inventa · 2026</p>
      </div>
    </footer>
  );
}
