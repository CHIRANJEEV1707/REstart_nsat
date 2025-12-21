"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCollege = exports.getInternationalCollege = exports.getInternationalColleges = exports.getNewGenCollege = exports.getNewGenColleges = exports.getColleges = void 0;
const College_1 = __importDefault(require("../models/College"));
const NewGenCollege_1 = __importDefault(require("../models/NewGenCollege"));
const logger_1 = __importDefault(require("../utils/logger"));
const InternationalCollege_1 = __importDefault(require("../models/InternationalCollege"));
// Helper to parse "15 LPA" or "₹15,00,000" to number
const parsePackage = (pkg) => {
    if (!pkg)
        return null;
    const numeric = parseFloat(pkg.replace(/[^0-9.]/g, ''));
    if (isNaN(numeric))
        return null;
    if (pkg.toLowerCase().includes('lpa'))
        return numeric * 100000;
    return numeric; // Assuming raw number if no LPA
};
// @desc    Get all colleges with filtering & pagination
// @route   GET /api/colleges
// @desc    Get all colleges with filtering & pagination
// @route   GET /api/colleges
const getColleges = async (req, res) => {
    try {
        let query;
        // Copy req.query
        const reqQuery = { ...req.query };
        // Fields to exclude from direct query matching
        const removeFields = ['select', 'sort', 'page', 'limit', 'type'];
        removeFields.forEach(param => delete reqQuery[param]);
        // Create query string for advanced filtering (gt, gte, etc)
        let queryStr = JSON.stringify(reqQuery);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
        const filterQuery = JSON.parse(queryStr);
        // 1. Dynamic Type Filtering
        // type=india -> country: 'India' AND isNewGen != true
        // type=international -> country: { $ne: 'India' }
        const type = req.query.type;
        if (type === 'india') {
            filterQuery.country = 'India';
            filterQuery.isNewGen = { $ne: true }; // STRICT rule: No New-Gen in Indian section
        }
        else if (type === 'international') {
            filterQuery.country = { $ne: 'India' };
        }
        else if (req.query.country) {
            // If explicit country passed, respect it (already in filterQuery via reqQuery)
        }
        // Feature 1: Map loose 'state' to 'location.state'
        if (req.query.state) {
            filterQuery['location.state'] = req.query.state;
            delete filterQuery.state;
        }
        // Feature 2: Map loose 'exam' to 'exams_required' (array check)
        if (req.query.exam) {
            filterQuery['exams_required'] = req.query.exam;
            delete filterQuery.exam;
        }
        // Feature 3: Budget Range (minFees, maxFees)
        if (req.query.minFees || req.query.maxFees) {
            filterQuery.fees = {};
            if (req.query.minFees)
                filterQuery.fees.$gte = Number(req.query.minFees);
            if (req.query.maxFees)
                filterQuery.fees.$lte = Number(req.query.maxFees);
            delete filterQuery.minFees;
            delete filterQuery.maxFees;
        }
        // Feature 4: Text Search
        if (req.query.search) {
            // Combine limits with text search
            const searchRegex = new RegExp(req.query.search, 'i');
            const searchOr = [
                { name: searchRegex },
                { 'location.city': searchRegex },
                { 'location.state': searchRegex }
            ];
            // Add to filterQuery
            // If we already have filters, we need $and
            // But simpler approach for now: merge
            // Use explicit $or at top level
            // NOTE: Mongoose/MongoDB structure: { ...filters, $or: [...] }
            filterQuery.$or = searchOr;
        }
        // Build Query
        query = College_1.default.find(filterQuery);
        // Sorting
        // Priority: restart_score (desc) for meaningful ranking
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        }
        else {
            // Updated default sort for ranking consistency
            query = query.sort({ restart_score: -1 });
        }
        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 12; // Default 12 per page
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        // Count total documents matching filter
        const total = await College_1.default.countDocuments(filterQuery);
        query = query.skip(startIndex).limit(limit);
        // Executing query
        const colleges = await query;
        // Add Rank
        // Rank = (Page - 1) * Limit + Index + 1
        const collegesWithRank = colleges.map((college, index) => ({
            ...college.toObject(),
            rank: startIndex + index + 1
        }));
        // Pagination result object
        const pagination = {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNext: endIndex < total,
            hasPrev: startIndex > 0
        };
        res.status(200).json({
            success: true,
            count: collegesWithRank.length,
            pagination,
            data: collegesWithRank
        });
    }
    catch (error) {
        logger_1.default.error('Error fetching colleges:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
exports.getColleges = getColleges;
// @desc    Get New-Gen Colleges
// @route   GET /api/colleges/new-gen
const getNewGenColleges = async (req, res) => {
    try {
        // Simple pagination for New-Gen as well to support ranking logic
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 12;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const total = await NewGenCollege_1.default.countDocuments();
        const colleges = await NewGenCollege_1.default.find()
            .sort({ restart_score: -1 }) // Ensure consistent ranking order
            .skip(startIndex)
            .limit(limit);
        // Add Rank
        const collegesWithRank = colleges.map((college, index) => ({
            ...college.toObject(),
            rank: startIndex + index + 1
        }));
        const pagination = {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNext: endIndex < total,
            hasPrev: startIndex > 0
        };
        res.status(200).json({
            success: true,
            count: collegesWithRank.length,
            pagination,
            data: collegesWithRank
        });
    }
    catch (error) {
        logger_1.default.error('Error fetching new-gen colleges:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
exports.getNewGenColleges = getNewGenColleges;
// @desc    Get single New-Gen College
// @route   GET /api/colleges/new-gen/:id
const getNewGenCollege = async (req, res) => {
    try {
        const college = await NewGenCollege_1.default.findById(req.params.id);
        if (!college) {
            return res.status(404).json({ success: false, message: 'New-Gen College not found' });
        }
        res.status(200).json({ success: true, data: college });
    }
    catch (error) {
        logger_1.default.error('Error fetching new-gen colleges:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
exports.getNewGenCollege = getNewGenCollege;
// @desc    Get International Colleges (from College collection)
// @route   GET /api/colleges/international
const getInternationalColleges = async (req, res) => {
    try {
        let query;
        // Copy req.query
        const reqQuery = { ...req.query };
        // Fields to exclude from direct matching
        const removeFields = ['select', 'sort', 'page', 'limit'];
        removeFields.forEach(param => delete reqQuery[param]);
        // Base filter: Country is NOT India
        const filterQuery = { ...reqQuery, country: { $ne: 'India' } };
        // 1. Country Filtering (if explicitly requested)
        if (req.query.country) {
            const countries = req.query.country.split(',');
            if (countries.includes('India')) {
                return res.status(400).json({ success: false, message: 'This endpoint is for non-Indian colleges only.' });
            }
            filterQuery.country = { $in: countries };
        }
        // 2. Budget Range (minFees, maxFees)
        if (req.query.minFees || req.query.maxFees) {
            filterQuery.fees = {};
            if (req.query.minFees)
                filterQuery.fees.$gte = Number(req.query.minFees);
            if (req.query.maxFees)
                filterQuery.fees.$lte = Number(req.query.maxFees);
            delete filterQuery.minFees;
            delete filterQuery.maxFees;
        }
        // 3. Exams Filtering
        if (req.query.exam) {
            filterQuery['exams_required'] = req.query.exam;
            delete filterQuery.exam;
        }
        // 4. Text Search
        if (req.query.search) {
            const searchRegex = new RegExp(req.query.search, 'i');
            filterQuery.$or = [
                { name: searchRegex },
                { 'location.city': searchRegex },
                { 'location.state': searchRegex },
                { country: searchRegex }
            ];
            delete filterQuery.search;
        }
        // Build Query
        query = College_1.default.find(filterQuery);
        // Select specific fields
        query = query.select('name location country fees exams_required restart_score image isTrending trendingScore study_abroad_info');
        // Sorting
        // Force restart_score for ranking
        query = query.sort({ restart_score: -1 });
        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 12; // Default 12
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const total = await College_1.default.countDocuments(filterQuery);
        query = query.skip(startIndex).limit(limit);
        // Execute Query
        const colleges = await query;
        // Add Rank
        const collegesWithRank = colleges.map((college, index) => {
            const collegeObj = college.toObject();
            let roi = null;
            // Calculate ROI (assuming annual fees * 4 for degree cost)
            const avgPackage = parsePackage(collegeObj.placement_stats?.average_package);
            if (avgPackage && collegeObj.fees) {
                roi = parseFloat((avgPackage / (collegeObj.fees * 4)).toFixed(2));
            }
            return {
                ...collegeObj,
                rank: startIndex + index + 1,
                roi
            };
        });
        // Pagination Result
        const pagination = {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNext: endIndex < total,
            hasPrev: startIndex > 0
        };
        res.status(200).json({
            success: true,
            pagination,
            data: collegesWithRank
        });
    }
    catch (error) {
        logger_1.default.error('Error fetching international colleges:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
exports.getInternationalColleges = getInternationalColleges;
// @desc    Get single International College
// @route   GET /api/colleges/international/:id
const getInternationalCollege = async (req, res) => {
    try {
        const college = await InternationalCollege_1.default.findById(req.params.id);
        if (!college) {
            return res.status(404).json({ success: false, message: 'International College not found' });
        }
        res.status(200).json({ success: true, data: college });
    }
    catch (error) {
        logger_1.default.error('Error searching colleges:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
exports.getInternationalCollege = getInternationalCollege;
// @desc    Get single college (Universal: Searches Indian, International, New-Gen)
// @route   GET /api/colleges/:id
const getCollege = async (req, res) => {
    try {
        const { id } = req.params;
        let college = null;
        let source = '';
        // 1. Try Finding in Indian/General Colleges
        college = await College_1.default.findById(id);
        if (college)
            source = 'Indian';
        // 2. If not found, try International
        if (!college) {
            college = await InternationalCollege_1.default.findById(id);
            if (college)
                source = 'International';
        }
        // 3. If not found, try New-Gen
        if (!college) {
            college = await NewGenCollege_1.default.findById(id);
            if (college)
                source = 'NewGen';
        }
        if (!college) {
            return res.status(404).json({ success: false, message: 'College not found' });
        }
        // 4. Normalize Data to Strict "UnifiedCollege" Shape
        let normalizedCollege = {
            _id: college._id,
            name: college.name,
            description: college.description,
            website: college.website || college.official_website,
            image: college.image || "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1000&auto=format&fit=crop", // Fallback if absolutely missing
            restart_score: college.restart_score || 0,
            badges: college.badges || [],
            isTrending: college.isTrending || false,
            trendingScore: college.trendingScore || 0,
            reviews_count: 120, // Placeholder/Real count if implemented
            rating: 4.5, // Placeholder/Real
            roi: null, // Default
        };
        // Specific Normalization based on Source
        if (source === 'Indian') {
            normalizedCollege.type = college.isNewGen ? 'New-Gen' : (college.country === 'India' ? 'Indian' : 'International'); // Handle mixed data in College schema
            normalizedCollege.location = college.location ? { ...college.location, country: college.country || 'India' } : { city: 'Unknown', country: 'India' };
            normalizedCollege.fees = college.fees;
            normalizedCollege.exams_required = college.exams_required || [];
            normalizedCollege.placement_stats = college.placement_stats;
            normalizedCollege.admission_process = college.admission_process;
            // ROI Calculation
            const avgPackage = parsePackage(college.placement_stats?.average_package);
            if (avgPackage && college.fees) {
                // 4-Year Degree ROI = Avg Package / (Annual Fees * 4)
                normalizedCollege.roi = parseFloat((avgPackage / (college.fees * 4)).toFixed(2));
            }
        }
        else if (source === 'International') {
            normalizedCollege.type = 'International';
            normalizedCollege.location = {
                city: college.city,
                state: college.state || '', // International schema might keep state elsewhere or not have it
                country: college.country
            };
            // Convert USD fees to INR for display consistency if needed, or keep raw. Keeping raw number for now.
            // Or better: keep it generic and frontend handles currency symbol based on country.
            normalizedCollege.fees = college.tuition_fee_annual;
            normalizedCollege.currency = 'USD'; // Flag for frontend
            normalizedCollege.exams_required = [...(college.entrance_exams || []), ...(college.english_tests || [])];
            normalizedCollege.study_abroad_info = {
                visa_requirements: [college.visa_type], // Simplified
                scholarships: college.scholarships_available ? 'Available' : 'None',
                ...college.toObject() // Pass mostly everything for detailed view
            };
        }
        else if (source === 'NewGen') {
            normalizedCollege.type = 'New-Gen';
            normalizedCollege.location = college.location;
            normalizedCollege.fees = college.fees?.amountINR;
            normalizedCollege.exams_required = college.examsAccepted || [];
            normalizedCollege.cohortDetails = college.cohortDetails;
            normalizedCollege.curriculumFocus = college.curriculumFocus;
            normalizedCollege.placementSupport = college.placementSupport;
            // ROI Calculation (New-Gen often has avg_package in root or derived from placementSupport)
            // Assuming avg_package is available directly or we parse from placement text.
            // Using placeholder logic if schema varies, but for now assuming similar pattern or standardized 'avg_package' field if added.
            const avgPackage = parsePackage(college.avg_package || (college.placementSupport?.[0] || ''));
            // Note: 'avg_package' might need to be added to NewGen schema explicitly if not present, 
            // but using what's available or null.
            if (avgPackage && college.fees?.amountINR) {
                normalizedCollege.roi = parseFloat((avgPackage / college.fees.amountINR).toFixed(1));
            }
        }
        // 5. Dynamic "Why" Tags (Universal Logic)
        // Note: Ideally User context is needed for strict personalization (Budget, Exams). 
        // For public page, we show generic strengths.
        const whyTags = [];
        if (normalizedCollege.restart_score >= 9.0)
            whyTags.push('High RESTART Score');
        if (normalizedCollege.isTrending)
            whyTags.push('Trending Now');
        if (normalizedCollege.fees < 200000 && normalizedCollege.type === 'Indian')
            whyTags.push('Best Value'); // Generic budget rule
        normalizedCollege.why = whyTags;
        res.status(200).json({ success: true, data: normalizedCollege });
    }
    catch (error) {
        logger_1.default.error('Error fetching university college details:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
exports.getCollege = getCollege;
