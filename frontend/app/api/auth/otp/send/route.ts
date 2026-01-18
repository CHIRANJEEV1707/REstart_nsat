import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import EmailOTP from '@/lib/models/EmailOTP';
import User from '@/lib/models/User';
import { Resend } from 'resend';
import { z } from 'zod';

const sendOTPSchema = z.object({
    email: z.string().email('Invalid email address')
});

// Generate 6-digit OTP
function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const body = await request.json();
        const parsed = sendOTPSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { success: false, message: parsed.error.issues[0].message },
                { status: 400 }
            );
        }

        const email = parsed.data.email.toLowerCase();

        // Check if user already exists with this email
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { success: false, message: 'An account with this email already exists. Please login.' },
                { status: 400 }
            );
        }

        // Check existing OTP record
        const existingOTP = await EmailOTP.findOne({ email });

        // Check resend limit (5 resends max)
        if (existingOTP && existingOTP.resendCount >= 5) {
            return NextResponse.json(
                { success: false, message: 'Too many OTP requests. Please try again after an hour.' },
                { status: 429 }
            );
        }

        // Generate new OTP
        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        // Upsert OTP record
        if (existingOTP) {
            // Update existing record
            await EmailOTP.findByIdAndUpdate(existingOTP._id, {
                otp,
                expiresAt,
                attempts: 0,
                resendCount: existingOTP.resendCount + 1
            });
        } else {
            // Create new record
            await EmailOTP.create({
                email,
                otp,
                expiresAt,
                attempts: 0,
                resendCount: 1
            });
        }

        // Send email via Resend
        if (!process.env.RESEND_API_KEY) {
            console.warn('[OTP] RESEND_API_KEY missing, OTP not sent');
            // In dev, return OTP for testing
            if (process.env.NODE_ENV === 'development') {
                return NextResponse.json({
                    success: true,
                    message: 'OTP sent successfully (dev mode)',
                    devOtp: otp // Only in dev
                });
            }
            return NextResponse.json(
                { success: false, message: 'Email service not configured' },
                { status: 500 }
            );
        }

        const resend = new Resend(process.env.RESEND_API_KEY);
        const fromEmail = process.env.RESEND_FROM_EMAIL || 'REstart <noreply@letsrevamp.in>';

        const { error } = await resend.emails.send({
            from: fromEmail,
            to: email,
            subject: 'Your REstart Verification Code',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
                    <h2 style="color: #4F46E5; margin-bottom: 24px;">Verify Your Email</h2>
                    <p style="color: #374151; font-size: 16px; margin-bottom: 16px;">
                        Your verification code is:
                    </p>
                    <div style="background: #F3F4F6; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 24px;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1F2937;">
                            ${otp}
                        </span>
                    </div>
                    <p style="color: #6B7280; font-size: 14px; margin-bottom: 8px;">
                        This code expires in <strong>5 minutes</strong>.
                    </p>
                    <p style="color: #9CA3AF; font-size: 12px;">
                        If you didn't request this code, please ignore this email.
                    </p>
                </div>
            `
        });

        if (error) {
            console.error('[OTP] Resend error:', error);
            return NextResponse.json(
                { success: false, message: 'Failed to send verification email' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Verification code sent to your email',
            resendCount: existingOTP ? existingOTP.resendCount + 1 : 1
        });

    } catch (error: any) {
        console.error('[OTP Send Error]', error);
        return NextResponse.json(
            { success: false, message: 'Failed to send OTP' },
            { status: 500 }
        );
    }
}

