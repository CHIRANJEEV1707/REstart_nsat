import express from 'express';
import { createPlan, getMyPlan } from '../controllers/prepController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.route('/plans')
    .post(createPlan);

router.route('/plans/my')
    .get(getMyPlan);

export default router;
