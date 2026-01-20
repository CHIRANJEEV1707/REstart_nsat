import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import MockTest from '@/lib/models/MockTest';
import Question from '@/lib/models/Question';
import { connectDB } from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: { examId: string } }) {
    try {
        await connectDB();
        const { examId } = params;
        const { subject, chapter, count = 10 } = await req.json();

        if (!subject || !chapter) {
            return NextResponse.json({ success: false, message: 'Subject and Chapter are required' }, { status: 400 });
        }

        // 1. Find valid MockTests for this exam to filter questions
        const validMockTests = await MockTest.find({
            examType: examId,
            isPYQ: true
        }).select('_id');

        const validMockTestIds = validMockTests.map(m => m._id);

        if (validMockTestIds.length === 0) {
            return NextResponse.json({ success: false, message: 'No PYQs found for this exam' }, { status: 404 });
        }

        // 2. Find Questions matching Chapter and Exam
        const sourceQuestions = await Question.aggregate([
            {
                $match: {
                    mockTestId: { $in: validMockTestIds },
                    subject: subject,
                    chapter: chapter
                }
            },
            { $sample: { size: count } } // Random selection
        ]);

        if (sourceQuestions.length === 0) {
            return NextResponse.json({ success: false, message: 'No questions found for this topic' }, { status: 404 });
        }

        // 3. Create a unique slug
        const timestamp = Date.now();
        const slug = `practice-${examId}-${chapter.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${timestamp}`;
        const title = `Practice: ${chapter} (${subject})`;

        // 4. Create the Practice MockTest
        const newTest = await MockTest.create({
            title,
            slug,
            description: `Topic-wise practice session for ${chapter}.`,
            examType: examId,
            duration: sourceQuestions.length * 2, // 2 mins per question estimate
            totalMarks: sourceQuestions.reduce((sum, q) => sum + (q.marks || 4), 0),
            passingMarks: 0,
            sections: [
                { name: subject, questionCount: sourceQuestions.length, marks: 0 } // marks calc below
            ],
            instructions: ['Practice Session', 'Topic-wise'],
            isFree: true,
            isPremium: false,
            isActive: true,
            isPYQ: false, // It's a generated practice, not a full PYQ paper
            difficulty: 'medium'
        });

        // 5. Clone Questions
        const questionsToInsert = sourceQuestions.map((q, index) => ({
            mockTestId: newTest._id,
            section: subject,
            questionNumber: index + 1,
            questionText: q.questionText,
            questionType: q.questionType,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            marks: q.marks,
            negativeMarks: q.negativeMarks,
            difficulty: q.difficulty,
            tags: q.tags,
            subject: q.subject,
            chapter: q.chapter,
            topic: q.topic,
            isCoding: q.isCoding,
            constraints: q.constraints,
            codeTemplate: q.codeTemplate,
            testCases: q.testCases
        }));

        await Question.insertMany(questionsToInsert);

        return NextResponse.json({
            success: true,
            data: {
                slug,
                questionCount: questionsToInsert.length
            }
        });

    } catch (error) {
        console.error('Generate Test Error:', error);
        return NextResponse.json({ success: false, message: 'Failed to generate test' }, { status: 500 });
    }
}
