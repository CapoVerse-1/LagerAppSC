/** @type {import('next').NextConfig} */
const nextConfig = {
  // Core configurations
  reactStrictMode: false,
  
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

  // Experimental features - removed due to critters dependency issue
  experimental: {
    // optimizeCss is removed as it requires critters package
  },
}

export default nextConfig
