import type { NextConfig } from "next";

// Export estatico para GitHub Pages. basePath incondicional (dev = prod):
// la app vive siempre bajo /umbral, asi no hay sorpresas al desplegar.
const nextConfig: NextConfig = {
  output: "export",
  basePath: "/umbral",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
