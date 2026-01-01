import { useQuery } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { formatTime, calculatePercentage } from '@/lib/utils'
import { Trophy, Clock, Target, CheckCircle, X, ArrowLeft } from 'lucide-react'

interface TestAttempt {
  id: string
  answers: Record<string, string>
  score?: number
  time_taken_seconds?: number
}

interface Test {
  id: string
  title: string
  total_marks: number
  passing_marks: number
}

interface Question {
  id: string
  question_text: string
  correct_answer: string
  marks: number
  explanation?: string
  order_index: number
}

export default function TestResultPage() {
  const { testId, attemptId } = useParams()

  const { data: result, isLoading } = useQuery({
    queryKey: ['test-result', attemptId],
    queryFn: async () => {
      // Get attempt
      const { data: attempt, error: attemptError } = await supabase
        .from('test_attempts')
        .select('*')
        .eq('id', attemptId!)
        .single() as { data: TestAttempt | null; error: any }

      if (attemptError) throw attemptError
      if (!attempt) throw new Error('Test attempt not found')

      // Get test and questions
      const { data: test, error: testError } = await supabase
        .from('tests')
        .select('*')
        .eq('id', testId!)
        .single() as { data: Test | null; error: any }

      if (testError) throw testError
      if (!test) throw new Error('Test not found')

      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .eq('test_id', testId!)
        .order('order_index') as { data: Question[] | null; error: any }

      if (questionsError) throw questionsError
      if (!questions) throw new Error('Questions not found')

      // Calculate results
      let score = 0
      const answersMap = attempt.answers as Record<string, string>
      const results = questions.map((q) => {
        const userAnswer = answersMap[q.id]
        const isCorrect = userAnswer === q.correct_answer
        if (isCorrect) score += q.marks

        return {
          question: q,
          userAnswer,
          isCorrect,
        }
      })

      // Update score in database
      await supabase
        .from('test_attempts')
        .update({ score } as any)
        .eq('id', attemptId!)

      return {
        attempt,
        test,
        questions: results,
        score,
        percentage: calculatePercentage(score, test.total_marks),
      }
    },
    enabled: !!attemptId && !!testId,
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!result) return null

  const passed = result.score >= result.test.passing_marks

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <Link
          to="/dashboard"
          className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>

        {/* Result Summary */}
        <div className={`card mb-8 ${passed ? 'border-2 border-green-500' : 'border-2 border-orange-500'}`}>
          <div className="text-center">
            <div className={`inline-flex items-center justify-center h-20 w-20 rounded-full mb-4 ${passed ? 'bg-green-100' : 'bg-orange-100'}`}>
              <Trophy className={`h-10 w-10 ${passed ? 'text-green-600' : 'text-orange-600'}`} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{result.test.title}</h1>
            <p className={`text-2xl font-bold mb-4 ${passed ? 'text-green-600' : 'text-orange-600'}`}>
              {passed ? 'Congratulations! You Passed' : 'Keep Practicing'}
            </p>

            <div className="grid md:grid-cols-4 gap-6 mt-8">
              <div>
                <p className="text-sm text-gray-600 mb-1">Score</p>
                <p className="text-3xl font-bold text-gray-900">
                  {result.score}/{result.test.total_marks}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Percentage</p>
                <p className="text-3xl font-bold text-primary-600">{result.percentage}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Time Taken</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatTime(result.attempt.time_taken_seconds || 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Accuracy</p>
                <p className="text-3xl font-bold text-gray-900">
                  {calculatePercentage(
                    result.questions.filter((q: any) => q.isCorrect).length,
                    result.questions.length
                  )}
                  %
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Analysis */}
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Detailed Analysis</h2>
          <div className="space-y-6">
            {result.questions.map((item: any, index: number) => (
              <div
                key={item.question.id}
                className={`p-6 rounded-lg border-2 ${
                  item.isCorrect
                    ? 'border-green-200 bg-green-50'
                    : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-start mb-4">
                  <span className="bg-gray-900 text-white font-bold px-3 py-1 rounded mr-4">
                    Q{index + 1}
                  </span>
                  {item.isCorrect ? (
                    <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                  ) : (
                    <X className="h-6 w-6 text-red-600 mr-3" />
                  )}
                  <div className="flex-1">
                    <p className="text-lg text-gray-900 mb-2">{item.question.question_text}</p>
                    <p className="text-sm text-gray-600">Marks: {item.question.marks}</p>
                  </div>
                </div>

                <div className="ml-16 space-y-2">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Your Answer:</p>
                    <p className={`font-medium ${item.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                      {item.userAnswer || 'Not Answered'}
                    </p>
                  </div>

                  {!item.isCorrect && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Correct Answer:</p>
                      <p className="font-medium text-green-700">{item.question.correct_answer}</p>
                    </div>
                  )}

                  {item.question.explanation && (
                    <div className="mt-3 p-3 bg-white rounded border border-gray-200">
                      <p className="text-sm font-medium text-gray-700 mb-1">Explanation:</p>
                      <p className="text-sm text-gray-600">{item.question.explanation}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex gap-4 justify-center">
          <Link to="/dashboard" className="btn-secondary">
            Back to Dashboard
          </Link>
          <Link to={`/test/${testId}`} className="btn-primary">
            Retake Test
          </Link>
        </div>
      </div>
    </div>
  )
}
