'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ExamStickyHeader from '@/components/exam/ExamStickyHeader';
import QuickPracticeWidget from '@/components/exam/QuickPracticeWidget';
import ProgressSnapshotCard from '@/components/exam/ProgressSnapshotCard';
import PYQExplorer from '@/components/exam/PYQExplorer';
import SmartInsightsSection from '@/components/exam/SmartInsightsSection';
import SoftUpgradeCard from '@/components/exam/SoftUpgradeCard';
import CollegeListModal from '@/components/exam/CollegeListModal';
import { ExamService, ExamDetails } from '@/services/examService';

export default function JEEMainsPage() {
  const [examDetails, setExamDetails] = useState<ExamDetails | null>(null);
  const [isCollegeModalOpen, setIsCollegeModalOpen] = useState(false);
  const EXAM_SLUG = 'jee-mains';

  useEffect(() => {
    async function loadExam() {
      const details = await ExamService.getExamDetails(EXAM_SLUG);
      if (details) {
        setExamDetails(details);
      }
    }
    loadExam();
  }, []);

  const headerProps = examDetails ? {
    examName: examDetails.name,
    subtext: examDetails.description || "Engineering Entrance | India",
    deadlineDate: examDetails.dates.registration_end,
    nextAttempt: new Date(examDetails.dates.exam_date_start).toLocaleString('default', { month: 'long', year: 'numeric' }),
    eligibleColleges: "NITs, IIITs, GFTIs",
  } : {
    examName: "JEE Mains 2026",
    subtext: "Engineering Entrance | India",
    deadlineDate: "2026-03-31",
    nextAttempt: "April 2026",
    eligibleColleges: "NITs, IIITs, GFTIs"
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <ExamStickyHeader
        {...headerProps}
        onReminder={() => console.log('Reminder set!')}
        onViewColleges={() => setIsCollegeModalOpen(true)}
      />

      <div className="max-w-7xl mx-auto px-6 py-8">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <ProgressSnapshotCard
              examId={EXAM_SLUG}
              onViewChances={() => setIsCollegeModalOpen(true)}
            />
          </div>

          <div className="lg:col-span-1">
            <QuickPracticeWidget examId={EXAM_SLUG} />
          </div>
        </div>

        {/* PYQ Explorer Section */}
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Explore Previous Year Questions</h2>
            <Link
              href={`/prep/${EXAM_SLUG}/pyq`}
              className="text-blue-600 font-medium hover:text-blue-800 flex items-center transition-colors"
            >
              View All Papers <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <PYQExplorer examType={EXAM_SLUG} />
        </div>

        <SmartInsightsSection examType={EXAM_SLUG} />

        <div className="mt-12">
          <SoftUpgradeCard />
        </div>
      </div>

      <CollegeListModal
        isOpen={isCollegeModalOpen}
        onClose={() => setIsCollegeModalOpen(false)}
        examType={EXAM_SLUG}
      />
    </div>
  );
}
