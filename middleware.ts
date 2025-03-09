import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;
  
  // Define public paths that don't require authentication
  const isPublicPath = path === '/login';
  
  // Get the token from cookies
  const token = request.cookies.get('admin_session')?.value || '';
  
  // Redirect logic
  if (!isPublicPath && !token) {
    // If trying to access a protected route without a token, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  if (isPublicPath && token) {
    // If trying to access login page with a token, redirect to home
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next();
}

// Configure which paths should be processed by this middleware
export const config = {
  matcher: ['/', '/login'],
};