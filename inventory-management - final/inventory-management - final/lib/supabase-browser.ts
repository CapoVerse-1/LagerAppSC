import { createBrowserClient } from '@supabase/ssr';

// Make sure environment variables are defined
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export function createBrowserSupabaseClient() {
  // Check if credentials exist
  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase credentials missing, returning mock client');
    // Return mock client if credentials are missing
    return {
      auth: {
        getSession: async () => ({ data: { session: null } }),
        signInWithPassword: async () => ({ data: { session: null }, error: new Error('Supabase not initialized') }),
        signOut: async () => ({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
      }
    } as any;
  }

  try {
    return createBrowserClient(
      supabaseUrl,
      supabaseKey
    );
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    // Return mock client on error
    return {
      auth: {
        getSession: async () => ({ data: { session: null } }),
        signInWithPassword: async () => ({ data: { session: null }, error: new Error('Supabase client initialization failed') }),
        signOut: async () => ({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
      }
    } as any;
  }
}