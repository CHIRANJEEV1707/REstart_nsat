import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Question from '@/lib/models/Question';
async function checkAdmin(request: NextRequest) {
    const adminPassword = request.headers.get('x-admin-password');
    return adminPassword === (process.env.ADMIN_PASSWORD || 'admin123');
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    if (!await checkAdmin(request)) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;
        const questions = await Question.find({ mockTestId: id }).sort({ questionNumber: 1 });
        return NextResponse.json({ success: true, count: questions.length, data: questions });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    if (!await checkAdmin(request)) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;
        const body = await request.json();
        const question = await Question.create({
            ...body,
            mockTestId: id
        });
        return NextResponse.json({ success: true, data: question }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }
}
