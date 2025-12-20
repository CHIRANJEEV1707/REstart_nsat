"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';

interface DashboardContextType {
    // Saved Colleges
    savedColleges: string[];
    toggleSaveCollege: (id: string, type?: string) => void;

    // Navigation Helpers (Optional, can be used if needed but simpler to use generic router)
    openCollegeDetails: (id: string) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
    const queryClient = useQueryClient();
    const router = useRouter();

    const openCollegeDetails = (id: string) => {
        router.push(`/college/${id}`);
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
        }
    });

    const toggleSaveCollege = (id: string, type: string = 'indian') => {
        saveMutation.mutate({ id, type });
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
