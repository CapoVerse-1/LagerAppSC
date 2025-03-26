/** @type {import('next').NextConfig} */
const nextConfig = {
  // Core configurations
  reactStrictMode: false,
  swcMinify: true,
  
  // Disable certain checks during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Image optimization
  images: {
    unoptimized: true,
  },

  // Turbo optimizations
  turbo: {
    enabled: true,
    fastRefresh: true,
  },

  // Experimental features (keeping only essential ones)
  experimental: {
    optimizeCss: true,
  },
}

export default nextConfig
