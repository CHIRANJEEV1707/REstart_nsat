import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import InterviewGuide from '@/lib/models/InterviewGuide';
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

export async function GET(request: NextRequest, props: { params: Promise<{ slug: string }> }) {
    try {
        await dbConnect();

        const params = await props.params;

        const guide = await InterviewGuide.findOne({
            slug: params.slug,
            isActive: true
        });

        if (!guide) {
            return NextResponse.json({ success: false, message: 'Guide not found' }, { status: 404 });
        }

        // Access Check
        const userId = await getCurrentUser(request);
        let isPremium = false;

        if (userId) {
            const User = (await import('@/lib/models/User')).default;
            const user = await User.findById(userId);
            isPremium = (user?.purchasedBundles?.length ?? 0) > 0;
        }

        if (!guide.isFree && !isPremium) {
            // Limited Preview
            return NextResponse.json({
                success: true,
                data: {
                    title: guide.title,
                    slug: guide.slug,
                    guideType: guide.guideType,
                    description: guide.description,
                    tips: guide.tips.slice(0, 3), // Preview
                    sampleQuestions: guide.sampleQuestions.slice(0, 2), // Preview
                    content: guide.content.substring(0, 500) + '...',
                    isFree: false,
                    isLimited: true,
                    message: 'Upgrade to premium for full access'
                }
            });
        }

        return NextResponse.json({
            success: true,
            data: guide
        });
    } catch (error: any) {
        console.error('[Interview Guide Get Error]', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch guide' },
            { status: 500 }
        );
    }
}
