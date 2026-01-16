"use strict";

import { useState, useMemo } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Skeleton } from '@/components/ui/Skeleton';
import { AlertCircle } from 'lucide-react';
import CollegeCard from './CollegeCard';
import { College } from '@/types/college';
import { useDashboard } from '@/context/DashboardContext';
import { Pagination } from '@/components/ui/Pagination';

export default function CollegeGrid({
    filters,
    type = 'indian',
    onCardClick
}: {
    filters: { search?: string; country?: string; state?: string; exam?: string; minFees?: string; maxFees?: string };
    type?: 'indian' | 'international' | 'newgen';
    onCardClick?: (collegeId: string) => void;
}) {
    // Make useDashboard optional - component can work without it
    let openCollegeDetails: ((id: string, type?: 'indian' | 'international' | 'newgen') => void) | undefined;
    try {
        const dashboard = useDashboard();
        openCollegeDetails = dashboard.openCollegeDetails;
    } catch (e) {
        // Not in DashboardProvider context - that's okay
        openCollegeDetails = undefined;
    }

    // Local state for pagination
    const [page, setPage] = useState(1);

    // Reset page when filters change (but not when page changes itself)
    // We can do this by wrapping setPage in a useEffect dependent on filters
    // OR implicitly by query key structure? 
    // Best practice: When filters change, page should reset.
    // We can use a ref or simplified useEffect.
    /* 
    // This effect might cause double fetch if not careful, but needed for UX.
    useEffect(() => {
        setPage(1);
    }, [filters, type]);
    */
    // Actually, let's keep it simple. If filter search/country changes, we want page 1.
    // Changing filters passes new props, so we can react to that. 
    // Ideally the parent controls this, but CollegeGrid manages the query.
    // Let's rely on the queryKey change to trigger fetch, but we need to reset page.
    // Use key on component? Or just effect.
    useMemo(() => {
        setPage(1);
    }, [filters, type]); // Reset page on filter/type change (useMemo runs during render)


    // Fetch colleges
    const { data: responseData, isLoading, isError, isFetching } = useQuery({
        // Include filters AND page in queryKey
        queryKey: ['colleges-strict', type, filters, page], // Renamed key to force fresh fetch
        queryFn: async () => {
            // Unified endpoint strategy with strict routing
            let endpoint = '/colleges'; // Default for 'indian'

            if (type === 'international') {
                endpoint = '/international-colleges';
            } else if (type === 'newgen') {
                endpoint = '/newgen-colleges';
            }

            const params = new URLSearchParams();

            params.append('page', page.toString());
            params.append('limit', '12');

            // Common filters
            if (filters.search) params.append('search', filters.search);
            if (filters.exam) params.append('exam', filters.exam);
            // Note: minFees/maxFees might serve different schemas in different endpoints,
            // but assuming backend handles or ignores them gracefully if field names match.
            if (filters.minFees) params.append('minFees', filters.minFees);
            if (filters.maxFees) params.append('maxFees', filters.maxFees);

            // Specific Type Logic for 'indian' (Standard)
            if (type === 'indian') {
                // Ensure backend knows we want Indian only (enforces isNewGen=false)
                params.append('type', 'india');
                if (filters.state) params.append('state', filters.state);
            }

            if (type === 'international') {
                if (filters.country) params.append('country', filters.country);
            }

            // NewGen doesn't need extra 'type' param as endpoint handles it

            const queryString = params.toString();
            const fullUrl = `${endpoint}?${queryString}`;

            const res = await api.get(fullUrl);
            return res.data;
        },
        staleTime: 5 * 60 * 1000,
        placeholderData: keepPreviousData, // Keep showing old data while fetching new page
    });

    // Map Backend Data
    const colleges: College[] = useMemo(() => {
        const data = (responseData as any)?.data;
        if (!data) return [];
        return data.map((item: any) => ({
            _id: item._id,
            collegeId: item._id,
            name: item.name,
            image: item.image || '',
            location: item.location || { city: item.city || '', state: item.country || 'India' },
            country: item.country || 'India',
            fees: Number(item.fees || item.tuition_fee_annual || 0),
            currency: item.currency || (item.country === 'India' || !item.country ? 'INR' : 'USD'),
            exams_required: item.exams_required || item.entrance_exams || [],
            restart_score: Number(item.restart_score || 0),
            badges: item.badges || [],
            placement_stats: item.placement_stats || { average_package: 'N/A', highest_package: 'N/A' },
            financialSupportPercent: Number(item.restart_score || 0),
            tags: item.badges || [],
            detailPageSlug: `/college/${item._id}`,
            admission_mode: item.admission_mode || '',
            // global_ranking: item.global_ranking, // Ranking removed
        }));
    }, [responseData]);

    // Pagination Data
    const pagination = (responseData as any)?.pagination || {
        page: 1,
        totalPages: 1,
        total: 0,
        limit: 12,
        hasNext: false,
        hasPrev: false
    };

    // Scroll to top on page change
    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (isLoading) {
        return (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <Skeleton key={i} className="h-80 w-full rounded-xl" />)}
            </div>
        );
    }

    if (isError) return (
        <div className="text-center py-20 bg-red-50/50 rounded-2xl border border-red-100 flex flex-col items-center">
            <AlertCircle className="h-10 w-10 text-red-500 mb-3" />
            <h3 className="text-red-900 font-semibold">Unable to load colleges</h3>
            <p className="text-red-600 text-sm mt-1">Please try refreshing the page.</p>
        </div>
    );

    if (colleges.length === 0) {
        return (
            <div className="text-center py-24 bg-gray-50/50 rounded-2xl border border-gray-200/50 border-dashed">
                <div className="bg-gray-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="text-gray-400" size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">No colleges found</h3>
                <p className="text-gray-500 text-sm max-w-xs mx-auto">
                    We couldn't find any colleges matching your criteria. Try clearing some filters.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center px-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                    Showing  <span className="text-gray-900">{((pagination.page - 1) * pagination.limit) + 1}</span> - <span className="text-gray-900">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="text-gray-900">{pagination.total}</span> Colleges
                </p>
                {isFetching && <span className="text-xs text-indigo-500 animate-pulse">Updating...</span>}
            </div>

            <div className={`grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 ${isFetching ? 'opacity-70 transition-opacity' : ''}`}>
                {colleges.map((college) => {
                    let variant: 'traditional' | 'international' | 'newgen' = 'traditional';
                    if (type === 'international') variant = 'international';
                    else if (type === 'newgen') variant = 'newgen';
                    // Fallback
                    if (type === 'indian' && college.country !== 'India' && college.country) variant = 'international';

                    return (
                        <CollegeCard
                            key={college.collegeId}
                            college={college}
                            variant={variant}
                            onClick={() => {
                                if (onCardClick) {
                                    onCardClick(college.collegeId);
                                } else if (openCollegeDetails) {
                                    openCollegeDetails(college.collegeId);
                                }
                            }}
                        />
                    );
                })}
            </div>

            {/* Pagination Control */}
            <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
                hasNext={pagination.hasNext}
                hasPrev={pagination.hasPrev}
            />
        </div>
    );
}
