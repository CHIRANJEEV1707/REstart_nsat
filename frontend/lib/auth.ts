import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';

export async function verifySession(request: NextRequest) {
    try {
        const token = request.cookies.get('token')?.value || request.headers.get('authorization')?.split(' ')[1];

        if (!token) return null;

        const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
        if (!decoded.id || !decoded.sessionToken) return null;

        await dbConnect();

        // Select sessionToken explicitly as it is select: false
        const user = await User.findById(decoded.id).select('+sessionToken');

        if (!user) return null;

        // Strict Session Check
        if (user.sessionToken !== decoded.sessionToken) {
            console.warn(`[Auth] Session mismatch for user ${user.email}. Token: ${decoded.sessionToken}, DB: ${user.sessionToken}`);
            return null; // Session invalidated
        }

        return user;
    } catch (error) {
        return null;
    }
}
