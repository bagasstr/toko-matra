import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { dynamicRoutes } from './app/config'

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

  const pathname = request.nextUrl.pathname

  // Check if the route is in our dynamic routes list
  if (
    dynamicRoutes.some((route) => {
      // Convert route pattern to regex
      const pattern = route.replace(/\[.*?\]/g, '[^/]+')
      return new RegExp(`^${pattern}$`).test(pathname)
    })
  ) {
    // Add a header to indicate this is a dynamic route
    const response = NextResponse.next()
    response.headers.set('x-middleware-cache', 'no-cache')
    return response
  }

  return NextResponse.next()
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
