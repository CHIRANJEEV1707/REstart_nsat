const PrepPlan = require('../models/PrepPlan');
const Exam = require('../models/Exam');

// @desc    Create Prep Plan
// @route   POST /api/prep/plans
exports.createPlan = async (req, res) => {
    try {
        const { examId, durationWeeks } = req.body;

        // Check if exam valid
        const exam = await Exam.findById(examId);
        if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

        // Simple logic to generate dummy weeks based on duration
        const subjects = ['Physics', 'Chemistry', 'Maths'];
        const weeks = [];
        for (let i = 1; i <= durationWeeks; i++) {
            weeks.push({
                weekNumber: i,
                subjects: {
                    Physics: [`Topic P${i}-A`, `Topic P${i}-B`],
                    Chemistry: [`Topic C${i}-A`],
                    Math: [`Topic M${i}-A`, `Topic M${i}-B`]
                },
                completed: false
            });
        }

        const plan = await PrepPlan.create({
            user: req.user.id,
            exam: examId,
            weeks
        });

        res.status(201).json({ success: true, data: plan });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get My Plan
// @route   GET /api/prep/plans/my
exports.getMyPlan = async (req, res) => {
    try {
        const plan = await PrepPlan.findOne({ user: req.user.id }).populate('exam');
        res.status(200).json({ success: true, data: plan });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
