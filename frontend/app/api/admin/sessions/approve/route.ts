import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import SessionBooking from '@/lib/models/SessionBooking';
import { Resend } from 'resend';

export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        // 1. Password Check
        const adminPassword = request.headers.get('x-admin-password');
        if (adminPassword !== (process.env.ADMIN_PASSWORD || 'admin123')) {
            return NextResponse.json({ success: false, message: 'Invalid Admin Password' }, { status: 401 });
        }

        // 2. Parse Body
        const { bookingId, action } = await request.json();

        if (!bookingId || !action) {
            return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 });
        }

        // 3. Find Booking
        const booking = await SessionBooking.findById(bookingId);
        if (!booking) {
            return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 });
        }

        const resend = new Resend(process.env.RESEND_API_KEY);
        const fromEmail = process.env.RESEND_FROM_EMAIL || 'REstart <onboarding@resend.dev>';

        if (action === 'approve') {
            // Generate Calendly URL
            const CALENDLY_INTERVIEW_URL = process.env.CALENDLY_INTERVIEW_URL || 'https://calendly.com/letsrevamp-here/30min';
            const CALENDLY_UNFILTERED_URL = process.env.CALENDLY_UNFILTERED_URL || 'https://calendly.com/letsrestart-here/restart-unfiltered';

            const baseUrl = booking.sessionType === 'interview-prep' ? CALENDLY_INTERVIEW_URL : CALENDLY_UNFILTERED_URL;
            const calendlyUrl = `${baseUrl}?name=${encodeURIComponent(booking.userName)}&email=${encodeURIComponent(booking.userEmail)}`;

            booking.status = 'paid';
            booking.paymentId = 'upi_manual_verified';
            booking.calendlyUrl = calendlyUrl;
            await booking.save();

            // Send Approval Email
            await resend.emails.send({
                from: fromEmail,
                to: [booking.userEmail],
                subject: `Payment Approved! Schedule your Session`,
                html: `
                    <div style="font-family: sans-serif;">
                        <h2>Payment Approved!</h2>
                        <p>Hi ${booking.userName},</p>
                        <p>Your payment for the 1-on-1 session has been approved.</p>
                        <p>Please use the link below to schedule your session:</p>
                        <a href="${calendlyUrl}" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; border-radius: 8px; text-decoration: none; font-weight: bold;">Schedule Session</a>
                        <br/><br/>
                        <p>If the button doesn't work, copy this link: ${calendlyUrl}</p>
                    </div>
                `
            });

        } else if (action === 'reject') {
            booking.status = 'cancelled';
            await booking.save();

            // Send Rejection Email
            await resend.emails.send({
                from: fromEmail,
                to: [booking.userEmail],
                subject: `Order Update - Payment Not Verified`,
                html: `
                    <div style="font-family: sans-serif;">
                        <h2>Payment Verification Failed</h2>
                        <p>Hi ${booking.userName},</p>
                        <p>We were unable to verify your payment for the session booking.</p>
                        <p>If you believe this is a mistake, please reach out to our support with your payment receipt.</p>
                    </div>
                `
            });
        }

        return NextResponse.json({ success: true, message: `Session ${action}d successfully` });

    } catch (error) {
        console.error('Admin Session Approval Error:', error);
        return NextResponse.json({ success: false, message: 'Operation failed' }, { status: 500 });
    }
}
