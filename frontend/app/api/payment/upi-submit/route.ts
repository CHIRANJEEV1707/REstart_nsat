import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import User from '@/lib/models/User';
import jwt from 'jsonwebtoken';
import { writeFile } from 'fs/promises';
import path from 'path';
import { Resend } from 'resend';

// Helper for Auth
const getUserFromRequest = async (request: NextRequest) => {
    const token = request.cookies.get('token')?.value;
    if (!token) return null;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
        return decoded.id;
    } catch {
        return null;
    }
}

export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        // 1. Auth Check
        const userId = await getUserFromRequest(request);
        if (!userId) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        // 2. Parse FormData
        const formData = await request.formData();
        const file = formData.get('proof') as File;
        const amount = formData.get('amount') as string;
        const productSlug = formData.get('productSlug') as string;
        const productTitle = formData.get('productTitle') as string;

        if (!file || !amount || !productSlug) {
            return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 });
        }

        // 3. Save File
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create unique filename
        const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const uploadDir = path.join(process.cwd(), 'public/uploads/proofs');
        const filepath = path.join(uploadDir, filename);

        await writeFile(filepath, buffer);

        const fileUrl = `/uploads/proofs/${filename}`;

        // 4. Create Order
        const order = await Order.create({
            userId,
            amount: parseFloat(amount),
            currency: 'INR',
            paymentMethod: 'upi',
            proofUrl: fileUrl,
            status: 'pending_verification',
            verificationStatus: 'pending',
            productSlug: productSlug
        });

        // 4.5 Update User Profile with Pending Bundle
        await User.findByIdAndUpdate(userId, {
            $push: {
                purchasedBundles: {
                    productSlug: productSlug,
                    verificationStatus: 'pending',
                    orderId: order._id,
                    paymentId: 'upi_manual',
                    purchasedAt: new Date()
                }
            }
        });

        // 5. Send Confirmation Email (Async)
        const resend = new Resend(process.env.RESEND_API_KEY);
        const fromEmail = process.env.RESEND_FROM_EMAIL || 'REstart <onboarding@resend.dev>';

        const user = await User.findById(userId);
        const email = user?.email;

        if (email) {
            await resend.emails.send({
                from: fromEmail,
                to: [email],
                subject: `Payment Proof Received - ${productTitle}`,
                html: `
                    <div style="font-family: sans-serif;">
                        <h2>Payment Proof Received</h2>
                        <p>Hi ${user.name},</p>
                        <p>We received your payment proof for <strong>${productTitle}</strong>.</p>
                        <p>Our team will verify it shortly (usually within 24 hours). Once approved, you will get access automatically.</p>
                        <br/>
                        <p>Reference Order ID: ${order._id}</p>
                    </div>
                `
            });
        }

        return NextResponse.json({ success: true, message: 'Proof submitted successfully', orderId: order._id });

    } catch (error) {
        console.error('UPI Submit Error:', error);
        return NextResponse.json({ success: false, message: 'Upload failed' }, { status: 500 });
    }
}
