import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/db';
import Order from '@/lib/models/Order';
import User from '@/lib/models/User';
import { Resend } from 'resend';

// WhatsApp group links for different tiers
const WHATSAPP_LINKS: Record<string, string> = {
    'nsat-core': 'https://chat.whatsapp.com/Dv5cSSZUPeC7egTbJ43fwF',
    'nsat-premium': 'https://chat.whatsapp.com/FSGst6uURfRDCjUwPe8kof'
};

export async function POST(req: Request) {
    try {
        await connectDB();

        const body = await req.json();
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return NextResponse.json({ success: false, message: 'Missing parameters' }, { status: 400 });
        }

        const secret = process.env.RAZORPAY_KEY_SECRET;
        if (!secret) return NextResponse.json({ success: false, message: 'Server config error' }, { status: 500 });

        // Verify Signature
        const generated_signature = crypto
            .createHmac('sha256', secret)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest('hex');

        if (generated_signature !== razorpay_signature) {
            return NextResponse.json({ success: false, message: 'Invalid signature' }, { status: 400 });
        }

        // Find and Update Order
        const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
        if (!order) return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });

        if (order.status === 'paid') {
            return NextResponse.json({ success: true, message: 'Already paid' });
        }

        order.status = 'paid';
        order.razorpayPaymentId = razorpay_payment_id;
        order.razorpaySignature = razorpay_signature;
        order.paymentMethod = 'razorpay';
        await order.save();

        // Grant Access to User
        const user = await User.findById(order.userId);
        if (user) {
            // Check if already purchased
            const alreadyPurchased = user.purchasedBundles.some(
                (b: any) => (b.orderId === razorpay_order_id) || (b.productSlug && b.productSlug === order.productSlug)
            );

            if (!alreadyPurchased) {
                user.purchasedBundles.push({
                    productSlug: order.productSlug,
                    bundleId: order.bundleId,
                    purchasedAt: new Date(),
                    orderId: razorpay_order_id,
                    paymentId: razorpay_payment_id
                });
                await user.save();

                // Send welcome email with WhatsApp link for Core/Premium
                const productSlug = order.productSlug || '';
                const whatsappLink = WHATSAPP_LINKS[productSlug];
                if (whatsappLink && process.env.RESEND_API_KEY) {
                    try {
                        const resend = new Resend(process.env.RESEND_API_KEY);
                        const fromEmail = process.env.RESEND_FROM_EMAIL || 'REstart <support@letsrestart.in>';
                        const bundleName = productSlug.includes('premium') ? 'Premium' : 'Core';

                        await resend.emails.send({
                            from: fromEmail,
                            to: user.email,
                            subject: `🎉 Welcome to RE:START ${bundleName} - Your Interview Journey Begins!`,
                            html: `
                                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                                    <h1 style="color: #4F46E5;">Welcome to RE:START ${bundleName}! 🚀</h1>
                                    
                                    <p>Hi ${user.name || 'there'},</p>
                                    
                                    <p>Thank you for your purchase! You now have access to all ${bundleName} features.</p>
                                    
                                    <div style="background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
                                        <h2 style="color: white; margin-bottom: 16px;">Join Your Exclusive WhatsApp Group</h2>
                                        <p style="color: rgba(255,255,255,0.9); margin-bottom: 20px;">
                                            Your interview preparation will be coordinated through our WhatsApp group.
                                        </p>
                                        <a href="${whatsappLink}" style="display: inline-block; background: #25D366; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
                                            📱 Join WhatsApp Group
                                        </a>
                                    </div>
                                    
                                    <p><strong>What's next?</strong></p>
                                    <ul>
                                        <li>✅ Access all your mock tests and PYQs on the dashboard</li>
                                        <li>💬 Join the WhatsApp group for interview coordination</li>
                                        <li>📞 Get priority support from our team</li>
                                    </ul>
                                    
                                    <p>Best of luck with your NSAT preparation!</p>
                                    
                                    <p style="color: #6B7280; font-size: 14px; margin-top: 32px;">
                                        - Team RE:START
                                    </p>
                                </div>
                            `
                        });
                        console.log('[Payment] Welcome email sent to:', user.email);
                    } catch (emailError) {
                        console.error('[Payment] Failed to send welcome email:', emailError);
                    }
                }
            }
        }

        return NextResponse.json({ success: true, message: 'Payment verified and access granted' });

    } catch (error) {
        console.error('Payment verification failed:', error);
        return NextResponse.json({ success: false, message: 'Verification failed' }, { status: 500 });
    }
}

