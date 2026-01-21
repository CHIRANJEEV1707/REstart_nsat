import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Claim from '@/lib/models/Claim';
import User from '@/lib/models/User';
import Bundle from '@/lib/models/Bundle';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        // Admin Auth
        const adminPassword = request.headers.get('x-admin-password');
        if (adminPassword !== process.env.ADMIN_PASSWORD) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const { status, rejectionReason } = await request.json();

        // Validate Status
        if (!['approved', 'rejected'].includes(status)) {
            return NextResponse.json({ success: false, message: 'Invalid status' }, { status: 400 });
        }

        const claim = await Claim.findById(params.id);
        if (!claim) {
            return NextResponse.json({ success: false, message: 'Claim not found' }, { status: 404 });
        }

        if (claim.status !== 'pending') {
            return NextResponse.json({ success: false, message: 'Claim already processed' }, { status: 400 });
        }

        // Process Approval
        if (status === 'approved') {
            let bundle;

            if (claim.claimType === 'core') {
                // Grant Core Bundle
                bundle = await Bundle.findOne({ slug: 'nsat-core', isActive: true });
                if (!bundle) {
                    // Fallback to searching by title logic if slug differs
                    bundle = await Bundle.findOne({ productSlug: 'nsat-core', isActive: true });
                }
            } else {
                // Legacy Basic Logic (General/Coding)
                const targetVariant = claim.claimType === 'coding' ? 'coding_only' : 'general_only';
                bundle = await Bundle.findOne({
                    tier: 'basic',
                    variant: targetVariant,
                    isActive: true
                });
            }

            if (!bundle) {
                return NextResponse.json({ success: false, message: `No active bundle found for claim type: ${claim.claimType}.` }, { status: 404 });
            }

            // Assign to User
            await User.findByIdAndUpdate(claim.userId, {
                $push: {
                    purchasedBundles: {
                        bundleId: bundle._id,
                        productSlug: bundle.slug, // specific to Bundle schema
                        verificationStatus: 'active',
                        purchasedAt: new Date(),
                        orderId: `CLAIM-${claim._id}`,
                        paymentId: 'REFERRAL-REWARD'
                    }
                }
            });
        }

        // Update Claim
        claim.status = status;
        if (rejectionReason) claim.rejectionReason = rejectionReason;
        claim.processedAt = new Date();
        await claim.save();

        return NextResponse.json({
            success: true,
            message: `Claim ${status} successfully`
        });

    } catch (error: any) {
        console.error('[Process Claim Error]', error);
        return NextResponse.json(
            { success: false, message: 'Failed to process claim' },
            { status: 500 }
        );
    }
}
