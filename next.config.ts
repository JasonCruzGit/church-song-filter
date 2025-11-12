import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Turbopack is enabled by default in Next.js 16
  // Prisma client should work without webpack config
  experimental: {
    // Ensure PostCSS is used for CSS processing
  },
};

export default nextConfig;
