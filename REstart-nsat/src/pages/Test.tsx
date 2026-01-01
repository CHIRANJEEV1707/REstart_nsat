import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { formatTime } from '@/lib/utils'
import { Clock, AlertCircle } from 'lucide-react'

interface Test {
  id: string
  title: string
  duration_minutes: number
  total_marks: number
}

interface TestAttempt {
  user_id: string
  test_id: string
  total_marks: number
  answers: Record<string, string>
  time_taken_seconds: number
  status: string
}

interface TestAttemptResponse extends TestAttempt {
  id: string
}

interface Question {
  id: string
  question_text: string
  question_type: 'mcq' | 'numerical'
  options: string[] | null
  marks: number
  order_index: number
}

export default function TestPage() {
  const { testId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeRemaining, setTimeRemaining] = useState(0)

  const { data: test } = useQuery<Test>({
    queryKey: ['test', testId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tests')
        .select('*')
        .eq('id', testId!)
        .single()

      if (error) throw error
      const testData = data as Test
      setTimeRemaining(testData.duration_minutes * 60)
      return testData
    },
    enabled: !!testId,
  })

  const { data: questions } = useQuery<Question[]>({
    queryKey: ['questions', testId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('questions')
        .select('id, question_text, question_type, options, marks, order_index')
        .eq('test_id', testId!)
        .order('order_index')

      if (error) throw error
      return data
    },
    enabled: !!testId,
  })

  const submitTest = useMutation<TestAttemptResponse>({
    mutationFn: async () => {
      const attemptData: TestAttempt = {
        user_id: user!.id,
        test_id: testId!,
        total_marks: test!.total_marks,
        answers: answers,
        time_taken_seconds: (test!.duration_minutes * 60) - timeRemaining,
        status: 'submitted',
      }
      
      const { data, error } = await supabase
        .from('test_attempts')
        .insert(attemptData as any)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (attempt) => {
      navigate(`/test/${testId}/result/${attempt.id}`)
    },
  })

  // Timer
  useEffect(() => {
    if (timeRemaining <= 0) {
      submitTest.mutate()
      return
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeRemaining])

  const currentQuestion = questions?.[currentQuestionIndex]

  const handleAnswer = (answer: string) => {
    if (currentQuestion) {
      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: answer }))
    }
  }

  const handleNext = () => {
    if (currentQuestionIndex < (questions?.length || 0) - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1)
    }
  }

  const handleSubmit = () => {
    if (confirm('Are you sure you want to submit the test?')) {
      submitTest.mutate()
    }
  }

  if (!test || !questions) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{test.title}</h1>
              <p className="text-sm text-gray-600">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className={`flex items-center px-4 py-2 rounded-lg ${timeRemaining < 300 ? 'bg-red-100 text-red-700' : 'bg-primary-100 text-primary-700'}`}>
                <Clock className="h-5 w-5 mr-2" />
                <span className="font-bold">{formatTime(timeRemaining)}</span>
              </div>
              <button onClick={handleSubmit} className="btn-primary">
                Submit Test
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="card mb-6">
          <div className="flex items-start mb-4">
            <span className="bg-primary-100 text-primary-700 font-bold px-3 py-1 rounded mr-4">
              Q{currentQuestionIndex + 1}
            </span>
            <div className="flex-1">
              <p className="text-lg text-gray-900 mb-2">{currentQuestion?.question_text}</p>
              <p className="text-sm text-gray-600">Marks: {currentQuestion?.marks}</p>
            </div>
          </div>

          {/* Options */}
          {currentQuestion?.question_type === 'mcq' && (
            <div className="space-y-3 mt-6">
              {(currentQuestion.options as any)?.map((option: string, index: number) => (
                <label
                  key={index}
                  className={`block p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    answers[currentQuestion.id] === option
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-primary-300'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value={option}
                    checked={answers[currentQuestion.id] === option}
                    onChange={(e) => handleAnswer(e.target.value)}
                    className="mr-3"
                  />
                  <span className="text-gray-900">{option}</span>
                </label>
              ))}
            </div>
          )}

          {currentQuestion?.question_type === 'numerical' && (
            <input
              type="text"
              value={answers[currentQuestion.id] || ''}
              onChange={(e) => handleAnswer(e.target.value)}
              placeholder="Enter your answer"
              className="input-field mt-6"
            />
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          {/* Question Navigator */}
          <div className="flex items-center gap-2 flex-wrap">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`h-10 w-10 rounded-lg font-medium transition-colors ${
                  index === currentQuestionIndex
                    ? 'bg-primary-600 text-white'
                    : answers[questions[index].id]
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={currentQuestionIndex === questions.length - 1}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>

        {/* Warning */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start">
          <AlertCircle className="h-5 w-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-yellow-800">
            Your test will be auto-submitted when the timer runs out. Make sure to answer all questions before time expires.
          </p>
        </div>
      </div>
    </div>
  )
}
