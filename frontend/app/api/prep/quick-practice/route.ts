import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import PYQQuestion from '@/lib/models/PYQQuestion';
import PYQCategory from '@/lib/models/PYQCategory';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const examType = searchParams.get('examType');

    if (!examType) {
      return NextResponse.json({ success: false, message: 'Exam Type required' }, { status: 400 });
    }

    // 1. Get Category IDs
    const categories = await PYQCategory.find({ examType, isActive: true }).select('_id year').lean();
    const categoryIds = categories.map(c => c._id);

    if (categoryIds.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    // 2. Random Sample
    const questions = await PYQQuestion.aggregate([
      { $match: { categoryId: { $in: categoryIds } } },
      { $sample: { size: 5 } }
    ]);

    // Populate category info manually or via lookup if needed, but for quick practice, maybe not critical.
    // However, year is useful. We have categoryIds.
    // Let's just map year from the cached categories list.
    const categoryMap = new Map(categories.map(c => [c._id.toString(), c]));

    const formattedQuestions = questions.map((q: any) => {
      const cat = categoryMap.get(q.categoryId.toString());
      return {
        id: q._id,
        text: q.questionText,
        subject: q.section,
        year: cat ? (cat as any).year : null,
        difficulty: q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1),
        topics: q.tags,
        hasVideoSolution: false,
        explanation: q.explanation,
        options: q.options,
        correctAnswer: q.correctAnswer
      };
    });

    return NextResponse.json({
      success: true,
      data: formattedQuestions
    });

  } catch (error: any) {
    console.error('[Quick Practice Error]', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
