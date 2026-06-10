import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import Nav from "@/components/ui/Nav";
import Footer from "@/components/ui/Footer";
import { ToastProvider } from "@/components/ui/Toast";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["opsz"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://samtho.github.io/umbral/"),
  title: "Umbral · No postules a ciegas",
  description:
    "Umbral evalúa cada oferta PARA TI (qué ganas, qué riesgos, veredicto: postula o descarta) y convierte tu candidatura en un enlace auditable: el primer CV donde el recruiter puede verificar cada línea.",
  icons: { icon: "/umbral/favicon.svg" },
  openGraph: {
    title: "Umbral · No postules a ciegas",
    description:
      "El veredicto de cada oferta y tu candidatura como enlace verificable. By Jano.",
    type: "website",
    locale: "es_ES",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="min-h-screen flex flex-col">
        <ToastProvider>
          <Nav />
          <main className="flex-1">{children}</main>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
