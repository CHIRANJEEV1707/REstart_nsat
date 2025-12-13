"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { StepCountries } from './steps/StepCountries';
import { StepBudget } from './steps/StepBudget';
import { StepAcademic } from './steps/StepAcademic';
import { StepExams } from './steps/StepExams';
import { StepExamSelection } from './steps/StepExamSelection';
import { StepReview } from './steps/StepReview';
import { StepNewGenInterest } from './steps/StepNewGenInterest';
import { Check, ChevronRight } from 'lucide-react';

export type OnboardingData = {
    city: string;
    state: string;
    country: string;
    targetDegree: string;
    aspiringCollegeType: string[];
    preferredCountries: string[];
    budgetUSD: { min: number; max: number };
    interestedExams: string[];
    examScores: { exam: string; score: string }[];
    newGenInterest: boolean;
};

const INITIAL_DATA: OnboardingData = {
    city: '',
    state: '',
    country: 'India',
    targetDegree: '',
    aspiringCollegeType: [],
    preferredCountries: [],
    budgetUSD: { min: 0, max: 50000 },
    interestedExams: [],
    examScores: [],
    newGenInterest: false
};

const STEPS = [
    { title: 'New-Gen Colleges', component: StepNewGenInterest },
    { title: 'Study Destination', component: StepCountries },
    { title: 'Budget', component: StepBudget },
    { title: 'Academics', component: StepAcademic },
    { title: 'Select Exams', component: StepExamSelection },
    { title: 'Exam Scores', component: StepExams },
    { title: 'Review', component: StepReview }
];

export function OnboardingWizard() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [data, setData] = useState<OnboardingData>(INITIAL_DATA);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const updateData = (newData: Partial<OnboardingData>) => {
        setData(prev => ({ ...prev, ...newData }));
    };

    const nextStep = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            // Save Step 3 (College Preferences)
            await api.post('/user/onboarding', {
                step: 3,
                data: data
            });
            router.push('/dashboard');
        } catch (error) {
            console.error('Onboarding failed:', error);
            alert('Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const CurrentComponent = STEPS[currentStep].component;

    return (
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-300">
            {/* Progress Bar */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Step {currentStep + 1} of {STEPS.length}</span>
                    <h2 className="text-xl font-bold text-gray-900">{STEPS[currentStep].title}</h2>
                </div>
                <div className="hidden sm:flex space-x-1">
                    {STEPS.map((_, idx) => (
                        <div key={idx} className={`h-2 w-8 rounded-full transition-colors ${idx <= currentStep ? 'bg-indigo-600' : 'bg-gray-200'}`} />
                    ))}
                </div>
            </div>

            {/* Step Content */}
            <div className="p-8 min-h-[400px]">
                <CurrentComponent data={data} updateData={updateData} />
            </div>

            {/* Navigation */}
            <div className="bg-gray-50 px-8 py-5 flex justify-between items-center border-t border-gray-100">
                <button
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className={`px-6 py-2 rounded-xl font-medium text-gray-600 hover:bg-gray-200 transition-colors ${currentStep === 0 ? 'opacity-0 pointer-events-none' : ''}`}
                >
                    Back
                </button>

                {currentStep === STEPS.length - 1 ? (
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg flex items-center space-x-2 transition-all"
                    >
                        {isSubmitting ? 'Saving...' : <><span>Complete Setup</span><Check className="w-5 h-5" /></>}
                    </button>
                ) : (
                    <button
                        onClick={nextStep}
                        className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg flex items-center space-x-2 transition-all"
                    >
                        <span>Next</span>
                        <ChevronRight className="w-5 h-5" />
                    </button>
                )}
            </div>
        </div>
    );
}
