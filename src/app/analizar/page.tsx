import type { Metadata } from "next";
import Analizador from "@/components/analizar/Analizador";

export const metadata: Metadata = {
  title: "Analizar una oferta · Umbral",
};

export default function AnalizarPage() {
  return <Analizador />;
}
