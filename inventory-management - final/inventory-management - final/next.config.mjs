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
  
  // Avoid pre-rendering pages that need Supabase
  experimental: {
    missingSuspenseWithCSRBailout: false
  },
  
  // Configure which pages should not be pre-rendered
  exportPathMap: async function () {
    return {
      '/': { page: '/' },
      '/login': { page: '/login' },
      // Exclude auth-test pages from static generation
    };
  },
}

export default nextConfig
