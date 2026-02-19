/** @type {import('next').NextConfig} */
const nextConfig = {
  // Corrige l'inférence du workspace root (lockfile parent)
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
