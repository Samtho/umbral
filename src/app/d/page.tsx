import type { Metadata } from "next";
import DossierView from "@/components/dossier/DossierView";

export const metadata: Metadata = {
  title: "Candidatura · Umbral",
  robots: { index: false },
};

export default function DossierPage() {
  return <DossierView />;
}
