"use client";
import React from 'react';
import { OnboardingData } from '../OnboardingWizard';
import { Check } from 'lucide-react';

interface StepProps {
    data: OnboardingData;
    updateData: (data: Partial<OnboardingData>) => void;
}

const COUNTRIES = [
    { code: 'IN', name: 'India', flag: '🇮🇳' },
    { code: 'US', name: 'USA', flag: '🇺🇸' },
    { code: 'UK', name: 'UK', flag: '🇬🇧' },
    { code: 'CA', name: 'Canada', flag: '🇨🇦' },
    { code: 'AU', name: 'Australia', flag: '🇦🇺' },
    { code: 'DE', name: 'Germany', flag: '🇩🇪' },
    { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
    { code: 'IE', name: 'Ireland', flag: '🇮🇪' },
];

export function StepCountries({ data, updateData }: StepProps) {

    const toggleCountry = (name: string) => {
        const current = data.preferredCountries;
        if (current.includes(name)) {
            updateData({ preferredCountries: current.filter(c => c !== name) });
        } else {
            updateData({ preferredCountries: [...current, name] });
        }
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-right fade-in duration-300">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Where do you want to study?</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {COUNTRIES.map((country) => {
                    const isSelected = data.preferredCountries.includes(country.name);
                    return (
                        <button
                            key={country.name}
                            onClick={() => toggleCountry(country.name)}
                            className={`group relative p-4 rounded-xl border-2 text-left transition-all ${isSelected
                                    ? 'border-indigo-600 bg-indigo-50/50'
                                    : 'border-gray-100 hover:border-gray-300 bg-white'
                                }`}
                        >
                            <div className="text-3xl mb-3">{country.flag}</div>
                            <div className={`font-semibold ${isSelected ? 'text-indigo-900' : 'text-gray-700'}`}>
                                {country.name}
                            </div>

                            {/* Checkmark */}
                            <div className={`absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center transition-all ${isSelected ? 'bg-indigo-600 opacity-100 scale-100' : 'bg-transparent opacity-0 scale-75'
                                }`}>
                                <Check className="w-3 h-3 text-white" />
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
