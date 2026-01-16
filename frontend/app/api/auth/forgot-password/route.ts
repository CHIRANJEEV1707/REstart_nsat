import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import crypto from 'crypto';
import { Resend } from 'resend';

export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        // Initialize Resend inside function to defer to runtime
        const resend = new Resend(process.env.RESEND_API_KEY);

        const body = await request.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json(
                { success: false, message: 'Email is required' },
                { status: 400 }
            );
        }

        // Find user
        const user = await User.findOne({ email }).select('+resetPasswordToken +resetPasswordExpire');

        if (!user) {
            // Don't reveal if user exists - always return success
            return NextResponse.json({
                success: true,
                message: 'If an account exists with this email, a reset link has been sent.'
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');

        // Hash token for storage
        const hashedToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        // Set token and expiry (1 hour)
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpire = new Date(Date.now() + 60 * 60 * 1000);
        await user.save();

        // Build reset URL
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const resetUrl = `${baseUrl}/auth/reset-password?token=${resetToken}`;

        // Send email via Resend
        try {
            await resend.emails.send({
                from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
                to: email,
                subject: 'Reset your REstart password',
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #4F46E5;">Reset Your Password</h2>
                        <p>Hi ${user.name},</p>
                        <p>You requested to reset your password. Click the button below to create a new password:</p>
                        <a href="${resetUrl}" style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">
                            Reset Password
                        </a>
                        <p style="color: #666; font-size: 14px;">This link expires in 1 hour.</p>
                        <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
                        <p style="color: #999; font-size: 12px;">REstart - Your College Discovery Platform</p>
                    </div>
                `
            });
        } catch (emailError) {
            console.error('[Email Error]', emailError);
            // Reset the token if email fails
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();

            return NextResponse.json(
                { success: false, message: 'Failed to send email. Please try again.' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'If an account exists with this email, a reset link has been sent.'
        });
    } catch (error: any) {
        console.error('[Forgot Password Error]', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Something went wrong' },
            { status: 500 }
        );
    }
}
