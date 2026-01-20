import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Question from '@/lib/models/Question';
import MockTest from '@/lib/models/MockTest';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const examType = searchParams.get('examType'); // e.g. 'jee-mains'
    const subject = searchParams.get('subject');
    const difficulty = searchParams.get('difficulty');
    const year = searchParams.get('year');
    const search = searchParams.get('search'); // Text search
    const ids = searchParams.get('ids');

    // Case 1: Fetch by IDs
    if (ids) {
      const idList = ids.split(',');
      const questions = await Question.find({ _id: { $in: idList } })
        .populate('mockTestId', 'title year examType')
        .lean();

      const formattedQuestions = questions.map((q: any) => ({
        id: q._id,
        text: q.questionText,
        subject: q.subject || q.section, // Prefer specific subject field
        year: q.mockTestId?.year || q.year,
        difficulty: (q.difficulty || 'medium').charAt(0).toUpperCase() + (q.difficulty || 'medium').slice(1),
        topics: q.topic ? [q.topic] : (q.tags || []),
        hasVideoSolution: false,
        explanation: q.explanation,
        options: q.options,
        correctAnswer: q.correctAnswer
      }));

      return NextResponse.json({ success: true, data: formattedQuestions });
    }

    // Case 2: Filter by Exam/Year/Subject
    // 1. Find MockTests (Papers) matching examType and year
    const mockTestFilter: any = { isPYQ: true, isActive: true };

    if (examType && examType !== 'All') {
      // Handle slug vs title case if necessary, but seeded data has 'jee-mains' in examType field of MockTest?
      // Wait, Seed script: examType: 'jee-mains' (lowercase) for MockTest.
      // Frontend sends 'jee-mains'. Match!
      mockTestFilter.examType = examType;
    }

    if (year && year !== 'All') {
      mockTestFilter.year = parseInt(year);
    }

    // Fetch relevant MockTests
    const mockTests = await MockTest.find(mockTestFilter).select('_id title year examType').lean();
    const mockTestIds = mockTests.map(m => m._id);

    if (mockTestIds.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    // 2. Find Questions linked to these MockTests
    const questionFilter: any = {
      mockTestId: { $in: mockTestIds }
    };

    if (subject && subject !== 'All') {
      // Seed script put subject in 'subject' field ('Mathematics'), API sends 'Math' or 'Physics'
      // Frontend sends 'Physics', 'Chemistry', 'Math'.
      // Map 'Math' to 'Mathematics' if needed.
      let dbSubject = subject;
      if (subject === 'Math') dbSubject = 'Mathematics';
      questionFilter.subject = dbSubject;
    }

    if (difficulty && difficulty !== 'All') {
      questionFilter.difficulty = difficulty.toLowerCase();
    }

    if (search) {
      questionFilter.$or = [
        { questionText: { $regex: search, $options: 'i' } },
        { topic: { $regex: search, $options: 'i' } },
        { chapter: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    const questions = await Question.find(questionFilter)
      .populate('mockTestId', 'title year examType')
      .limit(100)
      .lean();

    const formattedQuestions = questions.map((q: any) => ({
      id: q._id,
      text: q.questionText,
      subject: q.subject || q.section,
      year: q.mockTestId?.year || q.year, // Fallback to question year if populated
      difficulty: (q.difficulty || 'medium').charAt(0).toUpperCase() + (q.difficulty || 'medium').slice(1),
      topics: q.topic ? [q.topic] : (q.tags || []), // Use topic field from seed
      hasVideoSolution: false,
      explanation: q.explanation,
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
