import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';

interface RankResponse {
    rank: number;
    total: number;
    category: string;
}

export function useCollegeRank(id: string) {
    return useQuery<RankResponse>({
        queryKey: ['college-rank', id],
        queryFn: async () => {
            // Avoid fetching if ID is invalid or during hydration mismatch 
            if (!id) return null;
            const res = await api.get(`/colleges/${id}/rank`);
            return res.data.data;
        },
        enabled: !!id,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}
