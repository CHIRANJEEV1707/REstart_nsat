import { Request, Response } from 'express';
import College from '../models/College';
import NewGenCollege from '../models/NewGenCollege';
import InternationalCollege from '../models/InternationalCollege';
import logger from '../utils/logger';
import cache from '../utils/cache';

// @desc    Get top trending colleges across all categories
// @route   GET /api/colleges/trending
export const getTrendingColleges = async (req: Request, res: Response) => {
    try {
        // Check cache first
        const cacheKey = 'trending:colleges:all';
        const cached = cache.get(cacheKey);

        if (cached) {
            logger.info('Returning trending colleges from cache');
            return res.json(cached);
        }

        // Fetch trending items from all collections concurrently
        const [traditional, newGen, international] = await Promise.all([
            College.find({ isTrending: true })
                .select('name location type image trendingScore badges fees placement_stats restart_score')
                .lean(),
            NewGenCollege.find({ isTrending: true })
                .select('name location category image trendingScore fees placementSupport examsAccepted restart_score')
                .lean(),
            InternationalCollege.find({ isTrending: true })
                .select('name city country university_type image trendingScore tuition_fee_annual global_ranking restart_score')
                .lean()
        ]);

        // Normalize data structure for the frontend
        const normalizedTraditional = traditional.map((col: any) => ({
            _id: col._id,
            name: col.name,
            location: col.location,
            country: 'India',
            image: col.image,
            category: 'Traditional',
            trendingScore: col.trendingScore || 0,
            metric: col.restart_score ? `Score: ${col.restart_score.toFixed(1)}/10` : (col.placement_stats?.highest_package ? `Highest: ${col.placement_stats.highest_package}` : 'Top Choice'),
            type: col.type
        }));

        const normalizedNewGen = newGen.map((col: any) => ({
            _id: col._id,
            name: col.name,
            location: col.location,
            country: 'India',
            image: col.image,
            category: 'New-Gen',
            trendingScore: col.trendingScore || 0,
            metric: col.restart_score ? `Score: ${col.restart_score.toFixed(1)}/10` : (col.placementSupport?.averageCTC ? `Avg: ₹${(col.placementSupport.averageCTC / 100000).toFixed(1)} LPA` : 'Placement Guaranteed'),
            type: 'New-Gen'
        }));

        const normalizedInternational = international.map((col: any) => ({
            _id: col._id,
            name: col.name,
            location: { city: col.city, state: col.country },
            country: col.country,
            image: col.image || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1',
            category: 'International',
            trendingScore: col.trendingScore || 0,
            metric: col.restart_score ? `Score: ${col.restart_score.toFixed(1)}/10` : 'Top University',
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
        cache.set(cacheKey, response, 5 * 60 * 1000);
        logger.info('Cached trending colleges for 5 minutes');

        res.status(200).json(response);
    } catch (error) {
        logger.error('Error fetching trending colleges:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
