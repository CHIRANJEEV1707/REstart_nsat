import express from 'express';
import { register, login, getMe, logout, updateDetails, updatePassword, refresh, registerSchema, loginSchema } from '../controllers/authController';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { authLimiter } from '../middleware/rateLimiter';

import { loginLimiter } from '../middleware/security';

const router = express.Router();

// Apply rate limiting to auth endpoints
router.post('/signup', authLimiter, validate(registerSchema), register);
router.post('/login', loginLimiter, validate(loginSchema), login);
router.post('/logout', logout);
router.post('/refresh', refresh);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);

export default router;
