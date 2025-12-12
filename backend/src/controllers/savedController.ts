import { Request, Response } from 'express';
import User from '../models/User';
import College from '../models/College';

// @desc    Get saved colleges
// @route   GET /api/saved
export const getSavedColleges = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const user = await User.findById(req.user.id).populate('saved_colleges');
        if (!user || !user.saved_colleges) {
            return res.status(200).json({ success: true, count: 0, data: [] });
        }
        res.status(200).json({ success: true, count: user.saved_colleges.length, data: user.saved_colleges });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Save a college
// @route   POST /api/saved
export const saveCollege = async (req: Request, res: Response) => {
    try {
        const { collegeId } = req.body;

        // Check if college exists
        const college = await College.findById(collegeId);
        if (!college) return res.status(404).json({ success: false, message: 'College not found' });

        // @ts-ignore
        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        // Check if already saved
        // @ts-ignore
        const isSaved = user.saved_colleges.some(id => id.toString() === collegeId);

        if (isSaved) {
            return res.status(400).json({ success: false, message: 'College already saved' });
        }

        // @ts-ignore
        user.saved_colleges.push(collegeId);
        await user.save();

        res.status(200).json({ success: true, message: 'College saved' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Remove saved college
// @route   DELETE /api/saved/:id
export const removeSavedCollege = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        // @ts-ignore
        user.saved_colleges = user.saved_colleges.filter(id => id.toString() !== req.params.id);
        await user.save();
        res.status(200).json({ success: true, message: 'College removed from saved list' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
