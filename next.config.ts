import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
/*   output: "export", // Habilita `next export` para generar archivos estáticos
  trailingSlash: true, // Agrega `/index.html` a las rutas para S3 */
  api: {
    bodyParser: {
      sizeLimit: '100mb', // Esto establece el límite a 100 MB
    },
  },
};

export default nextConfig;
