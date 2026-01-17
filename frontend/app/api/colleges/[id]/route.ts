import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import College from '@/lib/models/College';
import NewGenCollege from '@/lib/models/NewGenCollege';
import mongoose from 'mongoose';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();

        // In Next.js 15+, params is a Promise and must be awaited
        const { id } = await params;

        // Check if ID is a valid ObjectId
        const isObjectId = mongoose.Types.ObjectId.isValid(id);

        let college;

        if (isObjectId) {
            // Try ID lookup
            college = await College.findById(id).lean();
            if (!college) {
                college = await NewGenCollege.findById(id).lean();
            }
        } else {
            // Try Slug lookup (assuming slug is unique across collections, or prioritize College)
            college = await College.findOne({ slug: id }).lean();
            if (!college) {
                college = await NewGenCollege.findOne({ slug: id }).lean();
            }
        }

        if (!college) {
            return NextResponse.json(
                { success: false, message: 'College not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: college
        });

    } catch (error: any) {
        console.error('[Get College Detail Error]', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to fetch college details' },
            { status: 500 }
        );
    }
}

