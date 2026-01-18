'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { X, Target, Loader2 } from 'lucide-react';
import { ExamService } from '@/services/examService';

interface ScoreUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newScore: any) => void;
  examId: string;
  initialScore?: number;
  totalMarks?: number;
}

export default function ScoreUpdateModal({
  isOpen,
  onClose,
  onSuccess,
  examId,
  initialScore = 0,
  totalMarks = 300
}: ScoreUpdateModalProps) {
  const [score, setScore] = useState(initialScore);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (score < 0 || score > totalMarks) {
      setError(`Score must be between 0 and ${totalMarks}`);
      return;
    }

    setLoading(true);
    try {
      const updatedProgress = await ExamService.updateScore(examId, score, totalMarks);
      onSuccess(updatedProgress); // Pass back the full updated object
      onClose();
    } catch (err) {
      setError('Failed to save score. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl scale-100 animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            Update Score
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Latest Mock Score (out of {totalMarks})
            </label>
            <Input
              type="number"
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
              placeholder="e.g. 180"
              className="text-lg font-bold"
              autoFocus
              min={0}
              max={totalMarks}
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Score'
              )}
            </Button>
          </div>
        </form>

      </div>
    </div>
  );
}
