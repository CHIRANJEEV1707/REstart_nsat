const User = require('../models/User');
const College = require('../models/College');

// @desc    Get saved colleges
// @route   GET /api/saved
exports.getSavedColleges = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('saved_colleges');
        res.status(200).json({ success: true, count: user.saved_colleges.length, data: user.saved_colleges });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Save a college
// @route   POST /api/saved
exports.saveCollege = async (req, res) => {
    try {
        const { collegeId } = req.body;

        // Check if college exists
        const college = await College.findById(collegeId);
        if (!college) return res.status(404).json({ success: false, message: 'College not found' });

        const user = await User.findById(req.user.id);

        // Check if already saved
        if (user.saved_colleges.includes(collegeId)) {
            return res.status(400).json({ success: false, message: 'College already saved' });
        }

        user.saved_colleges.push(collegeId);
        await user.save();

        res.status(200).json({ success: true, message: 'College saved' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Remove saved college
// @route   DELETE /api/saved/:id
exports.removeSavedCollege = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        user.saved_colleges = user.saved_colleges.filter(id => id.toString() !== req.params.id);
        await user.save();
        res.status(200).json({ success: true, message: 'College removed from saved list' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
