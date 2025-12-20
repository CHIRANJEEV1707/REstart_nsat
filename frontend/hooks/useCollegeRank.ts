import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';

interface RankResponse {
    rank: number;
    total: number;
    category: string;
}

export function useCollegeRank(collegeId: string | undefined) {
    return useQuery({
        queryKey: ['college-rank', collegeId],
        queryFn: async () => {
            if (!collegeId) return null;
            const { data } = await api.get<RankResponse>(`/colleges/${collegeId}/rank`);
            return data;
        },
        enabled: !!collegeId,
        retry: false,
    });
}
