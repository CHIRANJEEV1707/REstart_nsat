import express from 'express';
import { getColleges, getCollege, getNewGenColleges, getInternationalColleges, getNewGenCollege, getInternationalCollege } from '../controllers/collegeController';

import { getTrendingColleges } from '../controllers/trendingController';
import { protect } from '../middleware/auth'; // Ensure this exists or use check

const router = express.Router();

router.route('/trending')
    .get(getTrendingColleges);



router.route('/')
    .get(getColleges);

router.route('/new-gen')
    .get(getNewGenColleges);

router.route('/new-gen/:id')
    .get(getNewGenCollege);

router.route('/international')
    .get(getInternationalColleges);

router.route('/international/:id')
    .get(getInternationalCollege);

router.route('/:id')
    .get(getCollege);

export default router;
