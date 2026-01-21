import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import PYQQuestion from '@/lib/models/PYQQuestion';
async function checkAdmin(request: NextRequest) {
    const adminPassword = request.headers.get('x-admin-password');
    return adminPassword === (process.env.ADMIN_PASSWORD || 'admin123');
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
