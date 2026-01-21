import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import MockTest from '@/lib/models/MockTest';
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
        const test = await MockTest.findById(id);
        if (!test) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
        return NextResponse.json({ success: true, data: test });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    if (!await checkAdmin(request)) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;
        const body = await request.json();
        const test = await MockTest.findByIdAndUpdate(id, body, { new: true, runValidators: true });
        if (!test) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
        return NextResponse.json({ success: true, data: test });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    if (!await checkAdmin(request)) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;
        await MockTest.findByIdAndDelete(id);
        return NextResponse.json({ success: true, data: {} });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
