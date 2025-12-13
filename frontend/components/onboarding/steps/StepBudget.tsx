"use client";
import React, { useEffect, useState } from 'react';
import { OnboardingData } from '../OnboardingWizard';

interface StepProps {
    data: OnboardingData;
    updateData: (data: Partial<OnboardingData>) => void;
}

const COUNTRY_BUDGET_CONFIG: Record<string, { currency: string, min: number, max: number, rateToUSD: number }> = {
    'India': { currency: "₹", min: 50000, max: 2000000, rateToUSD: 0.012 }, // 1 INR = 0.012 USD approx
    'USA': { currency: "$", min: 10000, max: 80000, rateToUSD: 1 },
    'UK': { currency: "£", min: 8000, max: 60000, rateToUSD: 1.27 },
    'Germany': { currency: "€", min: 0, max: 20000, rateToUSD: 1.09 },
    'Canada': { currency: "C$", min: 15000, max: 50000, rateToUSD: 0.74 },
    'Australia': { currency: "A$", min: 15000, max: 50000, rateToUSD: 0.66 },
    'Singapore': { currency: "S$", min: 20000, max: 60000, rateToUSD: 0.75 },
    'Ireland': { currency: "€", min: 10000, max: 40000, rateToUSD: 1.09 },
};

export function StepBudget({ data, updateData }: StepProps) {
    const [displayCurrency, setDisplayCurrency] = useState("$");
    const [rate, setRate] = useState(1);

    // Determine currency logic on mount
    useEffect(() => {
        const countries = data.preferredCountries;
        if (countries.length === 1) {
            const country = countries[0];
            const config = COUNTRY_BUDGET_CONFIG[country];
            if (config) {
                setDisplayCurrency(config.currency);
                setRate(config.rateToUSD);
            }
        } else {
            // Multiple or none -> USD default
            setDisplayCurrency("$ (USD)");
            setRate(1);
        }
    }, [data.preferredCountries]);

    // Local state for input (in displayed currency)
    // We store USD in global state, so we convert back and forth
    const [localMin, setLocalMin] = useState(data.budgetUSD.min > 0 ? Math.round(data.budgetUSD.min / rate) : 0);
    const [localMax, setLocalMax] = useState(data.budgetUSD.max > 0 ? Math.round(data.budgetUSD.max / rate) : 50000);

    // Update global state when local changes
    useEffect(() => {
        const usdMin = Math.round(localMin * rate);
        const usdMax = Math.round(localMax * rate);
        updateData({ budgetUSD: { min: usdMin, max: usdMax } });
    }, [localMin, localMax, rate]); // Dependency updateData removed to avoid loop if stable

    return (
        <div className="space-y-8 animate-in slide-in-from-right fade-in duration-300">
            <div className="text-center pb-6">
                <h3 className="text-lg font-medium text-gray-900">What is your annual budget range?</h3>
                <p className="text-sm text-gray-500 mt-1">
                    {data.preferredCountries.length > 1
                        ? "Since you selected multiple countries, please estimate in USD or equivalent value."
                        : "This helps us filter colleges within your financial reach."}
                </p>
            </div>

            <div className="space-y-6">
                {/* Min/Max Inputs */}
                <div className="grid grid-cols-2 gap-8">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Minimum ({displayCurrency})</label>
                        <div className="relative">
                            <span className="absolute left-4 top-3.5 text-gray-400 font-medium">{displayCurrency[0]}</span>
                            <input
                                type="number"
                                value={localMin}
                                onChange={(e) => setLocalMin(parseInt(e.target.value) || 0)}
                                className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Maximum ({displayCurrency})</label>
                        <div className="relative">
                            <span className="absolute left-4 top-3.5 text-gray-400 font-medium">{displayCurrency[0]}</span>
                            <input
                                type="number"
                                value={localMax}
                                onChange={(e) => setLocalMax(parseInt(e.target.value) || 0)}
                                className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Info */}
                <div className="bg-blue-50 p-4 rounded-xl flex items-start gap-3">
                    <div className="text-blue-600 mt-0.5">ℹ️</div>
                    <div className="text-sm text-blue-800">
                        We will automatically convert this to standardized currency to find matching colleges across all your selected destinations.
                    </div>
                </div>
            </div>
        </div>
    );
}
