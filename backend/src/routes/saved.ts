import express from 'express';
import { getSavedColleges, saveCollege, removeSavedCollege } from '../controllers/savedController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect); // All routes protected

router.route('/')
    .get(getSavedColleges)
    .post(saveCollege);

router.route('/:id')
    .delete(removeSavedCollege);

export default router;
