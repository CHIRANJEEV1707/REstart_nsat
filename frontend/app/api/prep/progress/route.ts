import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import UserExamProgress from '@/lib/models/UserExamProgress';
import PYQQuestion from '@/lib/models/PYQQuestion';
import { getUserFromToken } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const userId = await getUserFromToken(request);

    if (!userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const examId = searchParams.get('examId');

    if (!examId) {
      return NextResponse.json({ success: false, message: 'Exam ID required' }, { status: 400 });
    }

    let progress = await UserExamProgress.findOne({ user: userId, examId });

    if (!progress) {
      // Return empty/default structure if no progress yet, but don't fail
      return NextResponse.json({
        success: true,
        data: null
      });
    }

    return NextResponse.json({
      success: true,
      data: progress
    });

  } catch (error: any) {
    console.error('[Get Progress Error]', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const userId = await getUserFromToken(request);

    if (!userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { examId, type, data } = body;
    // type: 'score_update' | 'practice_complete'

    if (!examId || !type) {
      return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 });
    }

    let progress = await UserExamProgress.findOne({ user: userId, examId });

    if (!progress) {
      progress = new UserExamProgress({
        user: userId,
        examId,
        streak: { current: 0, max: 0, lastPracticeDate: null },
        latestScore: null
      });
    }

    if (type === 'score_update') {
      const { score, total } = data;
      // Calculate percentile (Server-side logic placeholder)
      // In real app, query all scores to rank. For now, simple logic or just store raw.
      const percentile = Math.min(99.9, ((score / total) * 100)).toFixed(2);

      progress.latestScore = {
        score,
        total,
        percentile: parseFloat(percentile),
        date: new Date()
      };
    }
    else if (type === 'practice_complete') {
      const { answers, timeTaken, totalQuestions } = data;

      let score = 0;
      let totalScore = 0;
      const sessionAnswers = [];

      // Determine Marking Scheme
      let marking = { correct: 1, incorrect: 0 };
      if (examId === 'jee-mains' || examId === 'jee-advanced') marking = { correct: 4, incorrect: -1 };
      else if (examId === 'bitsat') marking = { correct: 3, incorrect: -1 };

      if (answers && Object.keys(answers).length > 0) {
          const questionIds = Object.keys(answers);
          const questions = await PYQQuestion.find({ _id: { $in: questionIds } }).select('_id correctAnswer').lean();
          const questionMap = new Map(questions.map((q: any) => [q._id.toString(), q]));

          for (const [qId, optionId] of Object.entries(answers)) {
              const question = questionMap.get(qId);
              let isCorrect = false;
              if (question && (question as any).correctAnswer === optionId) {
                  isCorrect = true;
                  score += marking.correct;
              } else {
                  score += marking.incorrect;
              }

              sessionAnswers.push({
                  questionId: qId,
                  selectedOptionId: optionId as string,
                  isCorrect
              });
          }
           // Adjust totalQuestionsSolved (count attempted/solved)
           progress.totalQuestionsSolved += Object.keys(answers).length;
      } else {
         progress.totalQuestionsSolved += (data.questionsSolved || 0);
      }

      // Calculate Total Max Score
      // If totalQuestions provided (e.g. 5), use that. Else use count of answers.
      const questionCount = totalQuestions || (answers ? Object.keys(answers).length : 0);
      totalScore = questionCount * marking.correct;

      // Update Streak
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const lastDate = progress.streak.lastPracticeDate ? new Date(progress.streak.lastPracticeDate) : null;
      if (lastDate) lastDate.setHours(0, 0, 0, 0);

      if (!lastDate || lastDate.getTime() < today.getTime()) {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (lastDate && lastDate.getTime() === yesterday.getTime()) {
          progress.streak.current += 1;
        } else if (!lastDate || lastDate.getTime() < yesterday.getTime()) {
          progress.streak.current = 1; // Reset if gap > 1 day
        }
        progress.streak.lastPracticeDate = new Date();
        progress.streak.max = Math.max(progress.streak.max, progress.streak.current);
      }

      // Save Session
      if (answers) {
          progress.lastSession = {
              score,
              totalScore,
              timeTaken: timeTaken || 0,
              date: new Date(),
              answers: sessionAnswers
          };
      }
    }

    await progress.save();

    return NextResponse.json({
      success: true,
      data: progress
    });

  } catch (error: any) {
    console.error('[Update Progress Error]', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
