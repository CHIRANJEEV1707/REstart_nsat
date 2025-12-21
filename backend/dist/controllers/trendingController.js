"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTrendingColleges = void 0;
const College_1 = __importDefault(require("../models/College"));
const NewGenCollege_1 = __importDefault(require("../models/NewGenCollege"));
const InternationalCollege_1 = __importDefault(require("../models/InternationalCollege"));
const logger_1 = __importDefault(require("../utils/logger"));
const cache_1 = __importDefault(require("../utils/cache"));
// @desc    Get top trending colleges across all categories
// @route   GET /api/colleges/trending
const getTrendingColleges = async (req, res) => {
    try {
        // Check cache first
        const cacheKey = 'trending:colleges:all';
        const cached = cache_1.default.get(cacheKey);
        if (cached) {
            logger_1.default.info('Returning trending colleges from cache');
            return res.json(cached);
        }
        // Fetch trending items from all collections concurrently
        const [traditional, newGen, international] = await Promise.all([
            College_1.default.find({ isTrending: true })
                .select('name location type image trendingScore badges fees placement_stats')
                .lean(),
            NewGenCollege_1.default.find({ isTrending: true })
                .select('name location category image trendingScore fees placementSupport examsAccepted')
                .lean(),
            InternationalCollege_1.default.find({ isTrending: true })
                .select('name city country university_type image trendingScore tuition_fee_annual global_ranking')
                .lean()
        ]);
        // Normalize data structure for the frontend
        const normalizedTraditional = traditional.map((col) => ({
            _id: col._id,
            name: col.name,
            location: col.location,
            country: 'India',
            image: col.image,
            category: 'Traditional',
            trendingScore: col.trendingScore || 0,
            metric: col.placement_stats?.highest_package ? `Highest: ${col.placement_stats.highest_package}` : 'Top Ranked',
            type: col.type
        }));
        const normalizedNewGen = newGen.map((col) => ({
            _id: col._id,
            name: col.name,
            location: col.location,
            country: 'India',
            image: col.image,
            category: 'New-Gen',
            trendingScore: col.trendingScore || 0,
            metric: col.placementSupport?.averageCTC ? `Avg: ₹${(col.placementSupport.averageCTC / 100000).toFixed(1)} LPA` : 'Placement Guaranteed',
            type: 'New-Gen'
        }));
        const normalizedInternational = international.map((col) => ({
            _id: col._id,
            name: col.name,
            location: { city: col.city, state: col.country },
            country: col.country,
            image: col.image || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1',
            category: 'International',
            trendingScore: col.trendingScore || 0,
            metric: col.global_ranking ? `Global Rank #${col.global_ranking}` : 'Top University',
            type: col.university_type
        }));
        // Merge and Sort
        const allTrending = [...normalizedTraditional, ...normalizedNewGen, ...normalizedInternational];
        // Sort by trendingScore descending
        allTrending.sort((a, b) => b.trendingScore - a.trendingScore);
        // Limit to top 10
        const topTrending = allTrending.slice(0, 10);
        const response = {
            success: true,
            count: topTrending.length,
            data: topTrending
        };
        // Cache the response for 5 minutes
        cache_1.default.set(cacheKey, response, 5 * 60 * 1000);
        logger_1.default.info('Cached trending colleges for 5 minutes');
        res.status(200).json(response);
    }
    catch (error) {
        logger_1.default.error('Error fetching trending colleges:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
exports.getTrendingColleges = getTrendingColleges;
