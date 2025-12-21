"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const ReminderSchema = new mongoose_1.default.Schema({
    user: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['exam_date', 'application_deadline', 'custom'], required: true },
    title: String,
    date: { type: Date, required: true },
    isSent: { type: Boolean, default: false }
});
const Reminder = mongoose_1.default.model('Reminder', ReminderSchema);
exports.default = Reminder;
