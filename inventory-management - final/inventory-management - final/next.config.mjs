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
  
  // Use standalone output for better deployment compatibility with APIs
  output: 'standalone',
  
  // Set a clean build directory without spaces
  distDir: 'dist',
  
  // Simplify the build process
  poweredByHeader: false,
  generateEtags: false,
  
  // Properly handle external packages - updated property name
  serverExternalPackages: ['@supabase/ssr']
}

export default nextConfig
