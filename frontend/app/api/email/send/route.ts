import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(req: Request) {
    try {
        const { email, name, productTitle, amount, type } = await req.json();

        if (!process.env.RESEND_API_KEY) {
            console.warn("RESEND_API_KEY is missing. Email skipped.");
            return NextResponse.json({ success: false, message: "Email service not configured" }, { status: 500 });
        }

        const resend = new Resend(process.env.RESEND_API_KEY);

        // Basic HTML Template
        const htmlContent = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #4F46E5;">Welcome to REstart! 🚀</h1>
                <p>Hi ${name || 'there'},</p>
                <p>Thank you for purchasing <strong>${productTitle}</strong>.</p>
                <p><strong>Amount Paid:</strong> ₹${amount}</p>
                
                <hr style="margin: 20px 0; border: none; border-top: 1px solid #eaeaea;" />
                
                <h3>What's Next?</h3>
                <p>Your access is being set up. In the meantime:</p>
                <ul>
                    <li><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">Go to Dashboard</a> to see your courses (active within 24h).</li>
                    <li>Join our exclusive Community: <a href="#">[Link to Discord/WhatsApp]</a></li>
                </ul>

                <p>If you have any questions, reply to this email or contact support.</p>
                
                <p style="color: #888; margin-top: 30px; font-size: 12px;">
                    Team REstart
                </p>
            </div>
        `;

        const fromEmail = process.env.RESEND_FROM_EMAIL || 'REstart <onboarding@resend.dev>';

        console.log(`Attempting to send email to ${email} from ${fromEmail}`);

        const data = await resend.emails.send({
            from: fromEmail,
            to: [email],
            subject: `Welcome to REstart! Your ${productTitle} is ready`,
            html: htmlContent,
        });

        console.log("Resend API Response:", data);

        if (data.error) {
            console.error("Resend Error:", data.error);
            return NextResponse.json({ success: false, error: data.error }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error("Email send failed:", error);
        return NextResponse.json({ success: false, error: 'Failed to send email' }, { status: 500 });
    }
}
