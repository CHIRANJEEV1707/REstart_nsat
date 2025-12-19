import express from 'express';
import { createPrepPlan, getMyPlan } from '../controllers/prepController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/plans', protect, createPrepPlan);
router.get('/plans/my', protect, getMyPlan);

export default router;
