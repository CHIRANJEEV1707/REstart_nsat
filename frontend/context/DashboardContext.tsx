"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';

// Define the available views in the dashboard
export type DashboardView =
    | "overview"
    | "discover-indian"      // Replaces 'discover'
    | "discover-international" // Explicit view for International tab
    | "discover-newgen"      // Explicit view for New-Gen tab
    | "college-details"
    | "saved"
    | "compare"
    | "deadlines"
    | "international" // Keeping for backward compatibility if needed, but likely replaced by discover-international
    | "international-country"
    | "exams"
    | "exam-details"
    | "profile";

interface SelectedCollege {
    id: string;
    type: 'indian' | 'international' | 'newgen';
}

interface DashboardContextType {
    activeView: DashboardView;
    setActiveView: (view: DashboardView) => void;
    selectedCollege: SelectedCollege | null;
    setSelectedCollege: (college: SelectedCollege | null) => void;
    // Saved Colleges
    savedColleges: string[];
    toggleSaveCollege: (id: string, type?: string) => void;
    // New navigation helpers
    previousView: DashboardView;
    openCollegeDetails: (id: string, type?: 'indian' | 'international' | 'newgen') => void;
    goBack: () => void;
    // International View State
    selectedInternationalCountry: string | null;
    openInternationalCountry: (country: string) => void;
    // Exam View State
    selectedExamId: string | null;
    openExamDetails: (id: string) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
    const queryClient = useQueryClient();
    const [activeView, setActiveView] = useState<DashboardView>("overview");
    const [previousView, setPreviousView] = useState<DashboardView>("overview");
    const [selectedCollege, setSelectedCollege] = useState<SelectedCollege | null>(null);
    const [selectedInternationalCountry, setSelectedInternationalCountry] = useState<string | null>(null);
    const [selectedExamId, setSelectedExamId] = useState<string | null>(null);

    const openCollegeDetails = (id: string, type: 'indian' | 'international' | 'newgen' = 'indian') => {
        setPreviousView(activeView);
        setSelectedCollege({ id, type });
        setActiveView("college-details");
    };

    const openInternationalCountry = (country: string) => {
        setPreviousView(activeView);
        setSelectedInternationalCountry(country);
        setActiveView("international-country");
    };

    const openExamDetails = (id: string) => {
        setPreviousView(activeView);
        setSelectedExamId(id);
        setActiveView("exam-details");
    };

    // --- Saved Colleges Logic ---
    const { data: savedResponse } = useQuery({
        queryKey: ['saved-colleges'],
        queryFn: async () => {
            const res = await api.get('/saved');
            return res.data;
        }
    });

    const savedColleges = savedResponse?.data?.map((c: any) => c.collegeId || c._id) || [];

    const saveMutation = useMutation({
        mutationFn: async ({ id, type }: { id: string; type: string }) => {
            const isSaved = savedColleges.includes(id);
            if (isSaved) {
                await api.delete(`/saved/${id}?type=${type}`);
            } else {
                await api.post('/saved', {
                    collegeId: id,
                    collegeType: type
                });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['saved-colleges'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            // Also invalidate individual college details if needed, though they might not depend on this directly
            queryClient.invalidateQueries({ queryKey: ['college-details'] });
        }
    });

    const toggleSaveCollege = (id: string, type: string = 'indian') => {
        saveMutation.mutate({ id, type });
    };

    const goBack = () => {
        // Smart Back Logic
        if (activeView === 'college-details') {
            // If we came from country list, go back there
            if (selectedCollege?.type === 'international' && selectedInternationalCountry) {
                setActiveView('international-country');
                setSelectedCollege(null);
                return;
            }
            // Return to specific tab based on college type
            if (selectedCollege?.type === 'indian') {
                setActiveView('discover-indian');
                setSelectedCollege(null);
                return;
            }
            if (selectedCollege?.type === 'international') {
                setActiveView('discover-international');
                setSelectedCollege(null);
                return;
            }
            if (selectedCollege?.type === 'newgen') {
                setActiveView('discover-newgen');
                setSelectedCollege(null);
                return;
            }
        }

        if (activeView === 'international-country') {
            setActiveView('discover-international'); // Updated to new view name
            setSelectedInternationalCountry(null);
            return;
        }

        if (activeView === 'exam-details') {
            // Default back to deadlines if previous view was valid, else deadlines
            const target = previousView === 'deadlines' ? 'deadlines' : 'deadlines';
            setActiveView(target);
            setSelectedExamId(null);
            return;
        }

        setActiveView(previousView);
        setSelectedCollege(null);
        setSelectedExamId(null);
    };

    return (
        <DashboardContext.Provider value={{
            activeView,
            setActiveView,
            selectedCollege,
            setSelectedCollege,
            savedColleges,
            toggleSaveCollege,
            previousView,
            openCollegeDetails,
            goBack,
            selectedInternationalCountry,
            openInternationalCountry,
            selectedExamId,
            openExamDetails
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
