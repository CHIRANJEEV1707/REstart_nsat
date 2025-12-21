"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const collegeController_1 = require("../controllers/collegeController");
const trendingController_1 = require("../controllers/trendingController");
const router = express_1.default.Router();
router.route('/trending')
    .get(trendingController_1.getTrendingColleges);
router.route('/')
    .get(collegeController_1.getColleges);
router.route('/new-gen')
    .get(collegeController_1.getNewGenColleges);
router.route('/new-gen/:id')
    .get(collegeController_1.getNewGenCollege);
router.route('/international')
    .get(collegeController_1.getInternationalColleges);
router.route('/international/:id')
    .get(collegeController_1.getInternationalCollege);
router.route('/:id')
    .get(collegeController_1.getCollege);
exports.default = router;
