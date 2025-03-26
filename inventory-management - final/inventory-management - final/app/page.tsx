"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        console.log('Root page session check:', data.session ? 'Authenticated' : 'Not authenticated');
        
        if (data.session) {
          console.log('Root page: User is authenticated, redirecting to /inventory');
          router.push('/inventory');
        } else {
          console.log('Root page: User is not authenticated, redirecting to /login');
          router.push('/login');
        }
      } catch (error) {
        console.error('Error checking session:', error);
        // Handle error by still redirecting to login as a fallback
        router.push('/login');
      }
    };

    // Add a small timeout to ensure client-side JS is fully loaded
    const redirectTimer = setTimeout(() => {
      checkSession();
    }, 100);

    return () => clearTimeout(redirectTimer);
  }, [router]);

  // Return a simple loading state that will show briefly
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">JTI 1-2-1 Inventory Management</h1>
        <p className="mb-4">Redirecting to application...</p>
        <div className="w-full max-w-md mx-auto">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="animate-pulse h-full bg-blue-500 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

