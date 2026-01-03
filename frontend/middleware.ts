import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value
    const { pathname } = request.nextUrl

    // Protected routes: dashboard, saved, prep, admin
    const protectedRoutes = ['/dashboard', '/saved', '/prep', '/admin']
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

    // Auth routes: login, signup, forgot
    const authRoutes = ['/auth/login', '/auth/signup', '/auth/forgot']
    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

    // 1. If trying to access protected route without token -> Redirect to login
    // if (isProtectedRoute && !token) {
    //     const url = new URL('/auth/login', request.url)
    //     // Optional: add ?from=... to redirect back
    //     return NextResponse.redirect(url)
    // }

    // 2. If trying to access auth route WITH token -> Redirect to dashboard
    // if (isAuthRoute && token) {
    //     return NextResponse.redirect(new URL('/dashboard', request.url))
    // }

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
