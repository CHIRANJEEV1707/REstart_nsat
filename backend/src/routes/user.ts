import express, { RequestHandler } from 'express';
import { savePreferences, getProfile, updateProfile, updateExams } from '../controllers/userController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.get('/profile', protect as RequestHandler, getProfile as RequestHandler);
router.patch('/profile', protect as RequestHandler, updateProfile as RequestHandler); // Basic Info
router.post('/preferences', protect as RequestHandler, savePreferences as RequestHandler); // Full Preferences (or PATCH alias if we prefer)
router.patch('/preferences', protect as RequestHandler, savePreferences as RequestHandler); // Alias for consistency
router.patch('/exams', protect as RequestHandler, updateExams as RequestHandler); // Exam Scores

export default router;
