// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import * as stytch from 'stytch';

// Initialize Stytch client outside of request handler
const stytchClient = new stytch.Client({
  project_id: process.env.STYTCH_PROJECT_ID as string,
  secret: process.env.STYTCH_SECRET as string,
});

// This function will run for every API request
export async function middleware(request: NextRequest) {
  // Skip authentication for non-API routes or specific API routes that don't need auth
  if (request.nextUrl.pathname.startsWith('/api/') || 
      request.nextUrl.pathname === '/api/auth' || 
      request.nextUrl.pathname === '/api/public' ||
      request.nextUrl.pathname === '/api/user') {
    return NextResponse.next();
  }

  try {
    // Extract the token from Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return redirectToSignup();
    }

    const sessionToken = authHeader.split('Bearer ')[1];
    
    // Verify the session token with Stytch
    const authResponse = await stytchClient.sessions.authenticate({
      session_token: sessionToken,
    });
    
    // Extract user ID and other metadata
    const userId = authResponse.session.user_id;
    
    // Create a new request with the user information
    const requestWithUser = NextResponse.next();
    
    // Add user ID to headers that will be accessible in the API route
    requestWithUser.headers.set('X-User-ID', userId);

    
    return requestWithUser;
  } catch (error) {
    console.error('Authentication error:', error);
    return redirectToSignup();
  }
}

function redirectToSignup() {
  // For API routes, return a 401 error with redirect information
  return NextResponse.json(
    { error: 'Unauthorized', redirect: '/signup' },
    { status: 401 }
  );
}

// Configure middleware to run only for specific paths
export const config = {
  matcher: [
    '/api/:path*',  // Match all API routes
  ],
};