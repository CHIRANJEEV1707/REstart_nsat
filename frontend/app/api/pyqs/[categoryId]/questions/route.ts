import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import PYQCategory from '@/lib/models/PYQCategory';
import PYQQuestion from '@/lib/models/PYQQuestion';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

async function getCurrentUser(request: NextRequest) {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return null;
    try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        return decoded.id;
    } catch {
        return null;
    }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ categoryId: string }> }) {
    try {
        await dbConnect();

        const { categoryId } = await params;
        const category = await PYQCategory.findById(categoryId);

        if (!category) {
            return NextResponse.json({ success: false, message: 'Category not found' }, { status: 404 });
        }

        // Access Check
        const userId = await getCurrentUser(request);
        let isPremium = false;

        if (userId) {
            const User = (await import('@/lib/models/User')).default;
            const user = await User.findById(userId);
            isPremium = (user?.purchasedBundles?.length ?? 0) > 0; // Fixed optional chaining for production build
        }

        if (!category.isFree && !isPremium) {
            return NextResponse.json({
                success: false,
                message: 'Premium access required for this year\'s PYQs',
                requiresPurchase: true
            }, { status: 403 });
        }

        const questions = await PYQQuestion.find({ categoryId: category._id })
            .sort({ questionNumber: 1 });

        return NextResponse.json({
            success: true,
            category,
            count: questions.length,
            data: questions
        });
    } catch (error: any) {
        console.error('[PYQ Questions Error]', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch questions' },
            { status: 500 }
        );
    }
}
