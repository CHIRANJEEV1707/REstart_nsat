import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import PYQQuestion from '@/lib/models/PYQQuestion';
import PYQCategory from '@/lib/models/PYQCategory';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const examType = searchParams.get('examType');
    const subject = searchParams.get('subject');
    const difficulty = searchParams.get('difficulty');
    const year = searchParams.get('year');
    const search = searchParams.get('search'); // Text search
    const ids = searchParams.get('ids');

    if (ids) {
      const idList = ids.split(',');
      const questions = await PYQQuestion.find({ _id: { $in: idList } })
        .populate('categoryId', 'title year examType')
        .lean();

      const formattedQuestions = questions.map((q: any) => ({
        id: q._id,
        text: q.questionText,
        subject: q.section,
        year: q.categoryId?.year,
        difficulty: q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1),
        topics: q.tags,
        hasVideoSolution: false,
        explanation: q.explanation,
        options: q.options,
        correctAnswer: q.correctAnswer
      }));

      return NextResponse.json({ success: true, data: formattedQuestions });
    }

    // 1. Find Categories matching examType and year
    const categoryFilter: any = { isActive: true };
    if (examType && examType !== 'All') categoryFilter.examType = examType;
    if (year && year !== 'All') categoryFilter.year = parseInt(year);

    // If no examType specific filters, we might fetch all categories which is heavy.
    // Usually examType is required context.

    const categories = await PYQCategory.find(categoryFilter).select('_id title year examType').lean();
    const categoryIds = categories.map(c => c._id);

    if (categoryIds.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    // 2. Find Questions
    const questionFilter: any = {
      categoryId: { $in: categoryIds }
    };

    if (subject && subject !== 'All') {
      questionFilter.section = subject;
    }

    if (difficulty && difficulty !== 'All') {
      // difficulty in DB is lowercase (e.g. 'medium') but frontend might send 'Medium'
      questionFilter.difficulty = difficulty.toLowerCase();
    }

    if (search) {
      questionFilter.$or = [
        { questionText: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    const questions = await PYQQuestion.find(questionFilter)
      .populate('categoryId', 'title year examType') // Populate to give context if needed
      .limit(100) // Limit to 100 for performance
      .lean();

    // Flatten/Map response if needed to match frontend expectation
    // Frontend expects: id, text, subject, year, difficulty, topics
    const formattedQuestions = questions.map((q: any) => ({
      id: q._id,
      text: q.questionText,
      subject: q.section,
      year: q.categoryId?.year,
      difficulty: q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1), // Title case for frontend
      topics: q.tags,
      hasVideoSolution: false, // Placeholder
      explanation: q.explanation, // Added for solution view
      options: q.options,
      correctAnswer: q.correctAnswer
    }));

    return NextResponse.json({
      success: true,
      data: formattedQuestions
    });

  } catch (error: any) {
    console.error('[Get PYQ Questions Error]', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
