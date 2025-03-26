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
  
  // Set build output for production - prevents static generation of pages requiring dynamic data
  output: 'standalone',
  
  // Skip pre-rendering for auth-related pages
  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true
}

export default nextConfig
