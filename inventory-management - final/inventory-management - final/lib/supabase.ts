'use client';

import { createBrowserClient } from '@supabase/ssr';

// Create a singleton instance for client-side usage
let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null;

// Make sure environment variables are defined
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = (() => {
  if (!supabaseInstance && supabaseUrl && supabaseKey) {
    try {
      supabaseInstance = createBrowserClient(
        supabaseUrl,
        supabaseKey
      );
    } catch (error) {
      console.error('Failed to initialize Supabase client:', error);
    }
  }
  
  // Return a minimal mock client if real client creation fails
  if (!supabaseInstance) {
    console.warn('Using mock Supabase client');
    // Return a minimal mock client for build time
    return {
      auth: {
        getSession: async () => ({ data: { session: null } }),
        signInWithPassword: async () => ({ data: { session: null }, error: new Error('Supabase not initialized') }),
        signOut: async () => ({ error: null })
      }
    } as any;
  }
  
  return supabaseInstance;
})(); 