'use client';

import { createBrowserClient } from '@supabase/ssr';

// Create a singleton instance for client-side usage
let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null;

// Safely get environment variables with fallbacks for build time
const getSupabaseUrl = () => {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fallback-url-for-build.supabase.co';
};

const getSupabaseAnonKey = () => {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'fallback-key-for-build-time-only';
};

export const supabase = (() => {
  // Skip initialization during build/SSG
  if (typeof window === 'undefined') {
    // Return a dummy client for static generation
    return {
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        signInWithPassword: () => Promise.resolve({ data: null, error: null }),
        signOut: () => Promise.resolve({ error: null }),
      },
      from: () => ({
        select: () => ({ data: null, error: null }),
        insert: () => ({ data: null, error: null }),
        update: () => ({ data: null, error: null }),
        delete: () => ({ data: null, error: null }),
      }),
      storage: {
        from: () => ({
          upload: () => Promise.resolve({ data: null, error: null }),
          getPublicUrl: () => ({ data: { publicUrl: '' } }),
        }),
      },
      // Add other methods as needed for static build
    } as any;
  }

  if (!supabaseInstance) {
    try {
      supabaseInstance = createBrowserClient(
        getSupabaseUrl(),
        getSupabaseAnonKey()
      );
    } catch (error) {
      console.error('Failed to initialize Supabase client:', error);
      // Return null to prevent app from crashing
      return null as any;
    }
  }
  return supabaseInstance;
})(); 