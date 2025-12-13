import express from 'express';
import { saveOnboarding, getProfile } from '../controllers/userController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/onboarding', protect, saveOnboarding);
router.get('/profile', protect, getProfile);

export default router;
