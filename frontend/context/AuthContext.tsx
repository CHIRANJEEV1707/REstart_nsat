"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';

interface User {
    [key: string]: any;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    logout: () => void;
    refetchUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const queryClient = useQueryClient();

    const { data: user, isLoading, refetch } = useQuery({
        queryKey: ['auth-user'],
        queryFn: async () => {
            try {
                const res = await api.get('/auth/me');
                return res.data.data;
            } catch (err) {
                return null;
            }
        },
        retry: false,
        refetchOnWindowFocus: false, // CRITICAL: Stop refetching on window focus
        staleTime: Infinity,         // CRITICAL: Keep data fresh forever until explicit invalidation
    });

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error("Logout error", error);
        } finally {
            // For now just clear query cache
            queryClient.setQueryData(['auth-user'], null);
            // Or invalidate
            // queryClient.invalidateQueries({ queryKey: ['auth-user'] });
        }
    };

    return (
        <AuthContext.Provider value={{
            user: user || null,
            isLoading,
            isAuthenticated: !!user,
            logout,
            refetchUser: refetch
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
