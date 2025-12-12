import express from 'express';
import { register, login, getMe, logout, registerSchema, loginSchema } from '../controllers/authController';
// import { protect } from '../middleware/auth'; // Placeholder for auth middleware
import { validate } from '../middleware/validate';

const router = express.Router();

router.post('/signup', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/logout', logout);
// router.get('/me', protect, getMe); 
router.get('/me', getMe); // Temporarily unprotected until auth middleware is also refactored

export default router;
