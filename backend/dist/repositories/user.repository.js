"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const base_repository_1 = require("./base.repository");
const User_1 = __importDefault(require("../models/User"));
/**
 * User Repository
 * Handles all database operations for users
 */
class UserRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(User_1.default);
    }
    /**
     * Find user by email
     */
    async findByEmail(email) {
        return this.model.findOne({ email }).exec();
    }
    /**
     * Find user by email with password (for authentication)
     */
    async findByEmailWithPassword(email) {
        return this.model.findOne({ email }).select('+password').exec();
    }
    /**
     * Update user profile
     */
    async updateProfile(userId, updates) {
        return this.model.findByIdAndUpdate(userId, updates, { new: true }).exec();
    }
    /**
     * Get users by role
     */
    async findByRole(role) {
        return this.model.find({ role }).exec();
    }
    /**
     * Get users with incomplete onboarding
     */
    async findIncompleteOnboarding() {
        return this.model.find({ onboardingCompleted: false }).exec();
    }
    /**
     * Update onboarding status
     */
    async updateOnboardingStatus(userId, step, completed = false) {
        return this.model.findByIdAndUpdate(userId, {
            onboardingStep: step,
            onboardingCompleted: completed,
        }, { new: true }).exec();
    }
    /**
     * Add saved college
     */
    async addSavedCollege(userId, collegeId, collegeType) {
        const field = collegeType === 'indian' ? 'saved_colleges' : 'saved_international_colleges';
        return this.model.findByIdAndUpdate(userId, { $addToSet: { [field]: collegeId } }, { new: true }).exec();
    }
    /**
     * Remove saved college
     */
    async removeSavedCollege(userId, collegeId, collegeType) {
        const field = collegeType === 'indian' ? 'saved_colleges' : 'saved_international_colleges';
        return this.model.findByIdAndUpdate(userId, { $pull: { [field]: collegeId } }, { new: true }).exec();
    }
}
exports.UserRepository = UserRepository;
exports.default = new UserRepository();
