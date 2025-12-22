"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const UserSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['student', 'admin'], default: 'student', index: true },
    onboardingCompleted: { type: Boolean, default: false, index: true },
    onboardingStep: { type: Number, default: 0 },
    profile: {
        city: String,
        state: String,
        country: String,
        phoneNumber: String
    },
    preferences: {
        goal: String,
        // New Strict Budget Schema
        budget: {
            currency: {
                type: String,
                enum: ['INR', 'USD'],
                default: 'INR'
            },
            amount: {
                type: Number,
                required: false // Validated in controller
            }
        },
        preferredCountries: [String],
        preferredStates: [String],
        collegeTypes: [String],
        // New Strict Degree Schema (Multi-select)
        targetDegree: {
            type: [String],
            default: []
        },
        // New Strict Exam Scores
        examScores: [{
                exam: { type: String, required: true },
                score: { type: Number, required: true, min: 0 },
                fullMarks: { type: Number, required: true, min: 1 },
                rank: { type: Number },
                _id: false
            }],
        newGenInterest: { type: Boolean, default: false },
        collegeTypePreference: {
            type: String,
            enum: ["prefer_new_gen", "neutral", "prefer_traditional"],
            default: null
        }
    },
    // Legacy / top-level fields
    state: String,
    city: String,
    country: String,
    class_level: String,
    target_degree: {
        type: [String], // Updated to array
        default: []
    },
    college_type_aspiring: [String],
    preferred_countries: [String],
    target_exams: [String],
    saved_colleges: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'College' }],
    saved_international_colleges: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'InternationalCollege' }],
    saved_newgen_colleges: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'NewGenCollege' }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});
UserSchema.pre('save', async function () {
    this.updatedAt = new Date();
});
UserSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcryptjs_1.default.genSalt(10);
    this.password = await bcryptjs_1.default.hash(this.password, salt);
});
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcryptjs_1.default.compare(enteredPassword, this.password);
};
exports.default = mongoose_1.default.model('User', UserSchema);
