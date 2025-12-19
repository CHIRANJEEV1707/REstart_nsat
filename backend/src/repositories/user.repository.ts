import { BaseRepository } from './base.repository';
import User from '../models/User';


/**
 * User Repository
 * Handles all database operations for users
 */
export class UserRepository extends BaseRepository<typeof User.prototype> {
    constructor() {
        super(User);
    }

    /**
     * Find user by email
     */
    async findByEmail(email: string) {
        return this.model.findOne({ email }).exec();
    }

    /**
     * Find user by email with password (for authentication)
     */
    async findByEmailWithPassword(email: string) {
        return this.model.findOne({ email }).select('+password').exec();
    }

    /**
     * Update user profile
     */
    async updateProfile(userId: string, updates: Partial<typeof User.prototype>) {
        return this.model.findByIdAndUpdate(userId, updates, { new: true }).exec();
    }

    /**
     * Get users by role
     */
    async findByRole(role: string) {
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
    async updateOnboardingStatus(userId: string, step: number, completed: boolean = false) {
        return this.model.findByIdAndUpdate(
            userId,
            {
                onboardingStep: step,
                onboardingCompleted: completed,
            },
            { new: true }
        ).exec();
    }

    /**
     * Add saved college
     */
    async addSavedCollege(userId: string, collegeId: string, collegeType: 'indian' | 'international') {
        const field = collegeType === 'indian' ? 'saved_colleges' : 'saved_international_colleges';
        return this.model.findByIdAndUpdate(
            userId,
            { $addToSet: { [field]: collegeId } },
            { new: true }
        ).exec();
    }

    /**
     * Remove saved college
     */
    async removeSavedCollege(userId: string, collegeId: string, collegeType: 'indian' | 'international') {
        const field = collegeType === 'indian' ? 'saved_colleges' : 'saved_international_colleges';
        return this.model.findByIdAndUpdate(
            userId,
            { $pull: { [field]: collegeId } },
            { new: true }
        ).exec();
    }
}

export default new UserRepository();
