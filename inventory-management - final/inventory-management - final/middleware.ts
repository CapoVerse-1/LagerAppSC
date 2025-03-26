import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  console.log('Middleware running for path:', request.nextUrl.pathname);
  
  // Create a response object to modify
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });
  
  try {
    // Check if Supabase credentials are available
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.log('Supabase credentials missing, skipping auth check');
      return response;
    }
    
    // Create a Supabase client configured to use cookies
    const supabase = createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            // This is used for setting cookies during redirects
            response.cookies.set({
              name,
              value,
              ...options,
            });
          },
          remove(name: string, options: any) {
            // This is used for removing cookies during redirects
            response.cookies.set({
              name,
              value: '',
              ...options,
            });
          },
        },
      }
    );

    // Check if the user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    console.log('Session in middleware:', session ? 'Exists' : 'None');
    
    if (session) {
      console.log('User ID in middleware:', session.user.id);
      console.log('Session expires at:', new Date(session.expires_at * 1000).toISOString());
    }

    // Define public routes that don't require authentication
    const publicRoutes = ['/login', '/auth-test', '/auth-test/signup'];
    const isPublicRoute = publicRoutes.some(route => 
      request.nextUrl.pathname.startsWith(route)
    );
    
    // Special handling for root path
    const isRootPath = request.nextUrl.pathname === '/';
    
    console.log('Is public route:', isPublicRoute);

    // If the user is not authenticated and trying to access a protected route
    if (!session && !isPublicRoute && !isRootPath) {
      console.log('Redirecting to login - no session and protected route');
      // Redirect to the login page
      const redirectUrl = new URL('/login', request.url);
      return NextResponse.redirect(redirectUrl);
    }

    // If at root path and not logged in, redirect to login
    if (isRootPath && !session) {
      console.log('Root path accessed without session, redirecting to login');
      const redirectUrl = new URL('/login', request.url);
      return NextResponse.redirect(redirectUrl);
    }

    // If at root path and logged in, redirect to inventory
    if (isRootPath && session) {
      console.log('Root path accessed with session, redirecting to inventory');
      const redirectUrl = new URL('/inventory', request.url);
      return NextResponse.redirect(redirectUrl);
    }

    // If the user is authenticated and trying to access the login page
    if (session && request.nextUrl.pathname.startsWith('/login')) {
      console.log('Redirecting to inventory - has session and on login page');
      // Redirect to the inventory page
      const redirectUrl = new URL('/inventory', request.url);
      return NextResponse.redirect(redirectUrl);
    }
  } catch (error) {
    console.error('Error in middleware:', error);
    // In case of error, proceed with the request rather than blocking it
  }
  
  console.log('Proceeding with request');
  return response;
}

// Specify which routes this middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}; 