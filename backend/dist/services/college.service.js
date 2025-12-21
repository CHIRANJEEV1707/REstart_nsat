"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollegeService = void 0;
const college_repository_1 = __importDefault(require("../repositories/college.repository"));
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * College Service
 * Contains business logic for college operations
 */
class CollegeService {
    constructor(repository) {
        this.repository = repository;
    }
    /**
     * Search colleges with filters and pagination
     */
    async searchColleges(params, pagination = {}) {
        try {
            const result = await this.repository.search(params, pagination);
            logger_1.default.info(`College search completed: ${result.colleges.length} results found`);
            return {
                success: true,
                ...result,
            };
        }
        catch (error) {
            logger_1.default.error('Error searching colleges:', error);
            throw error;
        }
    }
    /**
     * Get college by ID
     */
    async getCollegeById(id) {
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
        }
        catch (error) {
            logger_1.default.error(`Error fetching college ${id}:`, error);
            throw error;
        }
    }
    /**
     * Get trending colleges
     */
    async getTrendingColleges(limit = 10) {
        try {
            const colleges = await this.repository.getTrending(limit);
            return {
                success: true,
                count: colleges.length,
                data: colleges,
            };
        }
        catch (error) {
            logger_1.default.error('Error fetching trending colleges:', error);
            throw error;
        }
    }
    /**
     * Get colleges by exam
     */
    async getCollegesByExam(examName, limit = 20) {
        try {
            const colleges = await this.repository.getByExam(examName, limit);
            return {
                success: true,
                count: colleges.length,
                data: colleges,
            };
        }
        catch (error) {
            logger_1.default.error(`Error fetching colleges for exam ${examName}:`, error);
            throw error;
        }
    }
    /**
     * Get colleges by state
     */
    async getCollegesByState(state) {
        try {
            const colleges = await this.repository.getByState(state);
            return {
                success: true,
                count: colleges.length,
                data: colleges,
            };
        }
        catch (error) {
            logger_1.default.error(`Error fetching colleges for state ${state}:`, error);
            throw error;
        }
    }
    /**
     * Get all colleges with pagination
     */
    async getAllColleges(page = 1, limit = 20) {
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
        }
        catch (error) {
            logger_1.default.error('Error fetching all colleges:', error);
            throw error;
        }
    }
}
exports.CollegeService = CollegeService;
// Export singleton instance
exports.default = new CollegeService(college_repository_1.default);
