import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import SessionBooking from '@/lib/models/SessionBooking';
import User from '@/lib/models/User';
import jwt from 'jsonwebtoken';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { Resend } from 'resend';

// Helper for Auth
const getUserFromRequest = async (request: NextRequest) => {
    const token = request.cookies.get('token')?.value;
    if (!token) return null;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
        const user = await User.findById(decoded.id);
        return user;
    } catch {
        return null;
    }
}

export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        // 1. Auth Check
        const user = await getUserFromRequest(request);
        if (!user) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        // 2. Parse FormData
        const formData = await request.formData();
        const file = formData.get('proof') as File;
        const amount = formData.get('amount') as string;
        const sessionType = formData.get('productSlug') as string;
        const productTitle = formData.get('productTitle') as string;

        if (!file || !amount || !sessionType) {
            return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 });
        }

        // 3. Save File
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create unique filename
        const filename = `session-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const uploadDir = path.join(process.cwd(), 'public/uploads/proofs');

        // Ensure directory exists
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (e) { }

        const filepath = path.join(uploadDir, filename);

        await writeFile(filepath, buffer);

        const fileUrl = `/uploads/proofs/${filename}`;

        // 4. Create Session Booking
        const booking = await SessionBooking.create({
            userId: user._id,
            sessionType,
            amount: parseFloat(amount),
            orderId: `upi_${Date.now()}`,
            paymentId: 'upi_manual',
            paymentMethod: 'upi',
            proofUrl: fileUrl,
            status: 'pending_verification',
            userEmail: user.email,
            userName: user.name
        });

        // 5. Send Confirmation Email (Async)
        const resend = new Resend(process.env.RESEND_API_KEY);
        const fromEmail = process.env.RESEND_FROM_EMAIL || 'REstart <onboarding@resend.dev>';

        if (user.email) {
            await resend.emails.send({
                from: fromEmail,
                to: [user.email],
                subject: `Session Booking Received - ${productTitle}`,
                html: `
                    <div style="font-family: sans-serif;">
                        <h2>Session Booking Received</h2>
                        <p>Hi ${user.name},</p>
                        <p>We received your payment proof for <strong>${productTitle}</strong>.</p>
                        <p>Our team will verify it shortly (usually within 24 hours). Once approved, you will get the link to schedule your session.</p>
                        <br/>
                        <p>Reference Booking ID: ${booking._id}</p>
                    </div>
                `
            });
        }

        return NextResponse.json({ success: true, message: 'Proof submitted successfully', bookingId: booking._id });

    } catch (error) {
        console.error('Session UPI Submit Error:', error);
        return NextResponse.json({ success: false, message: 'Upload failed' }, { status: 500 });
    }
}
