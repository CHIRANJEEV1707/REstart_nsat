import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { checkRateLimit } from './lib/rate-limit'

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // --- Rate Limiting (Applied to /api routes) ---
    if (pathname.startsWith('/api')) {
        const ip = (request as any).ip || request.headers.get('x-forwarded-for') || '127.0.0.1'

        // 1. Global API Limiter (300 req / 15 min)
        const isDev = process.env.NODE_ENV === 'development'
        const globalLimitVal = isDev ? 1000 : 300
        const globalLimit = checkRateLimit(ip, 'global', { limit: globalLimitVal, interval: 15 * 60 * 1000 })

        if (!globalLimit.success) {
            return NextResponse.json(
                { success: false, message: 'Too many requests from this IP, please try again after 15 minutes' },
                {
                    status: 429,
                    headers: {
                        'Retry-After': String(Math.ceil((globalLimit.reset - Date.now()) / 1000)),
                        'RateLimit-Limit': String(globalLimit.limit),
                        'RateLimit-Remaining': String(globalLimit.remaining),
                        'RateLimit-Reset': String(Math.ceil(globalLimit.reset / 1000))
                    }
                }
            )
        }

        // 2. Auth Limiter (5 req / 15 min)
        // Matches /api/auth/login and /api/auth/signup
        if (pathname === '/api/auth/login' || pathname === '/api/auth/signup') {
            const isDev = process.env.NODE_ENV === 'development'
            const limit = isDev ? 100 : 5 // 100 requests in dev, 5 in prod
            const authLimit = checkRateLimit(ip, 'auth', { limit, interval: 15 * 60 * 1000 })

            if (!authLimit.success) {
                return NextResponse.json(
                    { success: false, message: 'Too many authentication attempts, please try again after 15 minutes' },
                    {
                        status: 429,
                        headers: {
                            'Retry-After': String(Math.ceil((authLimit.reset - Date.now()) / 1000)),
                            'RateLimit-Limit': String(authLimit.limit),
                            'RateLimit-Remaining': String(authLimit.remaining),
                            'RateLimit-Reset': String(Math.ceil(authLimit.reset / 1000))
                        }
                    }
                )
            }
        }
    }

    // --- Existing Authentication Logic ---
    const token = request.cookies.get('token')?.value

    // Protected routes: dashboard, saved, prep, settings, profile, onboarding
    const protectedRoutes = ['/dashboard', '/saved', '/prep', '/settings', '/profile', '/onboarding']
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
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         *
         * NOTE: 'api' was previously excluded, but now included for rate limiting.
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
}
