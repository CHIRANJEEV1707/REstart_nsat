"use client";
import React from 'react';
import { OnboardingData } from '../OnboardingWizard';
import { CheckCircle2, Circle, Rocket, GraduationCap } from 'lucide-react';

interface StepProps {
    data: OnboardingData;
    updateData: (data: Partial<OnboardingData>) => void;
}

export function StepNewGenInterest({ data, updateData }: StepProps) {

    const toggleNewGen = () => {
        const newValue = !data.newGenInterest;
        if (newValue) {
            // Auto-select preferences
            const exams = data.interestedExams || [];
            if (!exams.includes("NSAT")) exams.push("NSAT");
            if (!exams.includes("JEE Main")) exams.push("JEE Main"); // Usually relevant

            updateData({
                newGenInterest: true,
                targetDegree: 'B.Tech',
                aspiringCollegeType: [...(data.aspiringCollegeType || []), 'Engineering', 'New-Gen / Industry-Focused'],
                interestedExams: exams
            });
        } else {
            updateData({ newGenInterest: false });
        }
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-right fade-in duration-300">
            <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-4 text-indigo-600">
                    <Rocket className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Are you interested in New-Gen Tech Colleges?</h3>
                <p className="text-gray-500 mt-2 max-w-lg mx-auto">
                    These are industry-focused institutions like <strong>Newton School of Technology (NST)</strong> that offer practical, hands-on B.Tech degrees in CS & AI.
                </p>
            </div>

            <button
                onClick={toggleNewGen}
                className={`w-full group relative p-6 rounded-2xl border-2 text-left transition-all ${data.newGenInterest
                    ? 'border-indigo-600 bg-indigo-50 shadow-md transform scale-[1.01]'
                    : 'border-gray-200 bg-white hover:border-indigo-300'
                    }`}
            >
                <div className="flex items-start gap-4">
                    <div className={`mt-1 p-2 rounded-lg ${data.newGenInterest ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                        <GraduationCap className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className={`text-lg font-bold ${data.newGenInterest ? 'text-indigo-900' : 'text-gray-900'}`}>
                            Yes, I'm interested in New-Gen Colleges
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                            Selecting this will automatically prioritize colleges like NST, simplify your exam recommendations (NSAT), and tailor your dashboard for Tech & AI careers.
                        </p>
                    </div>
                    <div className="ml-auto pl-4">
                        {data.newGenInterest ? (
                            <CheckCircle2 className="w-8 h-8 text-indigo-600" />
                        ) : (
                            <Circle className="w-8 h-8 text-gray-300 group-hover:text-indigo-400" />
                        )}
                    </div>
                </div>
            </button>

            <div className="text-center">
                <button
                    onClick={() => updateData({ newGenInterest: false })}
                    className={`text-sm font-medium hover:underline ${!data.newGenInterest ? 'text-indigo-600' : 'text-gray-400'}`}
                >
                    No, I prefer only traditional colleges
                </button>
            </div>
        </div>
    );
}
