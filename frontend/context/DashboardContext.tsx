"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useSavedColleges } from '@/hooks/useSavedColleges';

interface DashboardContextType {
    // Saved Colleges
    savedColleges: string[];
    toggleSaveCollege: (id: string, type?: string) => void;

    // Navigation Helpers
    openCollegeDetails: (id: string) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const { savedColleges: savedList, isSaved, saveCollege, removeCollege } = useSavedColleges();

    const openCollegeDetails = (id: string) => {
        router.push(`/college/${id}`);
    };

    const savedColleges = savedList.map((c: any) => c._id || c.collegeId);

    const toggleSaveCollege = (id: string, type: string = 'indian') => {
        if (isSaved(id)) {
            removeCollege({ id, type });
        } else {
            saveCollege({ id, type });
        }
    };

    return (
        <DashboardContext.Provider value={{
            savedColleges,
            toggleSaveCollege,
            openCollegeDetails
        }}>
            {children}
        </DashboardContext.Provider>
    );
}

export function useDashboard() {
    const context = useContext(DashboardContext);
    if (context === undefined) {
        throw new Error("useDashboard must be used within a DashboardProvider");
    }
    return context;
}
