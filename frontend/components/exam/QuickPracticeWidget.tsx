'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Play, CheckCircle, Clock, BarChart2, FileText, RotateCcw } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { ExamService } from '@/services/examService';
import PracticeSessionModal from './PracticeSessionModal';

interface QuickPracticeWidgetProps {
  examId: string;
}

export default function QuickPracticeWidget({ examId }: QuickPracticeWidgetProps) {
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadData = async () => {
    const data = await ExamService.getUserProgress(examId);
    if (!data) {
      setLoading(false);
      return;
    }

    setStreak(data.streak?.current || 0);

    // Check if practiced today
    const lastDate = data.streak?.lastPracticeDate ? new Date(data.streak.lastPracticeDate) : null;
    const today = new Date();

    const isToday = lastDate &&
      lastDate.getDate() === today.getDate() &&
      lastDate.getMonth() === today.getMonth() &&
      lastDate.getFullYear() === today.getFullYear();

    if (isToday) {
      setCompleted(true);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [examId]);

  const handlePracticeComplete = () => {
    // Reload stats to show updated streak
    loadData();
    setCompleted(true);
  };

  if (loading) return <div className="h-64 bg-gray-50 rounded-2xl animate-pulse" />;

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 transition-all duration-300 hover:shadow-md relative overflow-hidden">

        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            Today&apos;s Quick Practice
            {completed && <CheckCircle className="w-5 h-5 text-green-500" />}
          </h3>
          {!completed && (
            <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-orange-100">
              Daily Streak: {streak} 🔥
            </Badge>
          )}
          {completed && (
            <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-100">
              Streak Extended! 🔥
            </Badge>
          )}
        </div>

        {!completed ? (
          // DEFAULT STATE
          <div className="space-y-6">
            <div className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 rounded-xl p-4">
              <div className="flex flex-col items-center gap-1">
                <span className="bg-blue-100 text-blue-600 p-2 rounded-lg"><FileText className="w-5 h-5" /></span>
                <span className="font-medium">5 PYQs</span>
              </div>
              <div className="w-px h-10 bg-gray-200"></div>
              <div className="flex flex-col items-center gap-1">
                <span className="bg-purple-100 text-purple-600 p-2 rounded-lg"><Clock className="w-5 h-5" /></span>
                <span className="font-medium">~5 mins</span>
              </div>
              <div className="w-px h-10 bg-gray-200"></div>
              <div className="flex flex-col items-center gap-1">
                <span className="bg-orange-100 text-orange-600 p-2 rounded-lg"><BarChart2 className="w-5 h-5" /></span>
                <span className="font-medium">Mixed</span>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-200 gap-2 h-12 rounded-xl"
              onClick={() => setIsModalOpen(true)}
            >
              <Play className="w-5 h-5 fill-current" />
              Start Practice
            </Button>
          </div>
        ) : (
          // COMPLETED STATE
          <div className="space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-green-50 rounded-xl p-3 border border-green-100">
                <div className="text-xs text-green-600 font-semibold uppercase mb-1">Status</div>
                <div className="text-lg font-bold text-green-700">Done</div>
              </div>
              <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                <div className="text-xs text-blue-600 font-semibold uppercase mb-1">Target</div>
                <div className="text-lg font-bold text-blue-700">5/5</div>
              </div>
              <div className="bg-orange-50 rounded-xl p-3 border border-orange-100">
                <div className="text-xs text-orange-600 font-semibold uppercase mb-1">Streak</div>
                <div className="text-lg font-bold text-orange-700">{streak} <span className="text-sm">days</span></div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-100 gap-2"
                onClick={() => setIsModalOpen(true)}
              >
                <RotateCcw className="w-4 h-4" />
                Practice Again
              </Button>
            </div>
          </div>
        )}
      </div>

      <PracticeSessionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        examId={examId}
        onComplete={handlePracticeComplete}
      />
    </>
  );
}
