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
  
  // Set build output for production
  output: 'standalone',
  
  // Simplify the build process
  poweredByHeader: false,
  generateEtags: false
}

export default nextConfig
