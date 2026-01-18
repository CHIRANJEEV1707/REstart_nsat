'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Clock, Calendar, GraduationCap, Bell, ChevronRight, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface ExamStickyHeaderProps {
  examName: string;
  subtext: string;
  deadlineDate: string; // ISO string or parsable date
  nextAttempt: string;
  eligibleColleges: string;
  onReminder?: () => void;
  onViewColleges?: () => void;
}

export default function ExamStickyHeader({
  examName,
  subtext,
  deadlineDate,
  nextAttempt,
  eligibleColleges,
  onReminder,
  onViewColleges
}: ExamStickyHeaderProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(deadlineDate) - +new Date();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);

        if (days > 0) {
          setTimeLeft(`${days}d ${hours}h`);
        } else {
          setTimeLeft(`${hours}h remaining`);
        }
        setIsExpired(false);
      } else {
        setTimeLeft('');
        setIsExpired(true);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [deadlineDate]);

  return (
    <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-8">

          {/* LEFT: Exam Info */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">{examName}</h1>
            <p className="text-sm text-gray-500 font-medium flex items-center gap-1">
              {subtext}
            </p>
          </div>

          {/* CENTER: Metadata */}
          <div className="flex-1 w-full md:w-auto flex flex-wrap gap-4 md:justify-center text-sm">

            {/* Countdown */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${isExpired ? 'bg-red-50 border-red-100 text-red-700' : 'bg-blue-50 border-blue-100 text-blue-700'}`}>
              {isExpired ? (
                <>
                  <AlertCircle className="w-4 h-4" />
                  <span className="font-semibold">Registration Closed</span>
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">Registration closes in:</span>
                  <span className="font-bold font-mono">{timeLeft}</span>
                </>
              )}
            </div>

            {/* Next Attempt */}
            <div className="flex items-center gap-2 text-gray-600 px-2 py-1.5">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="font-medium">Next Attempt:</span>
              <span className="text-gray-900 font-semibold">{nextAttempt}</span>
            </div>

            {/* Colleges */}
            <div className="hidden lg:flex items-center gap-2 text-gray-600 px-2 py-1.5 relative group/tooltip cursor-help">
              <GraduationCap className="w-4 h-4 text-gray-400" />
              <span className="font-medium">Colleges:</span>
              <span className="text-gray-900 font-semibold truncate max-w-[300px]">{eligibleColleges}</span>

              {/* Custom Tooltip */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-auto min-w-[200px] max-w-sm bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-all duration-200 shadow-xl z-50 invisible group-hover/tooltip:visible">
                <p className="font-semibold mb-1">Eligible Colleges:</p>
                {eligibleColleges}
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
              </div>
            </div>
          </div>

          {/* RIGHT: Actions */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={onReminder}
              className="flex-1 md:flex-none gap-2 text-gray-600 hover:text-gray-900"
            >
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Remind Me</span>
            </Button>
            <Button
              size="sm"
              onClick={onViewColleges}
              className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-sm shadow-blue-200"
            >
              View Eligible Colleges
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}
