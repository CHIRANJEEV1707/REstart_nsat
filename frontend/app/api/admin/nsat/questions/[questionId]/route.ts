import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Question from '@/lib/models/Question';
async function checkAdmin(request: NextRequest) {
    const adminPassword = request.headers.get('x-admin-password');
    return adminPassword === (process.env.ADMIN_PASSWORD || 'admin123');
}

export async function PUT(request: NextRequest, props: { params: Promise<{ questionId: string }> }) {
    if (!await checkAdmin(request)) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const params = await props.params;
        const body = await request.json();
        const question = await Question.findByIdAndUpdate(params.questionId, body, { new: true, runValidators: true });
        if (!question) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
        return NextResponse.json({ success: true, data: question });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }
}

export async function DELETE(request: NextRequest, props: { params: Promise<{ questionId: string }> }) {
    if (!await checkAdmin(request)) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const params = await props.params;
        await Question.findByIdAndDelete(params.questionId);
        return NextResponse.json({ success: true, data: {} });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
