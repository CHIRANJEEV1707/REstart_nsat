"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface College {
    _id: string;
    name: string;
    type: 'indian' | 'international';
    logo?: string;
}

interface ComparisonContextType {
    selectedColleges: College[];
    addToCompare: (college: College) => void;
    removeFromCompare: (id: string) => void;
    isInCompare: (id: string) => boolean;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

export function ComparisonProvider({ children }: { children: ReactNode }) {
    const [selectedColleges, setSelectedColleges] = useState<College[]>([]);

    // Load from local storage
    useEffect(() => {
        const saved = localStorage.getItem('compare_list_v2'); // New key to avoid conflicts with old format
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Deduplicate based on _id
                const unique = parsed.filter((college: College, index: number, self: College[]) =>
                    index === self.findIndex((t) => t._id === college._id)
                );
                setSelectedColleges(unique);
            } catch (e) {
                console.error("Failed to parse compare list", e);
            }
        }
    }, []);

    // Save to local storage
    useEffect(() => {
        localStorage.setItem('compare_list_v2', JSON.stringify(selectedColleges));
    }, [selectedColleges]);

    const addToCompare = (college: College) => {
        if (selectedColleges.length >= 3) {
            // Using logic to prevent adding more than 3
            // In a real app we might show a toast here.
            return;
        }
        if (!selectedColleges.some(c => c._id === college._id)) {
            setSelectedColleges([...selectedColleges, college]);
        }
    };

    const removeFromCompare = (id: string) => {
        setSelectedColleges(selectedColleges.filter(c => c._id !== id));
    };

    const isInCompare = (id: string) => selectedColleges.some(c => c._id === id);

    return (
        <ComparisonContext.Provider value={{ selectedColleges, addToCompare, removeFromCompare, isInCompare }}>
            {children}
        </ComparisonContext.Provider>
    );
}

export function useComparison() {
    const context = useContext(ComparisonContext);
    if (context === undefined) {
        throw new Error('useComparison must be used within a ComparisonProvider');
    }
    return context;
}
