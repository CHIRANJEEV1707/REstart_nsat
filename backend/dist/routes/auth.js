"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const rateLimiter_1 = require("../middleware/rateLimiter");
const security_1 = require("../middleware/security");
const router = express_1.default.Router();
// Apply rate limiting to auth endpoints
router.post('/signup', rateLimiter_1.authLimiter, (0, validate_1.validate)(authController_1.registerSchema), authController_1.register);
router.post('/login', security_1.loginLimiter, (0, validate_1.validate)(authController_1.loginSchema), authController_1.login);
router.post('/logout', authController_1.logout);
router.get('/me', auth_1.protect, authController_1.getMe);
router.put('/updatedetails', auth_1.protect, authController_1.updateDetails);
router.put('/updatepassword', auth_1.protect, authController_1.updatePassword);
exports.default = router;
