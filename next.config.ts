import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "export", // Habilita `next export` para generar archivos estáticos
  trailingSlash: true, // Agrega `/index.html` a las rutas para S3
  images: {
    unoptimized: true, // Evita la optimización de imágenes (Next.js no lo soporta en exportación estática)
  },
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Esto establece el límite a 100 MB
    },
  },
};

export default nextConfig;
