"use client";
import React from 'react';
import { OnboardingData } from '../OnboardingWizard';

interface StepProps {
    data: OnboardingData;
    updateData: (data: Partial<OnboardingData>) => void;
}

const DEGREES = ['B.Tech', 'BS', 'MS', 'PhD', 'MBA'];
const COLLEGE_TYPES = ['Engineering', 'Research', 'Medical', 'Design', 'Management'];

export function StepAcademic({ data, updateData }: StepProps) {

    const toggleType = (type: string) => {
        const current = data.aspiringCollegeType;
        if (current.includes(type)) {
            updateData({ aspiringCollegeType: current.filter(t => t !== type) });
        } else {
            updateData({ aspiringCollegeType: [...current, type] });
        }
    };

    return (
        <div className="space-y-8 animate-in slide-in-from-right fade-in duration-300">
            <div>
                <label className="block text-sm font-bold text-gray-800 mb-3">Target Degree</label>
                <div className="grid grid-cols-3 gap-3">
                    {DEGREES.map(deg => (
                        <button
                            key={deg}
                            onClick={() => updateData({ targetDegree: deg })}
                            className={`px-4 py-3 rounded-xl border-2 font-medium transition-all ${data.targetDegree === deg
                                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                    : 'border-gray-100 hover:border-gray-300 text-gray-600'
                                }`}
                        >
                            {deg}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-800 mb-3">Interests (Select Multiple)</label>
                <div className="flex flex-wrap gap-3">
                    {COLLEGE_TYPES.map(type => (
                        <button
                            key={type}
                            onClick={() => toggleType(type)}
                            className={`px-5 py-2.5 rounded-full border text-sm font-medium transition-all ${data.aspiringCollegeType.includes(type)
                                    ? 'border-indigo-600 bg-indigo-600 text-white shadow-md'
                                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
