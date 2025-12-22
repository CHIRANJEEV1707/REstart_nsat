"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get('/profile', auth_1.protect, userController_1.getProfile);
router.patch('/profile', auth_1.protect, userController_1.updateProfile); // Basic Info
router.post('/preferences', auth_1.protect, userController_1.savePreferences); // Full Preferences (or PATCH alias if we prefer)
router.patch('/preferences', auth_1.protect, userController_1.savePreferences); // Alias for consistency
router.patch('/exams', auth_1.protect, userController_1.updateExams); // Exam Scores
exports.default = router;
