import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import MockTest from '@/lib/models/MockTest';
async function checkAdmin(request: NextRequest) {
    const adminPassword = request.headers.get('x-admin-password');
    return adminPassword === (process.env.ADMIN_PASSWORD || 'admin123');
}

export async function GET(request: NextRequest) {
    if (!await checkAdmin(request)) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const tests = await MockTest.find({}).sort({ createdAt: -1 });
        return NextResponse.json({ success: true, count: tests.length, data: tests });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    if (!await checkAdmin(request)) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const test = await MockTest.create(body);
        return NextResponse.json({ success: true, data: test }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }
}
