"use client";
import React, { useMemo } from 'react';
import { OnboardingData } from '../OnboardingWizard';
import { CheckCircle2, Circle } from 'lucide-react';

interface StepProps {
    data: OnboardingData;
    updateData: (data: Partial<OnboardingData>) => void;
}

// Map countries to relevant exams
const EXAMS_BY_COUNTRY: Record<string, string[]> = {
    'India': [
        "JEE Main", "JEE Advanced", "BITSAT", "VITEEE", "COMEDK",
        "WBJEE", "MHTCET", "NSAT", "IISER Aptitude Test", "NEST"
    ],
    'USA': ["SAT", "ACT", "TOEFL", "IELTS", "APs"],
    'UK': ["IELTS", "SAT"],
    'Canada': ["IELTS", "SAT"],
    'Germany': ["IELTS", "TestDaF"],
    'Australia': ["IELTS", "PTE"],
    'Singapore': ["SAT", "IELTS"],
    'Ireland': ["IELTS"]
};

export function StepExamSelection({ data, updateData }: StepProps) {

    // Compute relevant exams based on selected countries
    const relevantExams = useMemo(() => {
        const countries = data.preferredCountries.length > 0 ? data.preferredCountries : ['India']; // Default to India if none
        const examSet = new Set<string>();

        countries.forEach(country => {
            const countryExams = EXAMS_BY_COUNTRY[country] || ["SAT", "IELTS"];
            countryExams.forEach(ex => examSet.add(ex));
        });

        // Always show NSAT if New-Gen interest is there, or just always for India (added above)
        if (data.newGenInterest) {
            examSet.add("NSAT");
        }

        return Array.from(examSet).sort();
    }, [data.preferredCountries, data.newGenInterest]);

    const toggleExam = (exam: string) => {
        const current = data.interestedExams || [];
        if (current.includes(exam)) {
            updateData({ interestedExams: current.filter(e => e !== exam) });
        } else {
            updateData({ interestedExams: [...current, exam] });
        }
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-right fade-in duration-300">
            <div>
                <h3 className="text-lg font-medium text-gray-900">Which exams have you taken or plan to take?</h3>
                <p className="text-sm text-gray-500 mt-1">We only show exams relevant to your selected destinations.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {relevantExams.map(exam => {
                    const isSelected = data.interestedExams?.includes(exam);
                    const isRecommended = data.newGenInterest && (exam === 'NSAT' || exam === 'JEE Main');

                    return (
                        <button
                            key={exam}
                            onClick={() => toggleExam(exam)}
                            className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all ${isSelected
                                ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-sm'
                                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <div className="flex flex-col">
                                <span className="font-medium">{exam}</span>
                                {isRecommended && <span className="text-xs text-indigo-600 font-bold">Recommended</span>}
                            </div>

                            {isSelected ? (
                                <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                            ) : (
                                <Circle className="w-5 h-5 text-gray-300" />
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="text-center pt-4">
                <button
                    onClick={() => updateData({ interestedExams: [] })}
                    className="text-sm text-gray-400 underline hover:text-gray-600"
                >
                    I haven't taken any exams yet
                </button>
            </div>
        </div>
    );
}
