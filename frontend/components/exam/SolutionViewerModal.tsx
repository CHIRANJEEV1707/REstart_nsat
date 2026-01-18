'use client';

import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { X, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Question } from '@/services/examService';
import { useState } from 'react';

interface SolutionViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: Question[];
}

export default function SolutionViewerModal({ isOpen, onClose, questions }: SolutionViewerModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!isOpen || questions.length === 0) return null;

  const question = questions[currentIndex];

  const handleNext = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex(c => c + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(c => c - 1);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] shadow-2xl flex flex-col relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Solutions</h2>
            <p className="text-sm text-gray-500">Question {currentIndex + 1} of {questions.length}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
            <div className="mb-6">
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded uppercase tracking-wider mb-2 inline-block">
                    {question.subject}
                </span>
                <p className="text-lg font-medium text-gray-900 leading-relaxed">
                    {question.text}
                </p>
                {/* Options */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {question.options?.map((opt) => (
                        <div key={opt.id} className={`p-3 rounded-lg border text-sm flex items-center gap-3
                            ${opt.id === question.correctAnswer ? 'border-green-200 bg-green-50 text-green-800' : 'border-gray-100 text-gray-600'}
                        `}>
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs
                                ${opt.id === question.correctAnswer ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'}
                            `}>{opt.id}</span>
                            {opt.text}
                            {opt.id === question.correctAnswer && <CheckCircle2 className="w-4 h-4 ml-auto text-green-600" />}
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-blue-50/50 rounded-xl p-6 border border-blue-100">
                <h3 className="font-bold text-blue-900 mb-2">Explanation</h3>
                <p className="text-blue-800 leading-relaxed text-sm">
                    {question.explanation || "No explanation provided."}
                </p>
            </div>
        </div>

        {/* Footer Navigation */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center">
             <Button variant="outline" onClick={handlePrev} disabled={currentIndex === 0} className="gap-2">
                <ChevronLeft className="w-4 h-4" /> Previous
             </Button>
             <Button variant="outline" onClick={handleNext} disabled={currentIndex === questions.length - 1} className="gap-2">
                Next <ChevronRight className="w-4 h-4" />
             </Button>
        </div>
      </div>
    </div>
  );
}
