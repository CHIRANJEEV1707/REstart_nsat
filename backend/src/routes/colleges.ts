import express from 'express';
import { getColleges, getCollege } from '../controllers/collegeController';

const router = express.Router();

router.route('/')
    .get(getColleges);

router.route('/:id')
    .get(getCollege);

export default router;
