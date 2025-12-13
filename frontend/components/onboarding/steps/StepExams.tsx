"use client";
import React from 'react';
import { OnboardingData } from '../OnboardingWizard';

interface StepProps {
    data: OnboardingData;
    updateData: (data: Partial<OnboardingData>) => void;
}

export function StepExams({ data, updateData }: StepProps) {
    const selectedExams = data.interestedExams || [];

    const updateScore = (exam: string, score: string) => {
        const currentScores = [...data.examScores];
        const existingIndex = currentScores.findIndex(s => s.exam === exam);

        if (existingIndex >= 0) {
            currentScores[existingIndex] = { exam, score };
        } else {
            currentScores.push({ exam, score });
        }

        updateData({ examScores: currentScores });
    };

    const getScoreValue = (exam: string) => {
        return data.examScores.find(s => s.exam === exam)?.score || '';
    };

    if (selectedExams.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <p className="text-gray-500 font-medium text-lg">No exams selected.</p>
                <p className="text-gray-400 text-sm mt-2">You can skip this step or go back to select exams.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in slide-in-from-right fade-in duration-300">
            <div>
                <h3 className="text-lg font-medium text-gray-900">Enter your scores</h3>
                <p className="text-sm text-gray-500 mt-1">Leave blank if you are yet to receive results.</p>
            </div>

            <div className="space-y-4">
                {selectedExams.map((exam) => (
                    <div key={exam} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                        <div className="w-full sm:w-1/3">
                            <label className="block text-sm font-bold text-gray-900">{exam}</label>
                        </div>
                        <div className="flex-1 w-full">
                            <input
                                type="text"
                                value={getScoreValue(exam)}
                                onChange={(e) => updateScore(exam, e.target.value)}
                                placeholder={`Enter ${exam} Score / Rank / %ile`}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
