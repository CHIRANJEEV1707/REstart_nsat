import express from 'express';
import { getSavedColleges, saveCollege, removeSavedCollege } from '../controllers/savedController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect); // All routes protected

// Mount routes
router.route('/')
    .get(getSavedColleges)
    .post(saveCollege); // This handles POST /api/saved

router.route('/:id')
    .post(saveCollege) // Legacy
    .delete(removeSavedCollege);

export default router;
