import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import InterviewGuide from '@/lib/models/InterviewGuide';
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

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    if (!await checkAdmin(request)) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    const guide = await InterviewGuide.findById(id);
    return NextResponse.json({ success: true, data: guide });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    if (!await checkAdmin(request)) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    const body = await request.json();
    const guide = await InterviewGuide.findByIdAndUpdate(id, body, { new: true });
    return NextResponse.json({ success: true, data: guide });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    if (!await checkAdmin(request)) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    await InterviewGuide.findByIdAndDelete(id);
    return NextResponse.json({ success: true, data: {} });
}
