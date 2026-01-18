import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import PYQCategory from '@/lib/models/PYQCategory';
import PYQQuestion from '@/lib/models/PYQQuestion';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const examType = searchParams.get('examType');
    const subject = searchParams.get('subject');
    const difficulty = searchParams.get('difficulty');
    const year = searchParams.get('year');

    // 1. Find Categories matching Exam Type & Year
    const categoryFilter: any = { isActive: true };
    if (examType) categoryFilter.examType = examType;
    if (year && year !== 'All') categoryFilter.year = parseInt(year);

    const categories = await PYQCategory.find(categoryFilter).select('_id').lean();
    const categoryIds = categories.map(c => c._id);

    if (categoryIds.length === 0) {
      return NextResponse.json({ success: true, count: 0, data: [] });
    }

    // 2. Find Questions in those categories matching other filters
    const qFilter: any = { categoryId: { $in: categoryIds } };

    // Note: Subject is tied to Section or Category? 
    // PYQQuestion has 'section', PYQCategory has 'subject' usually or mixed. 
    // Let's check Schema... PYQQuestion has 'section'. PYQCategory has 'title'?
    // Assuming user passes 'subject' as section match or we need to filter categories by subject if categories are subject-based.
    // Looking at typical structure: Category = "JEE Mains 2023 Shift 1". Questions have sections "Physics", "Math".

    if (subject && subject !== 'All') {
      qFilter.section = subject;
    }

    if (difficulty && difficulty !== 'All') {
      qFilter.difficulty = difficulty.toLowerCase(); // Schema uses lowercase
    }

    const questions = await PYQQuestion.find(qFilter)
      .limit(50) // Limit for performance
      .lean();

    // Transform to frontend expected format
    const formattedQuestions = questions.map(q => ({
      id: q._id,
      text: q.questionText,
      subject: q.section,
      year: year ? parseInt(year) : 2024, // Approximation if year not in Question model, strictly it's in Category
      difficulty: q.difficulty,
      topics: q.tags || [],
      hasVideoSolution: false // Placeholder as schema doesn't have it yet
    }));

    return NextResponse.json({
      success: true,
      count: formattedQuestions.length,
      data: formattedQuestions
    });

  } catch (error: any) {
    console.error('[Get Questions Error]', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}
