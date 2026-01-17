import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import PYQCategory from '@/lib/models/PYQCategory';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import User from '@/lib/models/User';

async function checkAdmin(request: NextRequest) {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return false;
    try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        await dbConnect();
        const user = await User.findById(decoded.id);
        return user && user.role === 'admin';
    } catch {
        return false;
    }
}

export async function GET(request: NextRequest) {
    if (!await checkAdmin(request)) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    const categories = await PYQCategory.find({}).sort({ year: -1 });
    return NextResponse.json({ success: true, count: categories.length, data: categories });
}

export async function POST(request: NextRequest) {
    if (!await checkAdmin(request)) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    const category = await PYQCategory.create(body);
    return NextResponse.json({ success: true, data: category }, { status: 201 });
}
