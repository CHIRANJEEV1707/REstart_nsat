"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const savedController_1 = require("../controllers/savedController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.use(auth_1.protect); // All routes protected
router.route('/')
    .get(savedController_1.getSavedColleges)
    .post(savedController_1.saveCollege);
router.route('/:id')
    .delete(savedController_1.removeSavedCollege);
exports.default = router;
