import express from 'express';
import { protect } from '../middleware/auth';
import { getDashboardRecommendations } from '../controllers/recommendationController';

const router = express.Router();

router.get('/dashboard', protect, getDashboardRecommendations);

export default router;
