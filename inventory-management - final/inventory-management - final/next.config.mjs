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
  
  // Disable experimental features that cause build issues
  experimental: {},
  
  // Static page configuration (helps prevent Supabase issues during static generation)
  staticPageGenerationTimeout: 120,
  compress: true,
  
  // Environment variable configuration
  env: {
    NEXT_PUBLIC_SUPABASE_URL: "https://tphecrdxwyswibwtggsa.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwaGVjcmR4d3lzd2lid3RnZ3NhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5NzkxNjAsImV4cCI6MjA1ODU1NTE2MH0.0iVQDyX6K_jCjpDFSX929sig-mQGjToMmaKXxk3dHL8"
  }
}

export default nextConfig
