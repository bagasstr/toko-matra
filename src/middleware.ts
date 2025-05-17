import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// middleware.ts
export async function middleware(request: NextRequest) {
  // Check if the request is for the dashboard
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    const sessionToken = request.cookies.get('sessionToken')?.value

    // If no session token, redirect to login
    if (!sessionToken) {
      const loginUrl = new URL('/login-admin', request.url)
      loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  if (request.nextUrl.pathname.startsWith('/login-admin')) {
    const sessionToken = request.cookies.get('sessionToken')?.value
    if (sessionToken) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

// Configure which routes to run middleware on
export const config = {
  matcher: ['/dashboard/:path*', '/login-admin'],
}
