import express from 'express';
import { getAlerts } from '../controllers/alertController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.get('/', protect, getAlerts);

export default router;
