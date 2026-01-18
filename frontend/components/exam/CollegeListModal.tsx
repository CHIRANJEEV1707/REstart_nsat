'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog'; // Assuming these exist or I use raw generic modal
import { Button } from '@/components/ui/Button';
import { X, MapPin, Award, ArrowRight, ExternalLink, Loader2 } from 'lucide-react';
import { ExamService, College } from '@/services/examService';

interface CollegeListModalProps {
  isOpen: boolean;
  onClose: () => void;
  examType: string;
}

export default function CollegeListModal({ isOpen, onClose, examType }: CollegeListModalProps) {
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      ExamService.getEligibleColleges(examType)
        .then(data => {
          setColleges(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [isOpen, examType]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[85vh] shadow-2xl flex flex-col relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Eligible Colleges</h2>
            <p className="text-sm text-gray-500">Based on {examType.replace('-', ' ').toUpperCase()} score</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
              <p className="text-gray-500 font-medium">Fetching top colleges...</p>
            </div>
          ) : colleges.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">No colleges found matching this exam yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {colleges.map((college) => (
                <div key={college._id} className="border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow group bg-white">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                        {college.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {college.location.city}, {college.location.state}
                      </div>
                    </div>
                    {college.trendingScore > 80 && (
                      <span className="bg-orange-50 text-orange-700 text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                        <Award className="w-3 h-3" /> Top Choice
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md font-medium">
                      {college.type}
                    </span>
                    {college.badges.map((badge, idx) => (
                      <span key={idx} className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded-md font-medium">
                        {badge}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <div className="text-sm">
                      <span className="text-gray-500">Approx Fees:</span>
                      <span className="font-semibold text-gray-900 ml-1">₹{(college.fees / 100000).toFixed(1)}L</span>
                    </div>
                    <Button variant="outline" size="sm" className="gap-1 h-8 text-xs">
                      Details <ArrowRight className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
