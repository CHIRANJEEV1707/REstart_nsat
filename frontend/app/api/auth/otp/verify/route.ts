import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import EmailOTP from '@/lib/models/EmailOTP';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const verifyOTPSchema = z.object({
    email: z.string().email('Invalid email address'),
    otp: z.string().length(6, 'OTP must be 6 digits')
});

export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const body = await request.json();
        const parsed = verifyOTPSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { success: false, message: parsed.error.issues[0].message },
                { status: 400 }
            );
        }

        const email = parsed.data.email.toLowerCase();
        const { otp } = parsed.data;

        // Find OTP record
        const otpRecord = await EmailOTP.findOne({ email });

        if (!otpRecord) {
            return NextResponse.json(
                { success: false, message: 'No verification code found. Please request a new one.' },
                { status: 400 }
            );
        }

        // Check if too many attempts (max 3)
        if (otpRecord.attempts >= 3) {
            return NextResponse.json(
                { success: false, message: 'Too many incorrect attempts. Please request a new code.' },
                { status: 429 }
            );
        }

        // Check if expired
        if (new Date() > otpRecord.expiresAt) {
            return NextResponse.json(
                { success: false, message: 'Verification code has expired. Please request a new one.' },
                { status: 400 }
            );
        }

        // Check if OTP matches
        if (otpRecord.otp !== otp) {
            // Increment attempts
            await EmailOTP.findByIdAndUpdate(otpRecord._id, { $inc: { attempts: 1 } });

            const remainingAttempts = 3 - (otpRecord.attempts + 1);
            return NextResponse.json(
                {
                    success: false,
                    message: remainingAttempts > 0
                        ? `Incorrect code. ${remainingAttempts} attempt(s) remaining.`
                        : 'Too many incorrect attempts. Please request a new code.'
                },
                { status: 400 }
            );
        }

        // OTP is correct! Generate verification token
        const verificationToken = jwt.sign(
            { email, verified: true, type: 'email-verification' },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '10m' } // Token valid for 10 minutes to complete signup
        );

        // Delete the OTP record (it's been used)
        await EmailOTP.deleteOne({ email });

        return NextResponse.json({
            success: true,
            message: 'Email verified successfully',
            verificationToken
        });

    } catch (error: any) {
        console.error('[OTP Verify Error]', error);
        return NextResponse.json(
            { success: false, message: 'Verification failed' },
            { status: 500 }
        );
    }
}
