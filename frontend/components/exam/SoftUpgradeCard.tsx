'use client';

import { Button } from '@/components/ui/Button';
import { Crown, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';

export default function SoftUpgradeCard() {
  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl p-8 text-white relative overflow-hidden shadow-2xl">
      {/* Background Effects */}
      <div className="absolute top-0 right-0 p-16 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 p-20 bg-purple-500/10 rounded-full blur-3xl -ml-20 -mb-20"></div>

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex-1 space-y-4 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <Crown className="w-3 h-3" />
            Premium Access
          </div>

          <h2 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Want deeper analysis & full mocks?
          </h2>

          <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 text-sm text-gray-300">
            {[
              'Full-length mocks',
              'Detailed analytics',
              'Mentor feedback',
              'College probability engine'
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-shrink-0 w-full md:w-auto">
          <Button
            size="lg"
            className="w-full md:w-auto bg-white hover:bg-gray-100 text-gray-900 font-bold px-8 h-12 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_rgba(255,255,255,0.5)] transition-all duration-300 group"
            onClick={() => console.log('Upgrade clicked')}
          >
            View Plans
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <p className="text-xs text-center text-gray-500 mt-3">
            7-day money back guarantee • No commitment
          </p>
        </div>
      </div>
    </div>
  );
}
