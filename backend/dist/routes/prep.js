"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prepController_1 = require("../controllers/prepController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post('/plans', auth_1.protect, prepController_1.createPrepPlan);
router.get('/plans/my', auth_1.protect, prepController_1.getMyPlan);
exports.default = router;
