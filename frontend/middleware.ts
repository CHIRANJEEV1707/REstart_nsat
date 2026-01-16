import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value
    const { pathname } = request.nextUrl

    // Protected routes: dashboard, saved, prep, admin, settings, profile, onboarding
    const protectedRoutes = ['/dashboard', '/saved', '/prep', '/admin', '/settings', '/profile', '/onboarding']
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

    // Auth routes: login, signup, forgot-password, reset-password
    const authRoutes = ['/auth/login', '/auth/signup', '/auth/forgot-password', '/auth/reset-password']
    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

    // 1. If trying to access protected route without token -> Redirect to login
    if (isProtectedRoute && !token) {
        const url = new URL('/auth/login', request.url)
        url.searchParams.set('from', pathname)
        return NextResponse.redirect(url)
    }

    // 2. If trying to access auth route WITH token -> Redirect to dashboard
    if (isAuthRoute && token) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return NextResponse.next()
}

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
