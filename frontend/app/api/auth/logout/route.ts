import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        // Cookie options
        const isProduction = process.env.NODE_ENV === 'production';
        const cookieOptions = {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
            path: '/',
        } as const;

        // Create response
        const response = NextResponse.json({
            success: true,
            data: {}
        }, { status: 200 });

        // Clear cookies
        response.cookies.set('token', '', {
            ...cookieOptions,
            maxAge: 0,
        });

        response.cookies.set('refreshToken', '', {
            ...cookieOptions,
            maxAge: 0,
        });

        return response;
    } catch (error: any) {
        console.error('[Logout Error]', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Logout failed' },
            { status: 500 }
        );
    }
}
