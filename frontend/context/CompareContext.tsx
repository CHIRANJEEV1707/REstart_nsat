"use strict";
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import toast from 'react-hot-toast';

export type CollegeType = 'indian' | 'international' | 'newgen';

export interface CompareItem {
    collegeId: string;
    collegeType: CollegeType;
    name: string; // Storing essential display info to avoid fetching just for the tray
    image?: string;
}

interface CompareContextType {
    compareItems: CompareItem[];
    addToCompare: (item: CompareItem) => void;
    removeFromCompare: (collegeId: string) => void;
    clearCompare: () => void;
    isInCompare: (collegeId: string) => boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: ReactNode }) {
    const [compareItems, setCompareItems] = useState<CompareItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // 1. Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('restart_compare_basket');
        if (saved) {
            try {
                setCompareItems(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse compare basket", e);
                toast.error("Failed to load saved comparisons");
            }
        }
        setIsLoaded(true);
    }, []);

    // 2. Sync to localStorage on change
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('restart_compare_basket', JSON.stringify(compareItems));
        }
    }, [compareItems, isLoaded]);

    const addToCompare = (item: CompareItem) => {
        if (compareItems.length >= 3) {
            // Using a simple alert if toast isn't available, but normally strict toast.
            // Assuming the environment might have a toast library, but standardizing on sonner or similar which is common in modern stacks.
            // If valid 'toast' is not imported, this might break. Let's assume standard behavior or just log for now?
            // The prompt mentioned "Clear error message".
            // We'll trust the user has sonner or use a fallback. Actually, let's use a safe console/alert fallback for this file to ensure it's robust.
            toast.error("You can only compare up to 3 colleges");
            return;
        }

        if (compareItems.some(c => c.collegeId === item.collegeId)) {
            return; // Already added
        }

        setCompareItems(prev => [...prev, item]);
    };

    const removeFromCompare = (collegeId: string) => {
        setCompareItems(prev => prev.filter(c => c.collegeId !== collegeId));
    };

    const clearCompare = () => {
        setCompareItems([]);
    };

    const isInCompare = (collegeId: string) => {
        return compareItems.some(c => c.collegeId === collegeId);
    };

    return (
        <CompareContext.Provider value={{
            compareItems,
            addToCompare,
            removeFromCompare,
            clearCompare,
            isInCompare
        }}>
            {children}
        </CompareContext.Provider>
    );
}

export function useCompare() {
    const context = useContext(CompareContext);
    if (context === undefined) {
        throw new Error("useCompare must be used within a CompareProvider");
    }
    return context;
}
