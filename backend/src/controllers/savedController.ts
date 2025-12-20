import { Request, Response } from 'express';
import User from '../models/User';
import College from '../models/College';
import InternationalCollege from '../models/InternationalCollege';
import logger from '../utils/logger';

// @desc    Get saved colleges
// @route   GET /api/saved
export const getSavedColleges = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.user?._id)
            .populate('saved_colleges')
            .populate('saved_international_colleges');

        if (!user) {
            return res.status(200).json({ success: true, count: 0, data: [] });
        }

        // Add type to each college object
        const indianColleges = (user.saved_colleges || []).map((c: any) => ({ ...c.toObject(), type: 'indian' }));
        const internationalColleges = (user.saved_international_colleges || []).map((c: any) => ({ ...c.toObject(), type: 'international' }));

        const allSaved = [...indianColleges, ...internationalColleges];



        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        res.status(200).json({ success: true, count: allSaved.length, data: allSaved });
    } catch (error) {
        logger.error('Error fetching saved colleges:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Save a college
// @route   POST /api/saved
export const saveCollege = async (req: Request, res: Response) => {
    try {
        const { collegeId, collegeType } = req.body; // collegeType: 'indian' | 'international'

        if (!collegeId) {
            return res.status(400).json({ success: false, message: 'College ID is required' });
        }

        // Default to indian if not specified
        const type = collegeType || 'indian';

        // Check if college exists
        let college;
        if (type === 'international') {
            college = await InternationalCollege.findById(collegeId);
        } else {
            college = await College.findById(collegeId);
        }

        if (!college) return res.status(404).json({ success: false, message: 'College not found' });

        // @ts-ignore
        const user = await User.findById(req.user?.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        // Check if already saved and save
        if (type === 'international') {
            // @ts-ignore
            if (user.saved_international_colleges?.some(id => id.toString() === collegeId)) {
                return res.status(400).json({ success: false, message: 'College already saved' });
            }
            // @ts-ignore
            if (!user.saved_international_colleges) user.saved_international_colleges = [];
            // @ts-ignore
            user.saved_international_colleges.push(collegeId);
        } else {
            // @ts-ignore
            if (user.saved_colleges?.some(id => id.toString() === collegeId)) {
                return res.status(400).json({ success: false, message: 'College already saved' });
            }
            // @ts-ignore
            if (!user.saved_colleges) user.saved_colleges = [];
            // @ts-ignore
            user.saved_colleges.push(collegeId);
        }

        await user.save();

        res.status(200).json({ success: true, message: 'College saved' });
    } catch (error) {
        logger.error('Error saving college:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Remove saved college
// @route   DELETE /api/saved/:id?type=indian
export const removeSavedCollege = async (req: Request, res: Response) => {
    try {
        const collegeId = req.params.id;
        const type = req.query.type || 'indian';

        // @ts-ignore
        const user = await User.findById(req.user?.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        if (type === 'international') {
            // @ts-ignore
            if (user.saved_international_colleges) {
                // @ts-ignore
                user.saved_international_colleges = user.saved_international_colleges.filter(id => id.toString() !== collegeId);
            }
        } else {
            // @ts-ignore
            if (user.saved_colleges) {
                // @ts-ignore
                user.saved_colleges = user.saved_colleges.filter(id => id.toString() !== collegeId);
            }
        }

        await user.save();
        res.status(200).json({ success: true, message: 'College removed from saved list' });
    } catch (error) {
        logger.error('Error removing saved college:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
