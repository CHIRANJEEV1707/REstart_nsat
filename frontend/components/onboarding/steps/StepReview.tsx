"use client";
import React from 'react';
import { OnboardingData } from '../OnboardingWizard';

interface StepProps {
    data: OnboardingData;
    updateData: (data: Partial<OnboardingData>) => void;
}

export function StepReview({ data }: StepProps) {
    return (
        <div className="space-y-6 animate-in slide-in-from-right fade-in duration-300">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Review your Profile</h3>

            <div className="bg-gray-50 rounded-xl p-6 space-y-6">
                <Section title="Academic Goals">
                    <div className="flex flex-wrap gap-2">
                        <span className="font-semibold">{data.targetDegree}</span>
                        <span className="text-gray-400">|</span>
                        {data.aspiringCollegeType.length > 0 ? data.aspiringCollegeType.join(", ") : "No interests selected"}
                    </div>
                </Section>

                <Section title="Budget (Approx. USD)">
                    ${data.budgetUSD.min.toLocaleString()} - ${data.budgetUSD.max.toLocaleString()}
                </Section>

                <Section title="Preferred Countries">
                    {data.preferredCountries.length > 0 ? data.preferredCountries.join(", ") : "None selected"}
                </Section>

                <Section title="Interested Exams">
                    {data.interestedExams && data.interestedExams.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mb-2">
                            {data.interestedExams.map(ex => (
                                <span key={ex} className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-md font-medium">{ex}</span>
                            ))}
                        </div>
                    ) : "None selected"}
                </Section>

                <Section title="Exam Scores">
                    {data.examScores.length > 0 ? (
                        <div className="grid grid-cols-1 gap-2">
                            {data.examScores.map((es, idx) => (
                                <div key={idx} className="flex justify-between text-sm bg-white p-2 rounded border border-gray-100">
                                    <span className="font-medium text-gray-700">{es.exam}</span>
                                    <span className="font-bold text-indigo-600">{es.score}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <span className="text-gray-500 italic">No scores entered</span>
                    )}
                </Section>
            </div>

            <p className="text-sm text-gray-500 text-center">
                By clicking "Complete Setup", you confirm that these details are correct. You can edit them later in your profile.
            </p>
        </div>
    );
}

function Section({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <div className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">{title}</h4>
            <div className="text-gray-900 font-medium">
                {children}
            </div>
        </div>
    );
}
