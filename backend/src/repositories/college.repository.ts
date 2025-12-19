import { BaseRepository } from './base.repository';
import College from '../models/College';


interface CollegeSearchParams {
    search?: string;
    state?: string;
    city?: string;
    type?: string;
    minFees?: number;
    maxFees?: number;
    exams?: string[];
    minScore?: number;
}

interface PaginationParams {
    page?: number;
    limit?: number;
    sort?: string;
}

/**
 * College Repository
 * Handles all database operations for colleges
 */
export class CollegeRepository extends BaseRepository<typeof College.prototype> {
    constructor() {
        super(College);
    }

    /**
     * Search colleges with filters
     */
    async search(params: CollegeSearchParams, pagination: PaginationParams = {}) {
        const { page = 1, limit = 20, sort = '-restart_score' } = pagination;
        const skip = (page - 1) * limit;

        const filter: any = {};

        // Text search
        if (params.search) {
            filter.$text = { $search: params.search };
        }

        // Location filters
        if (params.state) {
            filter['location.state'] = params.state;
        }
        if (params.city) {
            filter['location.city'] = params.city;
        }

        // Type filter
        if (params.type) {
            filter.type = params.type;
        }

        // Fees range
        if (params.minFees !== undefined || params.maxFees !== undefined) {
            filter.fees = {};
            if (params.minFees !== undefined) {
                filter.fees.$gte = params.minFees;
            }
            if (params.maxFees !== undefined) {
                filter.fees.$lte = params.maxFees;
            }
        }

        // Exams filter
        if (params.exams && params.exams.length > 0) {
            filter.exams_required = { $in: params.exams };
        }

        // Score filter
        if (params.minScore !== undefined) {
            filter.restart_score = { $gte: params.minScore };
        }

        const [colleges, total] = await Promise.all([
            this.model.find(filter).sort(sort).skip(skip).limit(limit).exec(),
            this.model.countDocuments(filter).exec(),
        ]);

        return {
            colleges,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Get trending colleges
     */
    async getTrending(limit: number = 10) {
        return this.model
            .find({ isTrending: true })
            .sort({ trendingScore: -1 })
            .limit(limit)
            .exec();
    }

    /**
     * Get colleges by exam
     */
    async getByExam(examName: string, limit: number = 20) {
        return this.model
            .find({ exams_required: examName })
            .sort({ restart_score: -1 })
            .limit(limit)
            .exec();
    }

    /**
     * Get colleges by state
     */
    async getByState(state: string) {
        return this.model
            .find({ 'location.state': state })
            .sort({ restart_score: -1 })
            .exec();
    }
}

export default new CollegeRepository();
