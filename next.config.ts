import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    // dynamicIO: true, // Temporarily disabled due to conflicts with auth pages
    useCache: true, // Enable use cache directive
  },
  // Force specific auth routes to be dynamically rendered
  dynamicParams: true,
}

export default nextConfig
