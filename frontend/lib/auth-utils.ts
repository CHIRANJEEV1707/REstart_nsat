import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

interface JwtPayload {
    id: string;
}

export async function getUserFromToken(request: NextRequest): Promise<string | null> {
    const token = request.cookies.get('token')?.value ||
        request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) return null;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
        return decoded.id;
    } catch {
        return null;
    }
}
