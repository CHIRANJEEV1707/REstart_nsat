"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const internationalCollegeController_1 = require("../controllers/internationalCollegeController");
// import { protect, authorize } from '../middleware/auth'; // Optional: if we want to protect these routes later
const router = express_1.default.Router();
router
    .route('/')
    .get(internationalCollegeController_1.getInternationalColleges);
router
    .route('/:id')
    .get(internationalCollegeController_1.getInternationalCollege);
exports.default = router;
