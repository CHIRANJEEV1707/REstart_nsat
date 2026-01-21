import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import InterviewGuide from '@/lib/models/InterviewGuide';
async function checkAdmin(request: NextRequest) {
    const adminPassword = request.headers.get('x-admin-password');
    return adminPassword === (process.env.ADMIN_PASSWORD || 'admin123');
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
