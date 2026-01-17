import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import PYQQuestion from '@/lib/models/PYQQuestion';
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

export async function PUT(request: NextRequest, props: { params: Promise<{ questionId: string }> }) {
    if (!await checkAdmin(request)) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    const params = await props.params;
    const body = await request.json();
    const question = await PYQQuestion.findByIdAndUpdate(params.questionId, body, { new: true });
    return NextResponse.json({ success: true, data: question });
}

export async function DELETE(request: NextRequest, props: { params: Promise<{ questionId: string }> }) {
    if (!await checkAdmin(request)) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    const params = await props.params;
    await PYQQuestion.findByIdAndDelete(params.questionId);
    return NextResponse.json({ success: true, data: {} });
}
