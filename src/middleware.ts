import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { dynamicRoutes } from './app/config'
import { stat } from 'fs/promises'
import { join } from 'path'

// middleware.ts
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Check if the request is for the dashboard
  if (pathname.startsWith('/dashboard')) {
    const sessionToken = request.cookies.get('sessionToken')?.value

    // If no session token, redirect to login
    if (!sessionToken) {
      const loginUrl = new URL('/login-admin', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Protect client routes that require authentication
  const protectedRoutes = ['/wishlist', '/keranjang', '/notifikasi', '/orders']
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    const sessionToken = request.cookies.get('sessionToken')?.value

    // If no session token, redirect to login
    if (!sessionToken) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  if (pathname.startsWith('/login-admin')) {
    const sessionToken = request.cookies.get('sessionToken')?.value
    if (sessionToken) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // Check if the route is in our dynamic routes list
  // const isDynamicRoute = dynamicRoutes.some((route) => {
  //   // Convert route pattern to regex
  //   const pattern = route.replace(/\[.*?\]/g, '[^/]+')
  //   return new RegExp(`^${pattern}$`).test(pathname)
  // })

  // if (isDynamicRoute) {
  //   // Add headers to indicate this is a dynamic route
  //   const response = NextResponse.next()
  //   response.headers.set('x-middleware-cache', 'no-cache')
  //   response.headers.set('x-is-dynamic-route', 'true')
  //   response.headers.set('Cache-Control', 'no-store, must-revalidate')
  //   return response
  // }

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
