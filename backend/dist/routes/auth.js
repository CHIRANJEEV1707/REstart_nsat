"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
// import { protect } from '../middleware/auth'; // Placeholder for auth middleware
const validate_1 = require("../middleware/validate");
const router = express_1.default.Router();
router.post('/signup', (0, validate_1.validate)(authController_1.registerSchema), authController_1.register);
router.post('/login', (0, validate_1.validate)(authController_1.loginSchema), authController_1.login);
router.post('/logout', authController_1.logout);
// router.get('/me', protect, getMe); 
router.get('/me', authController_1.getMe); // Temporarily unprotected until auth middleware is also refactored
exports.default = router;
