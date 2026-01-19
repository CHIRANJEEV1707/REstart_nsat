'use client';

import { Lightbulb, TrendingUp, Target, Shield, Zap, AlertTriangle, BookOpen, BarChart, Microscope, HeartPulse, BrainCircuit } from 'lucide-react';

interface Insight {
  icon: any;
  title: string;
  description: string;
  color: string;
}

type ExamType = 'jee-mains' | 'jee-advanced' | 'bitsat' | 'neet' | 'ugee' | string;

const INSIGHTS_DATA: Record<string, Insight[]> = {
  'jee-mains': [
    {
      icon: BookOpen,
      title: 'Scoring Chapters',
      description: 'Focus on Modern Physics & Co-ordinate Geometry for high ROI.',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: AlertTriangle,
      title: 'Percentile Traps',
      description: 'Avoid spending > 5 mins on any single Chemistry question.',
      color: 'bg-orange-100 text-orange-600'
    },
    {
      icon: Shield,
      title: 'Safe Score',
      description: 'Target 180+ for a guaranteed seat in top NITs.',
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: Target,
      title: 'Attempt Strategy',
      description: 'Chemistry first, then Physics, then Math to maximize score.',
      color: 'bg-purple-100 text-purple-600'
    }
  ],
  'bitsat': [
    {
      icon: Zap,
      title: 'Speed Optimization',
      description: 'You need to solve ~0.8 questions/min. Skip aggressively.',
      color: 'bg-yellow-100 text-yellow-600'
    },
    {
      icon: TrendingUp,
      title: 'Campus ROI',
      description: 'BITS Pilani CS has an average package comparable to top IITs.',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: Target,
      title: 'Accuracy vs Attempts',
      description: 'Bonus questions unlock only after attempting all 130.',
      color: 'bg-red-100 text-red-600'
    },
    {
      icon: BookOpen,
      title: 'English & LR',
      description: 'Easiest section to score full marks. Do not neglect.',
      color: 'bg-purple-100 text-purple-600'
    }
  ],
  'jee-advanced': [
    {
      icon: AlertTriangle,
      title: 'Paper Pattern Traps',
      description: 'Watch out for multi-correct & matrix match marking schemes.',
      color: 'bg-red-100 text-red-600'
    },
    {
      icon: BarChart,
      title: 'Rank vs College',
      description: 'Top 500 rank ensures CS in Old IITs.',
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: Shield,
      title: 'Risk Strategy',
      description: 'Guessing is fatal. Accuracy > 90% is mandatory.',
      color: 'bg-orange-100 text-orange-600'
    },
    {
      icon: BookOpen,
      title: 'Subject Depth',
      description: 'Conceptual clarity beats formula memorization here.',
      color: 'bg-blue-100 text-blue-600'
    }
  ],
  'neet': [
    {
      icon: HeartPulse,
      title: 'Biology is Key',
      description: 'Biology constitutes 50% of marks. NCERT is your bible.',
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: Zap,
      title: 'Physics Speed',
      description: 'Practice numericals to solve within 1 min/question.',
      color: 'bg-yellow-100 text-yellow-600'
    },
    {
      icon: AlertTriangle,
      title: 'Negative Marking',
      description: 'High cutoff means accuracy is paramount. Avoid blind guesses.',
      color: 'bg-red-100 text-red-600'
    },
    {
      icon: BookOpen,
      title: 'Organic Chemistry',
      description: 'Focus on reaction mechanisms and named reactions.',
      color: 'bg-purple-100 text-purple-600'
    }
  ],
  'ugee': [
    {
      icon: BrainCircuit,
      title: 'REAP Section',
      description: 'Research Aptitude is critical. Focus on logic & linguistics.',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      icon: Microscope,
      title: 'Research Orientation',
      description: 'Interview round assesses your passion for research.',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: Target,
      title: 'SUPR Strategy',
      description: 'Subject proficiency is standard. REAP is the rank decider.',
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: Shield,
      title: 'Cutoffs',
      description: 'You must clear cutoffs in BOTH sections independently.',
      color: 'bg-orange-100 text-orange-600'
    }
  ]
};

interface SmartInsightsSectionProps {
  examType: ExamType;
}

export default function SmartInsightsSection({ examType }: SmartInsightsSectionProps) {
  const insights = INSIGHTS_DATA[examType] || INSIGHTS_DATA['jee-mains']; // Fallback

  return (
    <div className="mb-12">
      <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Lightbulb className="w-5 h-5 text-yellow-500 fill-current" />
        Smart Insights & Strategy
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow cursor-default group"
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${insight.color} group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{insight.title}</h3>
              <p className="text-sm text-gray-600 leading-snug">
                {insight.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
