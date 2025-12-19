import { Request, Response } from 'express';
import College from '../models/College';
import NewGenCollege from '../models/NewGenCollege';
import logger from '../utils/logger';
import InternationalCollege from '../models/InternationalCollege';

// @desc    Get all colleges with filtering
// @route   GET /api/colleges
export const getColleges = async (req: Request, res: Response) => {
    try {
        let query;

        // Copy req.query
        const reqQuery = { ...req.query };

        // Fields to exclude
        const removeFields = ['select', 'sort', 'page', 'limit'];
        removeFields.forEach(param => delete reqQuery[param]);

        // Create query string for advanced filtering (gt, gte, etc - if needed later)
        let queryStr = JSON.stringify(reqQuery);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

        const filterQuery = JSON.parse(queryStr);

        // Feature 1: Map loose 'state' to 'location.state'
        if (req.query.state) {
            filterQuery['location.state'] = req.query.state;
            delete filterQuery.state; // clean up if necessary, though reqQuery excluded it? No, we need to handle it.
            // Actually reqQuery still has it if not removed.
            // But we prefer explicit mapping over loose.
        }

        // Feature 2: Map loose 'exam' to 'exams_required' (array check)
        // If the user sends ?exam=JEE, it matches if JEE is in exams_required array. 
        // Mongoose find({ exams_required: 'val' }) handles this automatically for array fields.
        if (req.query.exam) {
            filterQuery['exams_required'] = req.query.exam;
            delete filterQuery.exam;
        }

        // Feature 3: Budget Range (minFees, maxFees)
        if (req.query.minFees || req.query.maxFees) {
            filterQuery.fees = {};
            if (req.query.minFees) filterQuery.fees.$gte = Number(req.query.minFees);
            if (req.query.maxFees) filterQuery.fees.$lte = Number(req.query.maxFees);

            delete filterQuery.minFees;
            delete filterQuery.maxFees;
        }

        // Finding resource
        // If searching text
        if (req.query.search) {
            // Text search score sorting could be added here
            query = College.find({
                ...filterQuery,
                $text: { $search: req.query.search as string }
            });
        } else {
            query = College.find(filterQuery);
        }

        // Sorting
        if (req.query.sort) {
            const sortBy = (req.query.sort as string).split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-restart_score');
        }

        // Pagination
        const page = parseInt(req.query.page as string, 10) || 1;
        const limit = parseInt(req.query.limit as string, 10) || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const total = await College.countDocuments();

        query = query.skip(startIndex).limit(limit);

        // Executing query
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
        logger.error('Error fetching colleges:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get New-Gen Colleges
// @route   GET /api/colleges/new-gen
export const getNewGenColleges = async (req: Request, res: Response) => {
    try {
        const colleges = await NewGenCollege.find();
        res.status(200).json({ success: true, count: colleges.length, data: colleges });
    } catch (error) {
        logger.error('Error fetching college by ID:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get single New-Gen College
// @route   GET /api/colleges/new-gen/:id
export const getNewGenCollege = async (req: Request, res: Response) => {
    try {
        const college = await NewGenCollege.findById(req.params.id);
        if (!college) {
            return res.status(404).json({ success: false, message: 'New-Gen College not found' });
        }
        res.status(200).json({ success: true, data: college });
    } catch (error) {
        logger.error('Error fetching new-gen colleges:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get International Colleges
// @route   GET /api/colleges/international
export const getInternationalColleges = async (req: Request, res: Response) => {
    try {
        let query;

        // Copy req.query
        const reqQuery = { ...req.query };

        // Fields to exclude
        const removeFields = ['select', 'sort', 'page', 'limit'];
        removeFields.forEach(param => delete reqQuery[param]);

        // Filtering by country if passed
        if (req.query.country) {
            // @ts-ignore
            reqQuery.country = { $in: req.query.country.split(',') };
        }

        // Create query string
        let queryStr = JSON.stringify(reqQuery);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

        query = InternationalCollege.find(JSON.parse(queryStr));

        const colleges = await query;
        res.status(200).json({ success: true, count: colleges.length, data: colleges });
    } catch (error) {
        logger.error('Error fetching new-gen college by ID:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get single International College
// @route   GET /api/colleges/international/:id
export const getInternationalCollege = async (req: Request, res: Response) => {
    try {
        const college = await InternationalCollege.findById(req.params.id);
        if (!college) {
            return res.status(404).json({ success: false, message: 'International College not found' });
        }
        res.status(200).json({ success: true, data: college });
    } catch (error) {
        logger.error('Error searching colleges:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get single college
// @route   GET /api/colleges/:id
export const getCollege = async (req: Request, res: Response) => {
    try {
        const college = await College.findById(req.params.id);
        if (!college) {
            return res.status(404).json({ success: false, message: 'College not found' });
        }
        res.status(200).json({ success: true, data: college });
    } catch (error) {
        logger.error('Error fetching college filters:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
