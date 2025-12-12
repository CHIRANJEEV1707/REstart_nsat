import express from 'express';
import { getInternationalColleges, getInternationalCollege } from '../controllers/internationalCollegeController';
// import { protect, authorize } from '../middleware/auth'; // Optional: if we want to protect these routes later

const router = express.Router();

router
    .route('/')
    .get(getInternationalColleges);

router
    .route('/:id')
    .get(getInternationalCollege);

export default router;
