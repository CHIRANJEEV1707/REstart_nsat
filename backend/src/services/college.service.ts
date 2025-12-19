import collegeRepository, { CollegeRepository } from '../repositories/college.repository';
import logger from '../utils/logger';

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
 * College Service
 * Contains business logic for college operations
 */
export class CollegeService {
    private repository: CollegeRepository;

    constructor(repository: CollegeRepository) {
        this.repository = repository;
    }

    /**
     * Search colleges with filters and pagination
     */
    async searchColleges(params: CollegeSearchParams, pagination: PaginationParams = {}) {
        try {
            const result = await this.repository.search(params, pagination);

            logger.info(`College search completed: ${result.colleges.length} results found`);

            return {
                success: true,
                ...result,
            };
        } catch (error) {
            logger.error('Error searching colleges:', error);
            throw error;
        }
    }

    /**
     * Get college by ID
     */
    async getCollegeById(id: string) {
        try {
            const college = await this.repository.findById(id);

            if (!college) {
                return {
                    success: false,
                    message: 'College not found',
                };
            }

            return {
                success: true,
                data: college,
            };
        } catch (error) {
            logger.error(`Error fetching college ${id}:`, error);
            throw error;
        }
    }

    /**
     * Get trending colleges
     */
    async getTrendingColleges(limit: number = 10) {
        try {
            const colleges = await this.repository.getTrending(limit);

            return {
                success: true,
                count: colleges.length,
                data: colleges,
            };
        } catch (error) {
            logger.error('Error fetching trending colleges:', error);
            throw error;
        }
    }

    /**
     * Get colleges by exam
     */
    async getCollegesByExam(examName: string, limit: number = 20) {
        try {
            const colleges = await this.repository.getByExam(examName, limit);

            return {
                success: true,
                count: colleges.length,
                data: colleges,
            };
        } catch (error) {
            logger.error(`Error fetching colleges for exam ${examName}:`, error);
            throw error;
        }
    }

    /**
     * Get colleges by state
     */
    async getCollegesByState(state: string) {
        try {
            const colleges = await this.repository.getByState(state);

            return {
                success: true,
                count: colleges.length,
                data: colleges,
            };
        } catch (error) {
            logger.error(`Error fetching colleges for state ${state}:`, error);
            throw error;
        }
    }

    /**
     * Get all colleges with pagination
     */
    async getAllColleges(page: number = 1, limit: number = 20) {
        try {
            const skip = (page - 1) * limit;

            const [colleges, total] = await Promise.all([
                this.repository.findAll({}, { skip, limit, sort: { restart_score: -1 } }),
                this.repository.count(),
            ]);

            return {
                success: true,
                count: colleges.length,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                },
                data: colleges,
            };
        } catch (error) {
            logger.error('Error fetching all colleges:', error);
            throw error;
        }
    }
}

// Export singleton instance
export default new CollegeService(collegeRepository);
