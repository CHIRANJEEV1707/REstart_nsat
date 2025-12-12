import express from 'express';
import { compareColleges } from '../controllers/compareController';

const router = express.Router();

router.post('/', compareColleges);

export default router;
