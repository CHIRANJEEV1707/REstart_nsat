import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import PYQQuestion from '@/lib/models/PYQQuestion';
async function checkAdmin(request: NextRequest) {
    const adminPassword = request.headers.get('x-admin-password');
    return adminPassword === (process.env.ADMIN_PASSWORD || 'admin123');
}

export async function GET(request: NextRequest, props: { params: Promise<{ categoryId: string }> }) {
    if (!await checkAdmin(request)) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    const params = await props.params;
    const questions = await PYQQuestion.find({ categoryId: params.categoryId }).sort({ questionNumber: 1 });
    return NextResponse.json({ success: true, count: questions.length, data: questions });
}

export async function POST(request: NextRequest, props: { params: Promise<{ categoryId: string }> }) {
    if (!await checkAdmin(request)) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    const params = await props.params;
    const body = await request.json();
    const question = await PYQQuestion.create({ ...body, categoryId: params.categoryId });
    return NextResponse.json({ success: true, data: question }, { status: 201 });
}
