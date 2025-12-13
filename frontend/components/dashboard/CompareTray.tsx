"use strict";
import React from 'react';
import { useCompare } from '@/context/CompareContext';
import { useDashboard } from '@/context/DashboardContext';
import { X, ArrowRight, Layers } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function CompareTray() {
    const { compareItems, removeFromCompare, clearCompare } = useCompare();
    const { setActiveView } = useDashboard();

    // Only show if 2 or more items are in the basket
    if (compareItems.length < 2) return null;

    return (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-3xl bg-white border border-gray-200 shadow-2xl rounded-2xl p-4 animate-in slide-in-from-bottom-10 fade-in duration-300">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 overflow-x-auto min-w-0">
                    <div className="flex items-center gap-2 mr-2">
                        <div className="bg-indigo-100 p-2 rounded-lg">
                            <Layers className="text-indigo-600" size={20} />
                        </div>
                        <div className="hidden sm:block">
                            <p className="text-sm font-bold text-gray-900">Compare</p>
                            <p className="text-xs text-gray-500">{compareItems.length} Colleges</p>
                        </div>
                    </div>

                    <div className="h-8 w-px bg-gray-200 mx-2 hidden sm:block"></div>

                    <div className="flex gap-2">
                        {compareItems.map((item) => (
                            <div key={item.collegeId} className="relative group flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg pr-2 pl-2 py-1.5 transition-all hover:bg-gray-100">
                                {/* Shortened name logic */}
                                <span className="text-xs font-semibold text-gray-700 whitespace-nowrap max-w-[100px] truncate">
                                    {item.name}
                                </span>
                                <button
                                    onClick={() => removeFromCompare(item.collegeId)}
                                    className="text-gray-400 hover:text-red-500 rounded-full transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                    <button
                        onClick={clearCompare}
                        className="text-xs text-gray-500 hover:text-gray-900 underline decoration-gray-300 hover:decoration-gray-900 underline-offset-2 transition-all hidden sm:block"
                    >
                        Clear All
                    </button>
                    <Button
                        onClick={() => setActiveView('compare')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-4 py-2 h-auto rounded-lg shadow-lg hover:shadow-indigo-500/25 transition-all"
                    >
                        Compare Now <ArrowRight size={14} className="ml-2" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
