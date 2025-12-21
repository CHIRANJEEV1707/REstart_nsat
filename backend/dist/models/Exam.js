"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const ExamSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    code: { type: String, unique: true }, // e.g. JEEMAIN
    description: String,
    dates: {
        registration_start: Date,
        registration_end: Date,
        exam_date_start: Date,
        exam_date_end: Date
    },
    eligibility: String,
    syllabus_url: String,
    website: String
});
const Exam = mongoose_1.default.model('Exam', ExamSchema);
exports.default = Exam;
