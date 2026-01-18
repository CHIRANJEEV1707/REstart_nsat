'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { X, Clock, CheckCircle, Flag, ArrowRight, Loader2 } from 'lucide-react';
import { ExamService, Question } from '@/services/examService';

interface PracticeSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  examId: string;
  onComplete: () => void;
  initialQuestions?: Question[]; // Optional pre-selected questions
}

export default function PracticeSessionModal({
  isOpen,
  onClose,
  examId,
  onComplete,
  initialQuestions
}: PracticeSessionModalProps) {
  const [step, setStep] = useState<'intro' | 'loading' | 'active' | 'submitting' | 'success'>('intro');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({}); // questionId -> optionId

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setStep('intro');
      setTimeLeft(300);
      setCurrentQuestionIndex(0);
      setQuestions([]);
      setAnswers({});
    }
  }, [isOpen]);

  // Timer
  useEffect(() => {
    if (step === 'active' && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && step === 'active') {
      handleSubmit();
    }
  }, [step, timeLeft]);

  const handleStart = async () => {
    if (initialQuestions && initialQuestions.length > 0) {
      setQuestions(initialQuestions);
      setStep('active');
      return;
    }

    setStep('loading');
    try {
      const fetchedQuestions = await ExamService.getQuickPracticeQuestions(examId);
      if (fetchedQuestions.length > 0) {
        setQuestions(fetchedQuestions);
        setStep('active');
      } else {
        alert('No practice questions available right now.');
        onClose();
      }
    } catch (error) {
      alert('Failed to load questions.');
      onClose();
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(c => c + 1);
    } else {
      handleSubmit();
    }
  };

  const handleOptionSelect = (optionId: string) => {
    const q = questions[currentQuestionIndex];
    setAnswers(prev => ({ ...prev, [q.id]: optionId }));
  };

  const handleSubmit = async () => {
    setStep('submitting');
    try {
      // Calculate score locally for fun or send to API if it supported detailed submission
      const solvedCount = Object.keys(answers).length;
      await ExamService.completePractice(examId, solvedCount); // API expects number of questions solved
      setStep('success');
      setTimeout(() => {
        onComplete();
        onClose();
      }, 2000);
    } catch (error) {
      alert('Failed to submit practice. Check connection.');
      setStep('active');
    }
  };

  if (!isOpen) return null;

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-2xl h-[600px] shadow-2xl flex flex-col relative overflow-hidden">

        {/* Close (only if not doing exam) */}
        {step === 'intro' && (
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10">
            <X className="w-6 h-6" />
          </button>
        )}

        {/* Content */}
        <div className="flex-1 flex flex-col p-8 w-full h-full">

          {step === 'intro' && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6 max-w-md mx-auto">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                <Flag className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Ready for Quick Practice?</h2>
                <p className="text-gray-500 mt-2">
                  Solve 5 high-yield questions in 5 minutes to keep your streak alive.
                </p>
              </div>
              <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={handleStart}>
                Start Session
              </Button>
            </div>
          )}

          {step === 'loading' && (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
              <p className="text-gray-500">Preparing your questions...</p>
            </div>
          )}

          {step === 'active' && currentQuestion && (
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                <div className="text-sm font-medium text-gray-500">
                  Question {currentQuestionIndex + 1} / {questions.length}
                </div>
                <div className="flex items-center gap-2 text-orange-600 font-mono font-bold bg-orange-50 px-3 py-1 rounded-lg">
                  <Clock className="w-4 h-4" />
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </div>
              </div>

              {/* Question Text */}
              <div className="mb-6 flex-1 overflow-y-auto">
                 <div className="mb-2">
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded uppercase tracking-wider">
                        {currentQuestion.subject}
                    </span>
                    <span className="ml-2 text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded uppercase tracking-wider">
                        {currentQuestion.difficulty}
                    </span>
                 </div>
                <h3 className="text-lg font-medium text-gray-900 leading-relaxed">
                  {currentQuestion.text}
                </h3>

                {/* Options */}
                <div className="mt-6 space-y-3">
                    {currentQuestion.options?.map((opt) => (
                        <button
                            key={opt.id}
                            onClick={() => handleOptionSelect(opt.id)}
                            className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-3
                                ${answers[currentQuestion.id] === opt.id
                                    ? 'border-blue-500 bg-blue-50/50 text-blue-800'
                                    : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                                ${answers[currentQuestion.id] === opt.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}
                            `}>
                                {opt.id}
                            </span>
                            <span className="font-medium">{opt.text}</span>
                        </button>
                    ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end pt-4 border-t border-gray-100">
                <Button onClick={handleNext} className="gap-2 bg-blue-600 text-white shadow-lg shadow-blue-200">
                  {currentQuestionIndex === questions.length - 1 ? 'Submit' : 'Next'} <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 'submitting' && (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
              <h3 className="text-lg font-medium text-gray-900">Submitting your progress...</h3>
            </div>
          )}

          {step === 'success' && (
            <div className="flex flex-col items-center justify-center h-full space-y-4 animate-in zoom-in">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Streak Updated! 🔥</h2>
              <p className="text-gray-500">Great job keeping up the momentum.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
