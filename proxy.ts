import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secretKey = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-key-change-in-production');

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route needs protection
  const isAppRoute = pathname.startsWith('/app');
  const isAdminRoute = pathname.startsWith('/admin');

  if (!isAppRoute && !isAdminRoute) {
    return NextResponse.next();
  }

  const token = request.cookies.get('session')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const { payload } = await jwtVerify(token, secretKey);
    
    // Check admin access
    if (isAdminRoute && payload.role !== 'admin') {
      return NextResponse.redirect(new URL('/app', request.url));
    }

    return NextResponse.next();
  } catch {
    // Invalid token, redirect to login
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('session');
    return response;
  }
}

export const config = {
  matcher: ['/app/:path*', '/admin/:path*'],
};
