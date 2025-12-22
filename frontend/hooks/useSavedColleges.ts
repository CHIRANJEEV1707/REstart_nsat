import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { toast } from 'sonner';

interface SavedCollege {
    _id: string;
    collegeId?: string;
    type: 'indian' | 'international' | 'newgen';
    // Add other minimal fields if needed for UI cache
}

export const useSavedColleges = () => {
    const queryClient = useQueryClient();

    // Fetch saved colleges
    const { data: savedCollegesResponse, isLoading, error } = useQuery({
        queryKey: ['saved-colleges'],
        queryFn: async () => {
            const res = await api.get('/saved', {
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                }
            });
            return res.data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnMount: true,
        refetchOnWindowFocus: true,
    });

    const savedList = savedCollegesResponse?.data || [];

    // Helper to check if a college is saved
    const isSaved = (collegeId: string) => {
        return savedList.some((c: any) => c._id === collegeId || c.collegeId === collegeId);
    };

    // Save Mutation
    const saveMutation = useMutation({
        mutationFn: async ({ id, type }: { id: string, type: string }) => {
            await api.post(`/saved`, { collegeId: id, collegeType: type });
        },
        onMutate: async ({ id, type }) => {
            await queryClient.cancelQueries({ queryKey: ['saved-colleges'] });

            const previousSaved = queryClient.getQueryData(['saved-colleges']);

            // Optimistically update
            queryClient.setQueryData(['saved-colleges'], (old: any) => {
                const oldData = old?.data || [];
                // Mock the new saved item
                const newSavedItem = { _id: id, collegeId: id, type };
                return {
                    ...old,
                    data: [...oldData, newSavedItem]
                };
            });

            return { previousSaved };
        },
        onError: (err, newTodo, context) => {
            queryClient.setQueryData(['saved-colleges'], context?.previousSaved);
            toast.error('Failed to save college');
        },
        onSuccess: () => {
            toast.success('College saved successfully');
            queryClient.invalidateQueries({ queryKey: ['saved-colleges'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });

    // Remove Mutation
    const removeMutation = useMutation({
        mutationFn: async ({ id, type }: { id: string, type: string }) => {
            await api.delete(`/saved/${id}?type=${type}`);
        },
        onMutate: async ({ id }) => {
            await queryClient.cancelQueries({ queryKey: ['saved-colleges'] });

            const previousSaved = queryClient.getQueryData(['saved-colleges']);

            queryClient.setQueryData(['saved-colleges'], (old: any) => {
                const oldData = old?.data || [];
                return {
                    ...old,
                    data: oldData.filter((c: any) => c._id !== id && c.collegeId !== id)
                };
            });

            return { previousSaved };
        },
        onError: (err, newTodo, context) => {
            queryClient.setQueryData(['saved-colleges'], context?.previousSaved);
            toast.error('Failed to remove college');
        },
        onSuccess: () => {
            toast.success('College removed from saved list');
            queryClient.invalidateQueries({ queryKey: ['saved-colleges'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });

    return {
        savedColleges: savedList,
        isLoading,
        isSaved,
        saveCollege: saveMutation.mutate,
        removeCollege: removeMutation.mutate,
        isSaving: saveMutation.isPending,
        isRemoving: removeMutation.isPending
    };
};
