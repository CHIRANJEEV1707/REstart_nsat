"use client";
import React from 'react';
import { OnboardingData } from '../OnboardingWizard';

interface StepProps {
    data: OnboardingData;
    updateData: (data: Partial<OnboardingData>) => void;
}

export function StepLocation({ data, updateData }: StepProps) {
    return (
        <div className="space-y-6 animate-in slide-in-from-right fade-in duration-300">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <select
                    value={data.country}
                    onChange={(e) => updateData({ country: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                >
                    <option value="India">India</option>
                    <option value="USA">USA</option>
                    <option value="UK">UK</option>
                    <option value="Canada">Canada</option>
                </select>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <input
                        type="text"
                        value={data.state}
                        onChange={(e) => updateData({ state: e.target.value })}
                        placeholder="e.g. Maharashtra"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                        type="text"
                        value={data.city}
                        onChange={(e) => updateData({ city: e.target.value })}
                        placeholder="e.g. Mumbai"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                    />
                </div>
            </div>
        </div>
    );
}
