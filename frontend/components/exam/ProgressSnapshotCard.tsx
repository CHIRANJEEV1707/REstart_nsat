'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Target, TrendingUp, GraduationCap, AlertTriangle, Plus, RefreshCw } from 'lucide-react';
import { ExamService, UserProgressData } from '@/services/examService';
import ScoreUpdateModal from './ScoreUpdateModal';

interface ProgressSnapshotCardProps {
  examId: string;
  onViewChances?: () => void;
}

export default function ProgressSnapshotCard({
  examId,
  onViewChances
}: ProgressSnapshotCardProps) {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<UserProgressData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      const data = await ExamService.getUserProgress(examId);
      if (mounted) {
        setProgress(data);
        setLoading(false);
      }
    }
    loadData();
    return () => { mounted = false; };
  }, [examId]);

  const handleScoreUpdateSuccess = (updatedData: any) => {
    // Optimistically update or use returned data
    // API returns the full progress object usually, or we reload.
    // Assuming API returns updated progress document structure
    // We might need to map it if structure differs slightly, but currently it matches closely.
    // Re-fetching is safest for consistency.
    ExamService.getUserProgress(examId).then(data => setProgress(data));
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 h-64 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const hasScore = progress && progress.latestScore;
  const score = progress?.latestScore?.score || 0;
  const total = progress?.latestScore?.total || 300;

  const percentileEstimate = hasScore && progress?.latestScore?.percentile
    ? progress.latestScore.percentile.toFixed(1)
    : null;

  const eligibleCollegesCount = hasScore ? Math.floor((score / total) * 20) : 0;
  const gapScore = hasScore ? Math.max(0, (total * 0.85) - score) : 0;

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 relative overflow-hidden transition-all duration-300 hover:shadow-md">
        <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none ${hasScore ? 'bg-blue-50' : 'bg-orange-50'}`}></div>

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {hasScore ? "Your Current Standing" : "Unlock Your Prediction"}
              </h2>
              {!hasScore && (
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1.5"><TrendingUp className="w-4 h-4 text-green-500" /> Percentile Estimate</span>
                  <span className="flex items-center gap-1.5"><GraduationCap className="w-4 h-4 text-blue-500" /> Eligible Colleges</span>
                </div>
              )}
              {hasScore && (
                <p className="text-gray-500 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  Verified Score
                </p>
              )}
            </div>

            <div>
              {hasScore ? (
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setIsModalOpen(true)} className="gap-2">
                    <RefreshCw className="w-4 h-4 text-gray-500" />
                    Update Score
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200" onClick={onViewChances}>
                    See College Chances
                  </Button>
                </div>
              ) : (
                <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-200 gap-2" onClick={() => setIsModalOpen(true)}>
                  <Plus className="w-5 h-5" />
                  Add Last Score
                </Button>
              )}
            </div>
          </div>

          {hasScore && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in zoom-in-95 duration-500">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 group hover:border-blue-200 transition-colors">
                <div className="flex items-center gap-2 mb-2 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                  <Target className="w-4 h-4 text-blue-600" />
                  Score
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-gray-900">{score}</span>
                  <span className="text-gray-400 font-medium">/ {total}</span>
                </div>
              </div>

              <div className="bg-green-50/50 rounded-xl p-4 border border-green-100">
                <div className="flex items-center gap-2 mb-2 text-green-700 text-xs font-semibold uppercase tracking-wider">
                  <TrendingUp className="w-4 h-4" />
                  Percentile
                </div>
                <div className="text-3xl font-bold text-green-700">
                  {percentileEstimate}%
                </div>
              </div>

              <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-center gap-2 mb-2 text-blue-700 text-xs font-semibold uppercase tracking-wider">
                  <GraduationCap className="w-4 h-4" />
                  Colleges
                </div>
                <div className="text-3xl font-bold text-blue-700">
                  {eligibleCollegesCount}+
                </div>
              </div>

              <div className="bg-yellow-50/50 rounded-xl p-4 border border-yellow-100">
                <div className="flex items-center gap-2 mb-2 text-yellow-700 text-xs font-semibold uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4" />
                  Gap
                </div>
                <div className="text-3xl font-bold text-yellow-700">
                  {Math.round(gapScore)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <ScoreUpdateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        examId={examId}
        initialScore={score}
        totalMarks={total}
        onSuccess={handleScoreUpdateSuccess}
      />
    </>
  );
}
