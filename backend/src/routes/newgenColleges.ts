import express from 'express';
import NewGenCollege from '../models/NewGenCollege';
import mongoose from 'mongoose';

const router = express.Router();

// Get all New-Gen colleges
router.get('/', async (req, res) => {
    try {
        const colleges = await NewGenCollege.find();
        res.json({
            success: true,
            data: colleges
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error });
    }
});

// Get single New-Gen college
router.get('/:id', async (req, res) => {
    try {


        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {

            return res.status(400).json({ success: false, message: 'Invalid College ID Format' });
        }

        const college = await NewGenCollege.findById(req.params.id);

        if (!college) {
            return res.status(404).json({ success: false, message: 'College not found' });
        }
        res.json({
            success: true,
            data: college
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error });
    }
});


export default router;
