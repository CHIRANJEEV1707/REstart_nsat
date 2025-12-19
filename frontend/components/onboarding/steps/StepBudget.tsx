"use client";
import React, { useEffect, useState } from 'react';
import { OnboardingData } from '../OnboardingWizard';

interface StepProps {
    data: OnboardingData;
    updateData: (data: Partial<OnboardingData>) => void;
}

const COUNTRY_BUDGET_CONFIG: Record<string, { currency: string, symbol: string, min: number, max: number, rateToUSD: number }> = {
    'India': { currency: "INR", symbol: "₹", min: 50000, max: 2000000, rateToUSD: 0.012 }, // 1 INR = 0.012 USD approx
    'USA': { currency: "USD", symbol: "$", min: 10000, max: 80000, rateToUSD: 1 },
    'UK': { currency: "GBP", symbol: "£", min: 8000, max: 60000, rateToUSD: 1.27 },
    'Germany': { currency: "EUR", symbol: "€", min: 0, max: 20000, rateToUSD: 1.09 },
    'Canada': { currency: "CAD", symbol: "C$", min: 15000, max: 50000, rateToUSD: 0.74 },
    'Australia': { currency: "AUD", symbol: "A$", min: 15000, max: 50000, rateToUSD: 0.66 },
    'Singapore': { currency: "SGD", symbol: "S$", min: 20000, max: 60000, rateToUSD: 0.75 },
    'Ireland': { currency: "EUR", symbol: "€", min: 10000, max: 40000, rateToUSD: 1.09 },
};

export function StepBudget({ data, updateData }: StepProps) {
    const [displayCurrency, setDisplayCurrency] = useState("INR");
    const [displaySymbol, setDisplaySymbol] = useState("₹");
    const [rate, setRate] = useState(0.012);

    // Determine currency logic on mount
    useEffect(() => {
        const countries = data.preferredCountries;
        if (countries.length === 1) {
            const country = countries[0];
            const config = COUNTRY_BUDGET_CONFIG[country];
            if (config) {
                setDisplayCurrency(config.currency);
                setDisplaySymbol(config.symbol);
                setRate(config.rateToUSD);
            }
        } else {
            // Multiple or none -> INR default for Indian platform
            setDisplayCurrency("INR");
            setDisplaySymbol("₹");
            setRate(0.012);
        }
    }, [data.preferredCountries]);

    // Local state for input (in displayed currency)
    const [localMin, setLocalMin] = useState(data.budgetUSD.min > 0 ? Math.round(data.budgetUSD.min / rate) : 0);
    const [localMax, setLocalMax] = useState(data.budgetUSD.max > 0 ? Math.round(data.budgetUSD.max / rate) : 0);

    // Update global state when local changes
    useEffect(() => {
        const usdMin = Math.round(localMin * rate);
        const usdMax = Math.round(localMax * rate);
        updateData({ budgetUSD: { min: usdMin, max: usdMax } });
    }, [localMin, localMax, rate]);

    return (
        <div className="space-y-8 animate-in slide-in-from-right fade-in duration-300">
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Budget</h2>
                    <p className="text-gray-600">
                        What is your annual budget range?
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                        Please estimate in {displayCurrency} ({displaySymbol})
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            MINIMUM ({displaySymbol} {displayCurrency})
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{displaySymbol}</span>
                            <input
                                type="number"
                                min="0"
                                step={displayCurrency === "INR" ? "10000" : "1000"}
                                placeholder={displayCurrency === "INR" ? "e.g., 100000" : "e.g., 10000"}
                                value={localMin === 0 ? '' : localMin}
                                onChange={(e) => setLocalMin(parseInt(e.target.value) || 0)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            MAXIMUM ({displaySymbol} {displayCurrency})
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{displaySymbol}</span>
                            <input
                                type="number"
                                min="0"
                                step={displayCurrency === "INR" ? "10000" : "1000"}
                                placeholder={displayCurrency === "INR" ? "e.g., 500000" : "e.g., 50000"}
                                value={localMax === 0 ? '' : localMax}
                                onChange={(e) => setLocalMax(parseInt(e.target.value) || 0)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex gap-3">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <p className="text-sm text-blue-800">
                            We will automatically convert this to standardized currency to find matching colleges across all your selected destinations.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
