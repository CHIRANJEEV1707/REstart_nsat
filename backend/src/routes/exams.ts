import express from 'express';
import { getExams, getExam } from '../controllers/examController';

const router = express.Router();

router.route('/')
    .get(getExams);

router.route('/:id')
    .get(getExam);

export default router;
