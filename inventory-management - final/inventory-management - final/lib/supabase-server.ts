import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Safely get environment variables with fallbacks for build time
const getSupabaseUrl = () => {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fallback-url-for-build.supabase.co';
};

const getSupabaseAnonKey = () => {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'fallback-key-for-build-time-only';
};

export function createServerSupabaseClient() {
  try {
    const cookieStore = cookies();
    
    return createServerClient(
      getSupabaseUrl(),
      getSupabaseAnonKey(),
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );
  } catch (error) {
    console.error('Failed to create server Supabase client:', error);
    
    // Return a dummy client for static generation that won't break builds
    return {
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      },
      from: () => ({
        select: () => ({ data: null, error: null }),
      }),
      // Add other methods as needed
    } as any;
  }
} 