import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import jwt from 'jsonwebtoken';

interface JwtPayload {
    id: string;
}

export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        // Get token from cookie or Authorization header
        const token = request.cookies.get('token')?.value ||
            request.headers.get('authorization')?.replace('Bearer ', '');

        if (!token) {
            return NextResponse.json(
                { success: false, message: 'Not authorized, no token' },
                { status: 401 }
            );
        }

        // Verify token
        let decoded: JwtPayload;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
        } catch (err) {
            return NextResponse.json(
                { success: false, message: 'Not authorized, token invalid' },
                { status: 401 }
            );
        }

        // Get user
        const user = await User.findById(decoded.id);

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: user
        });
    } catch (error: any) {
        console.error('[Get Me Error]', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to get user' },
            { status: 500 }
        );
    }
}
