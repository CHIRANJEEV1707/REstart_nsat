"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const NewGenCollege_1 = __importDefault(require("../models/NewGenCollege"));
const mongoose_1 = __importDefault(require("mongoose"));
const router = express_1.default.Router();
// Get all New-Gen colleges
router.get('/', async (req, res) => {
    try {
        const colleges = await NewGenCollege_1.default.find();
        res.json({
            success: true,
            data: colleges
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error });
    }
});
// Get single New-Gen college
router.get('/:id', async (req, res) => {
    try {
        if (!mongoose_1.default.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid College ID Format' });
        }
        const college = await NewGenCollege_1.default.findById(req.params.id);
        if (!college) {
            return res.status(404).json({ success: false, message: 'College not found' });
        }
        res.json({
            success: true,
            data: college
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error });
    }
});
exports.default = router;
