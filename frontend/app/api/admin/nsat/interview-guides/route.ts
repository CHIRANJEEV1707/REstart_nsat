import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import InterviewGuide from '@/lib/models/InterviewGuide';
async function checkAdmin(request: NextRequest) {
    const adminPassword = request.headers.get('x-admin-password');
    return adminPassword === (process.env.ADMIN_PASSWORD || 'admin123');
}

export async function GET(request: NextRequest) {
    if (!await checkAdmin(request)) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    const guides = await InterviewGuide.find({}).sort({ order: 1 });
    return NextResponse.json({ success: true, count: guides.length, data: guides });
}

export async function POST(request: NextRequest) {
    if (!await checkAdmin(request)) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    const guide = await InterviewGuide.create(body);
    return NextResponse.json({ success: true, data: guide }, { status: 201 });
}
