'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { X, Clock, CheckCircle, Flag, ArrowRight, Loader2 } from 'lucide-react';
import { ExamService } from '@/services/examService';

interface PracticeSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  examId: string;
  onComplete: () => void;
}

export default function PracticeSessionModal({
  isOpen,
  onClose,
  examId,
  onComplete
}: PracticeSessionModalProps) {
  const [step, setStep] = useState<'intro' | 'active' | 'submitting' | 'success'>('intro');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const TOTAL_QUESTIONS = 5;

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setStep('intro');
      setTimeLeft(300);
      setCurrentQuestion(1);
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

  const handleStart = () => setStep('active');

  const handleNext = () => {
    if (currentQuestion < TOTAL_QUESTIONS) {
      setCurrentQuestion(c => c + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setStep('submitting');
    try {
      await ExamService.completePractice(examId, TOTAL_QUESTIONS);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-2xl h-[500px] shadow-2xl flex flex-col relative overflow-hidden">

        {/* Close (only if not doing exam) */}
        {step === 'intro' && (
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10">
            <X className="w-6 h-6" />
          </button>
        )}

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">

          {step === 'intro' && (
            <div className="space-y-6 max-w-md">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                <Flag className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Ready for Quick Practice?</h2>
                <p className="text-gray-500 mt-2">
                  Solve {TOTAL_QUESTIONS} high-yield questions in 5 minutes to keep your streak alive.
                </p>
              </div>
              <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={handleStart}>
                Start Session
              </Button>
            </div>
          )}

          {step === 'active' && (
            <div className="w-full h-full flex flex-col">
              {/* Header */}
              <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
                <div className="text-sm font-medium text-gray-500">
                  Question {currentQuestion} / {TOTAL_QUESTIONS}
                </div>
                <div className="flex items-center gap-2 text-orange-600 font-mono font-bold bg-orange-50 px-3 py-1 rounded-lg">
                  <Clock className="w-4 h-4" />
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </div>
              </div>

              {/* Question Placeholder */}
              <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-xl mb-8 border border-gray-100 border-dashed">
                <p className="text-gray-400 font-medium">
                  [ Real Question {currentQuestion} would appear here ]
                </p>
              </div>

              {/* Actions */}
              <div className="flex justify-end">
                <Button onClick={handleNext} className="gap-2 bg-blue-600 text-white">
                  {currentQuestion === TOTAL_QUESTIONS ? 'Submit' : 'Next'} <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 'submitting' && (
            <div className="space-y-4">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
              <h3 className="text-lg font-medium text-gray-900">Submitting your progress...</h3>
            </div>
          )}

          {step === 'success' && (
            <div className="space-y-4 animate-in zoom-in">
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
