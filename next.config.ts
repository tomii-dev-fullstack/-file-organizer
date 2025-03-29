import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  api: {
    bodyParser: {
      sizeLimit: '100mb', // Esto establece el límite a 100 MB
    },
  },
};

export default nextConfig;
