import { Request, Response } from 'express';
import InternationalCollege from '../models/InternationalCollege';
import logger from '../utils/logger';

// @desc    Get all international colleges with filtering
// @route   GET /api/international-colleges
export const getInternationalColleges = async (req: Request, res: Response) => {
    try {
        const reqQuery = { ...req.query };

        // Fields to exclude from direct match
        const removeFields = ['select', 'sort', 'page', 'limit', 'min_tuition', 'max_tuition', 'min_ranking', 'max_ranking', 'sat_required', 'ielts_required'];
        removeFields.forEach(param => delete reqQuery[param]);

        // Basic filtering (country, continent, etc.)
        let query = InternationalCollege.find(reqQuery);

        // 1. Text Search
        if (req.query.search) {
            const searchRegex = new RegExp(req.query.search as string, 'i');
            query = query.or([
                { name: searchRegex },
                { city: searchRegex },
                { country: searchRegex },
                { description: searchRegex }
            ]);
        }

        // 2. Budget Filter (annual_fees)
        // Mapped from minFee/maxFee to tuition_fee_annual
        if (req.query.minFee || req.query.maxFee) {
            const feeFilter: any = {};
            if (req.query.minFee) feeFilter.$gte = Number(req.query.minFee);
            if (req.query.maxFee) feeFilter.$lte = Number(req.query.maxFee);
            query = query.where('tuition_fee_annual').equals(feeFilter);
        }

        // Legacy legacy support (remove if needed, but keeping for safety as per file read)
        if (req.query.min_tuition || req.query.max_tuition) {
            const tuitionFilter: any = {};
            if (req.query.min_tuition) tuitionFilter.$gte = Number(req.query.min_tuition);
            if (req.query.max_tuition) tuitionFilter.$lte = Number(req.query.max_tuition);
            query = query.where('tuition_fee_annual').equals(tuitionFilter);
        }

        // 3. Exam Filter
        if (req.query.exam) {
            query = query.where('entrance_exams').in([req.query.exam]);
        }

        // Ranking Ranges
        if (req.query.min_ranking || req.query.max_ranking) {
            const rankingFilter: any = {};
            if (req.query.min_ranking) rankingFilter.$gte = Number(req.query.min_ranking);
            if (req.query.max_ranking) rankingFilter.$lte = Number(req.query.max_ranking);
            query = query.where('global_ranking').equals(rankingFilter);
        }

        // Exam requirement filters (explicit flags)
        if (req.query.sat_required === 'true') {
            query = query.or([
                { entrance_exams: 'SAT' },
                { 'minimum_scores.sat': { $gt: 0 } }
            ]);
        }

        if (req.query.ielts_required === 'true') {
            query = query.or([
                { english_tests: 'IELTS' },
                { 'minimum_scores.ielts': { $gt: 0 } }
            ]);
        }

        // Sorting
        if (req.query.sort) {
            const sortBy = (req.query.sort as string).split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort({ restart_score: -1 }); // Default sort by RESTART Score
        }

        // Pagination
        const page = parseInt(req.query.page as string, 10) || 1;
        const limit = parseInt(req.query.limit as string, 10) || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const total = await InternationalCollege.countDocuments(); // Should ideally match query filters too but kept simple for now or need clone

        query = query.skip(startIndex).limit(limit);

        const colleges = await query;

        // Pagination result
        const pagination: any = {};
        if (endIndex < total) {
            pagination.next = { page: page + 1, limit };
        }
        if (startIndex > 0) {
            pagination.prev = { page: page - 1, limit };
        }

        res.status(200).json({ success: true, count: colleges.length, pagination, data: colleges });
    } catch (error) {
        logger.error('Error fetching international colleges:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get single international college
// @route   GET /api/international-colleges/:id
export const getInternationalCollege = async (req: Request, res: Response) => {
    try {
        const college = await InternationalCollege.findById(req.params.id);
        if (!college) {
            return res.status(404).json({ success: false, message: 'International College not found' });
        }
        res.status(200).json({ success: true, data: college });
    } catch (error) {
        logger.error('Error fetching international college by ID:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
