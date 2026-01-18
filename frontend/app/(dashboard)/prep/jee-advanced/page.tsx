'use client';

import ExamStickyHeader from '@/components/exam/ExamStickyHeader';
import QuickPracticeWidget from '@/components/exam/QuickPracticeWidget';
import ProgressSnapshotCard from '@/components/exam/ProgressSnapshotCard';
import PYQExplorer from '@/components/exam/PYQExplorer';
import SmartInsightsSection from '@/components/exam/SmartInsightsSection';
import SoftUpgradeCard from '@/components/exam/SoftUpgradeCard';



export default function JEEAdvancedPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Sticky Header */}
      <ExamStickyHeader
        examName="JEE Advanced 2026"
        subtext="IIT Entrance | India"
        deadlineDate="2026-05-07"
        nextAttempt="May 2026"
        eligibleColleges="Indian Institutes of Technology (IITs)"
        onReminder={() => console.log('Reminder set!')}
        onViewColleges={() => console.log('Viewing eligible colleges...')}
      />

      <div className="max-w-7xl mx-auto px-6 py-8">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Main Progress Card */}
          <div className="lg:col-span-2">
            <ProgressSnapshotCard
              examId="jee-advanced"
              onViewChances={() => alert('College Predictor opening soon...')}
            />
          </div>

          {/* Quick Practice Widget - Completed State Demo */}
          <div className="lg:col-span-1">
            <QuickPracticeWidget examId="jee-advanced" />
          </div>
        </div>

        {/* PYQ Explorer Section */}
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Explore Previous Year Questions</h2>
          <PYQExplorer />
        </div>

        {/* Smart Insights Section */}
        <SmartInsightsSection examType="jee-advanced" />

        {/* Soft Upgrade CTA */}
        <div className="mt-12">
          <SoftUpgradeCard />
        </div>


      </div>
    </div>
  );
}
