export interface College {
    _id: string;
    collegeId: string; // mapped from _id for convenience if needed, or just use _id
    name: string;
    image?: string;
    location: {
        city: string;
        state: string;
        country?: string;
    };
    country: string;
    fees: number;
    currency: string;
    exams_required: string[];
    restart_score: number;
    badges: string[];
    placement_stats?: {
        average_package: string;
        highest_package: string;
    };
    financialSupportPercent?: number; // Derived from restart_score or new field
    tags?: string[]; // mapped from badges
    detailPageSlug?: string;
    admission_mode?: string;
    global_ranking?: number | string;
    rank?: number;
}
