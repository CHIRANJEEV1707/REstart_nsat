import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Claim from '@/lib/models/Claim';
import { verifySession } from '@/lib/auth';
import { z } from 'zod';

const claimSchema = z.object({
    name: z.string().min(2, 'Name is required'),
    phoneNumber: z.string().min(10, 'Valid phone number is required'),
    registeredEmail: z.string().email('Invalid email address')
});

export async function POST(request: NextRequest) {
    try {
        const user = await verifySession(request);
        if (!user) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const body = await request.json();
        const parsed = claimSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { success: false, message: parsed.error.issues[0].message },
                { status: 400 }
            );
        }

        const { name, phoneNumber, registeredEmail } = parsed.data;

        // Check for existing pending claim
        const existingClaim = await Claim.findOne({
            userId: user._id,
            status: 'pending'
        });

        if (existingClaim) {
            return NextResponse.json(
                { success: false, message: 'You already have a pending claim. Please wait for approval.' },
                { status: 400 }
            );
        }

        // Create Claim
        await Claim.create({
            userId: user._id,
            name,
            phoneNumber,
            registeredEmail,
            claimType: 'general', // Default for now, or allow user to choose if UI supports it
            status: 'pending'
        });

        return NextResponse.json({
            success: true,
            message: 'Claim submitted successfully! Access will be granted upon verification.'
        });

    } catch (error: any) {
        console.error('[Claim Error]', error);
        return NextResponse.json(
            { success: false, message: 'Failed to submit claim' },
            { status: 500 }
        );
    }
}
